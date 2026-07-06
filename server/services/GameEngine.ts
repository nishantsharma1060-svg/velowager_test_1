import { GameRound, Bet, db } from '../db.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { ColorTradingGame } from './ColorTradingGame.js';
import { IGame } from '../interfaces/IGame.js';

export interface RoundState {
  id?: string;
  gameId: string;
  gameMode: string;
  periodNumber: string;
  status: 'betting' | 'closed' | 'settled';
  timeLeft: number; // in seconds
  totalTime: number; // 30, 60, 180, 300
  closeTime: number; // last 5 or 10 seconds
}

export class GameEngine {
  private gameRepo = new GameRepository();
  private registeredGames = new Map<string, IGame>();
  
  // In-memory runtime state for live counters
  private activeStates = new Map<string, RoundState>();
  private isTicking = false;
  
  // Admin manual overrides cache: roundId -> manual outcome
  private manualOverrides = new Map<string, { color?: string; number?: number }>();

  constructor() {
    // Register the MVP color trading game
    const ct = new ColorTradingGame();
    this.registeredGames.set(ct.id, ct);
  }

  /**
   * Register any future modular games without modifying the engine code
   */
  public registerGame(game: IGame) {
    this.registeredGames.set(game.id, game);
  }

  /**
   * Fetch active real-time status of all running modes for clients
   */
  public getLiveStates(): RoundState[] {
    return Array.from(this.activeStates.values());
  }

  /**
   * Set manual override result for admin
   */
  public setManualOverride(roundId: string, result: { color?: string; number?: number }) {
    this.manualOverrides.set(roundId, result);
    // Persist to round in DB for audit trailing
    this.gameRepo.updateRound(roundId, {
      resultStrategy: 'admin_manual'
    });
  }

  /**
   * Synchronize & launch the master clock tick handler
   */
  public startClock() {
    
    // Core tick loop every 1 second
    setInterval(() => {
      if (this.isTicking) return;
      this.isTicking = true;
      this.tick().finally(() => { this.isTicking = false; });
    }, 1000);
  }

  private async tick() {
    try {
      const now = new Date();
      // Period IDs must be independent of the host machine's timezone.
      // The date portion below is UTC, so calculate the daily sequence in UTC too.
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();
      const seconds = now.getUTCSeconds();
      const totalSecondsToday = hours * 3600 + minutes * 60 + seconds;

      const modesConfig = [
        { mode: '30s', total: 30, close: 5 },
        { mode: '1m', total: 60, close: 5 },
        { mode: '3m', total: 180, close: 10 },
        { mode: '5m', total: 300, close: 10 }
      ];

      const todayStr = now.toISOString().slice(0, 10).replace(/-/g, '');

      for (const gameId of this.registeredGames.keys()) {
        const gameObj = this.registeredGames.get(gameId)!;

        for (const config of modesConfig) {
          const key = `${gameId}_${config.mode}`;
          
          // Calculate current round sequence of the day
          const currentRoundIndex = Math.floor(totalSecondsToday / config.total);
          const nextRoundIndex = currentRoundIndex + 1;
          const timeLeft = config.total - (totalSecondsToday % config.total);

          const formattedPeriod = `${todayStr}${config.mode.toUpperCase()}${String(currentRoundIndex).padStart(4, '0')}`;

          let state = this.activeStates.get(key);

          if (!state || state.periodNumber !== formattedPeriod) {
            // It is either startup or we rolled over to a brand new round period
            if (state) {
              // Settle previous round that just ended
              this.handleRoundSettle(gameId, config.mode, state.periodNumber).catch((err) => {
                console.error(`Failed to execute handleRoundSettle for ${gameId} ${config.mode} round ${state?.periodNumber}:`, err);
              });
            }

            // Create new round in db or get existing active one
            let dbRound = await this.gameRepo.findRoundByPeriod(gameId, config.mode, formattedPeriod);
            let isNew = false;
            if (!dbRound) {
              dbRound = await this.gameRepo.createRound({
                gameId,
                gameMode: config.mode,
                periodNumber: formattedPeriod,
                status: 'betting',
                resultStrategy: 'fair'
              });
              isNew = true;
            }

            state = {
              id: dbRound.id,
              gameId,
              gameMode: config.mode,
              periodNumber: formattedPeriod,
              status: dbRound.status as 'betting' | 'closed' | 'settled',
              timeLeft,
              totalTime: config.total,
              closeTime: config.close
            };

            this.activeStates.set(key, state);

            // Recover rounds left open by a restart, cold start, or transient DB error.
            const staleRounds = await this.gameRepo.getStaleUnsettledRounds(gameId, config.mode, formattedPeriod);
            for (const staleRound of staleRounds.reverse()) {
              await this.handleRoundSettle(gameId, config.mode, staleRound.periodNumber);
            }
            
            // Invoke optional game start hook
            if (isNew) {
              gameObj.onRoundStart(dbRound).catch(console.error);
            }
          } else {
            // Standard countdown decrement
            state.timeLeft = timeLeft;

            // Check if we entered the closed betting phase
            if (timeLeft <= config.close && state.status === 'betting') {
              state.status = 'closed';
              
              // Persist closed status in database
              // Close this exact live round. Looking up any active round can select
              // a stale period created by an instance running in another timezone.
              const dbRound = state.id
                ? await this.gameRepo.findRoundById(state.id)
                : await this.gameRepo.findRoundByPeriod(gameId, config.mode, state.periodNumber);
              if (dbRound && dbRound.status === 'betting') {
                await this.gameRepo.updateRound(dbRound.id, {
                  status: 'closed',
                  closedAt: new Date().toISOString()
                });

                // Invoke optional close hook
                gameObj.onRoundClose(dbRound).catch(console.error);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('GameEngine tick error:', err);
    }
  }

  private async handleRoundSettle(gameId: string, mode: string, periodNumber: string) {
    try {
      // 1. Locate the round in database directly instead of reading from a stale cache
      const round = await this.gameRepo.findRoundByPeriod(gameId, mode, periodNumber);
      if (!round || round.status === 'settled') return;

      const gameHandler = this.registeredGames.get(gameId);
      if (!gameHandler) return;

      // 2. Fetch all bets placed on this round
      const bets = await this.gameRepo.getBetsByRoundId(round.id);

      // Check for admin manual override
      const override = this.manualOverrides.get(round.id);

      // 3. Compute outcomes & update wallets using modular rules
      const settlement = await gameHandler.settleRound(round, bets, override);

      // 4. Update the round record with final results
      await this.gameRepo.updateRound(round.id, {
        status: 'settled',
        resultColor: settlement.resultColor,
        resultNumber: settlement.resultNumber,
        totalWinAmount: settlement.totalWinAmount,
        settledAt: new Date().toISOString()
      });

      // 5. Update each individual bet record in DB
      for (const item of settlement.settledBets) {
        await this.gameRepo.updateBetSettlement(
          item.betId,
          item.status,
          item.winningAmount,
          item.winFeeDeducted
        );
      }

      // Cleanup override cache for memory safety
      this.manualOverrides.delete(round.id);
      
    } catch (err) {
      console.error(`Error settling round for ${gameId} ${mode} ${periodNumber}:`, err);
    }
  }
}

export const gameEngine = new GameEngine();
