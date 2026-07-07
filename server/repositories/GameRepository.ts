import { db as pgDb } from '../../src/db/index.ts';
import { games, gameRounds, bets } from '../../src/db/schema.ts';
import { Game, GameRound, Bet, db as fileDb } from '../db.js';
import { eq, and, ne, desc } from 'drizzle-orm';

export class GameRepository {
  async getGameById(id: string): Promise<Game | null> {
    if (fileDb.isOffline) {
      const g = fileDb.games.find(x => x.id === id);
      return g ? { ...g } : null;
    }

    try {
      const result = await pgDb.select().from(games).where(eq(games.id, id));
      return result[0] ? { ...result[0] } : null;
    } catch (err) {
      console.error('GameRepository getGameById failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getAllGames(): Promise<Game[]> {
    if (fileDb.isOffline) {
      return [...fileDb.games];
    }

    try {
      const result = await pgDb.select().from(games);
      return result as Game[];
    } catch (err) {
      console.error('GameRepository getAllGames failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateGameStatus(id: string, isEnabled: boolean): Promise<Game | null> {
    if (fileDb.isOffline) {
      const g = fileDb.games.find(x => x.id === id);
      if (g) {
        g.isEnabled = isEnabled;
        await fileDb.save();
      }
      return g ? { ...g } : null;
    }

    try {
      await pgDb.update(games).set({ isEnabled }).where(eq(games.id, id));
      return this.getGameById(id);
    } catch (err) {
      console.error('GameRepository updateGameStatus failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async createRound(round: Omit<GameRound, 'id' | 'totalBetAmount' | 'totalWinAmount' | 'createdAt'>): Promise<GameRound> {
    const id = 'round-' + Math.random().toString(36).substr(2, 9);
    const newRound = {
      id,
      gameId: round.gameId,
      gameMode: round.gameMode,
      periodNumber: round.periodNumber,
      status: round.status || 'betting',
      resultColor: round.resultColor || null,
      resultNumber: round.resultNumber !== undefined ? round.resultNumber : null,
      totalBetAmount: 0,
      totalWinAmount: 0,
      resultStrategy: round.resultStrategy || 'fair',
      createdAt: new Date(),
    };

    if (fileDb.isOffline) {
      const offlineRound: GameRound = {
        ...newRound,
        resultColor: newRound.resultColor || undefined,
        resultNumber: newRound.resultNumber !== null ? newRound.resultNumber : undefined,
        createdAt: newRound.createdAt.toISOString()
      };
      fileDb.rounds.push(offlineRound);
      await fileDb.save();
      return offlineRound;
    }

    try {
      await pgDb.insert(gameRounds).values(newRound);
      return {
        ...newRound,
        createdAt: newRound.createdAt.toISOString()
      } as GameRound;
    } catch (err) {
      console.error('GameRepository createRound failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getActiveRound(gameId: string, gameMode: string): Promise<GameRound | null> {
    if (fileDb.isOffline) {
      const result = fileDb.rounds
        .filter(r => r.gameId === gameId && r.gameMode === gameMode && r.status !== 'settled')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return result[0] || null;
    }

    try {
      const result = await pgDb.select().from(gameRounds)
        .where(and(eq(gameRounds.gameId, gameId), eq(gameRounds.gameMode, gameMode), ne(gameRounds.status, 'settled')))
        .orderBy(desc(gameRounds.createdAt));
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString(),
        closedAt: result[0].closedAt?.toISOString() || undefined,
        settledAt: result[0].settledAt?.toISOString() || undefined,
      } as GameRound;
    } catch (err) {
      console.error('GameRepository getActiveRound failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getStaleUnsettledRounds(gameId: string, gameMode: string, currentPeriod: string): Promise<GameRound[]> {
    const result = await pgDb.select().from(gameRounds)
      .where(and(
        eq(gameRounds.gameId, gameId),
        eq(gameRounds.gameMode, gameMode),
        ne(gameRounds.status, 'settled'),
        ne(gameRounds.periodNumber, currentPeriod)
      ))
      .orderBy(desc(gameRounds.createdAt))
      .limit(20);
    return result.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      closedAt: r.closedAt?.toISOString() || undefined,
      settledAt: r.settledAt?.toISOString() || undefined,
    })) as GameRound[];
  }

  async findRoundById(id: string): Promise<GameRound | null> {
    if (fileDb.isOffline) {
      const r = fileDb.rounds.find(x => x.id === id);
      return r ? { ...r } : null;
    }

    try {
      const result = await pgDb.select().from(gameRounds).where(eq(gameRounds.id, id));
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString(),
        closedAt: result[0].closedAt?.toISOString() || undefined,
        settledAt: result[0].settledAt?.toISOString() || undefined,
      } as GameRound;
    } catch (err) {
      console.error('GameRepository findRoundById failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async findRoundByPeriod(gameId: string, gameMode: string, periodNumber: string): Promise<GameRound | null> {
    if (fileDb.isOffline) {
      const r = fileDb.rounds.find(x => x.gameId === gameId && x.gameMode === gameMode && x.periodNumber === periodNumber);
      return r ? { ...r } : null;
    }

    try {
      const result = await pgDb.select().from(gameRounds)
        .where(and(
          eq(gameRounds.gameId, gameId),
          eq(gameRounds.gameMode, gameMode),
          eq(gameRounds.periodNumber, periodNumber)
        ));
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString(),
        closedAt: result[0].closedAt?.toISOString() || undefined,
        settledAt: result[0].settledAt?.toISOString() || undefined,
      } as GameRound;
    } catch (err) {
      console.error('GameRepository findRoundByPeriod failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateRound(id: string, updates: Partial<Omit<GameRound, 'id' | 'gameId' | 'gameMode' | 'createdAt'>>): Promise<GameRound | null> {
    if (fileDb.isOffline) {
      const r = fileDb.rounds.find(x => x.id === id);
      if (r) {
        Object.assign(r, updates);
        await fileDb.save();
      }
      return r ? { ...r } : null;
    }

    try {
      const dbUpdates: any = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.resultColor !== undefined) dbUpdates.resultColor = updates.resultColor;
      if (updates.resultNumber !== undefined) dbUpdates.resultNumber = updates.resultNumber;
      if (updates.totalBetAmount !== undefined) dbUpdates.totalBetAmount = updates.totalBetAmount;
      if (updates.totalWinAmount !== undefined) dbUpdates.totalWinAmount = updates.totalWinAmount;
      if (updates.resultStrategy !== undefined) dbUpdates.resultStrategy = updates.resultStrategy;
      if (updates.closedAt !== undefined) dbUpdates.closedAt = updates.closedAt ? new Date(updates.closedAt) : null;
      if (updates.settledAt !== undefined) dbUpdates.settledAt = updates.settledAt ? new Date(updates.settledAt) : null;

      await pgDb.update(gameRounds).set(dbUpdates).where(eq(gameRounds.id, id));
      return this.findRoundById(id);
    } catch (err) {
      console.error('GameRepository updateRound failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getRoundsHistory(gameId: string, gameMode: string, limit: number = 30): Promise<GameRound[]> {
    if (fileDb.isOffline) {
      return fileDb.rounds
        .filter(r => r.gameId === gameId && r.gameMode === gameMode && r.status === 'settled')
        .sort((a, b) => {
          const bTime = new Date(b.settledAt || b.createdAt).getTime();
          const aTime = new Date(a.settledAt || a.createdAt).getTime();
          return bTime - aTime;
        })
        .slice(0, limit);
    }

    try {
      const result = await pgDb.select().from(gameRounds)
        .where(and(eq(gameRounds.gameId, gameId), eq(gameRounds.gameMode, gameMode), eq(gameRounds.status, 'settled')))
        .orderBy(desc(gameRounds.settledAt), desc(gameRounds.createdAt))
        .limit(limit);
      return result.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        closedAt: r.closedAt?.toISOString() || undefined,
        settledAt: r.settledAt?.toISOString() || undefined,
      })) as GameRound[];
    } catch (err) {
      console.error('GameRepository getRoundsHistory failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async createBet(bet: Omit<Bet, 'id' | 'winningAmount' | 'status' | 'winFeeDeducted' | 'createdAt'>): Promise<Bet> {
    const id = 'bet-' + Math.random().toString(36).substr(2, 9);
    const newBet = {
      id,
      roundId: bet.roundId,
      userId: bet.userId,
      gameId: bet.gameId,
      gameMode: bet.gameMode,
      periodNumber: bet.periodNumber,
      betType: bet.betType,
      betValue: bet.betValue,
      amount: bet.amount,
      winningAmount: 0,
      status: 'pending' as const,
      winFeeDeducted: 0,
      createdAt: new Date(),
    };

    if (fileDb.isOffline) {
      const offlineBet: Bet = {
        ...newBet,
        createdAt: newBet.createdAt.toISOString()
      };
      fileDb.bets.push(offlineBet);
      
      const r = fileDb.rounds.find(x => x.id === bet.roundId);
      if (r) {
        r.totalBetAmount = Number(((r.totalBetAmount ?? 0) + bet.amount).toFixed(2));
      }
      await fileDb.save();
      return offlineBet;
    }

    try {
      await pgDb.insert(bets).values(newBet);

      // Increment round total bet amount
      const round = await this.findRoundById(bet.roundId);
      if (round) {
        const totalBetAmount = Number(((round.totalBetAmount ?? 0) + bet.amount).toFixed(2));
        await pgDb.update(gameRounds).set({ totalBetAmount }).where(eq(gameRounds.id, bet.roundId));
      }

      return {
        ...newBet,
        createdAt: newBet.createdAt.toISOString()
      } as Bet;
    } catch (err) {
      console.error('GameRepository createBet failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getBetsByRoundId(roundId: string): Promise<Bet[]> {
    if (fileDb.isOffline) {
      return fileDb.bets.filter(x => x.roundId === roundId);
    }

    try {
      const result = await pgDb.select().from(bets).where(eq(bets.roundId, roundId));
      return result.map(b => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        settledAt: b.settledAt?.toISOString() || undefined,
      })) as Bet[];
    } catch (err) {
      console.error('GameRepository getBetsByRoundId failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateBetSettlement(betId: string, status: 'won' | 'lost', winningAmount: number, winFeeDeducted: number): Promise<Bet | null> {
    if (fileDb.isOffline) {
      const b = fileDb.bets.find(x => x.id === betId);
      if (b) {
        b.status = status;
        b.winningAmount = Number(winningAmount.toFixed(2));
        b.winFeeDeducted = Number(winFeeDeducted.toFixed(2));
        b.settledAt = new Date().toISOString();
        await fileDb.save();
      }
      return b ? { ...b } : null;
    }

    try {
      await pgDb.update(bets).set({
        status,
        winningAmount: Number(winningAmount.toFixed(2)),
        winFeeDeducted: Number(winFeeDeducted.toFixed(2)),
        settledAt: new Date(),
      }).where(eq(bets.id, betId));
      
      const result = await pgDb.select().from(bets).where(eq(bets.id, betId));
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString(),
        settledAt: result[0].settledAt?.toISOString() || undefined,
      } as Bet;
    } catch (err) {
      console.error('GameRepository updateBetSettlement failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getBetsByUserId(userId: string, limit: number = 50): Promise<Bet[]> {
    if (fileDb.isOffline) {
      return fileDb.bets
        .filter(x => x.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    }

    try {
      const result = await pgDb.select().from(bets)
        .where(eq(bets.userId, userId))
        .orderBy(desc(bets.createdAt))
        .limit(limit);
      return result.map(b => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        settledAt: b.settledAt?.toISOString() || undefined,
      })) as Bet[];
    } catch (err) {
      console.error('GameRepository getBetsByUserId failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateBetValue(betId: string, betValue: string): Promise<void> {
    if (fileDb.isOffline) {
      const bet = fileDb.bets.find(item => item.id === betId);
      if (bet) { bet.betValue = betValue; await fileDb.save(); }
      return;
    }
    await pgDb.update(bets).set({ betValue }).where(eq(bets.id, betId));
  }

  async getAllBets(limit: number = 100): Promise<Bet[]> {
    if (fileDb.isOffline) {
      return [...fileDb.bets]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    }

    try {
      const result = await pgDb.select().from(bets)
        .orderBy(desc(bets.createdAt))
        .limit(limit);
      return result.map(b => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        settledAt: b.settledAt?.toISOString() || undefined,
      })) as Bet[];
    } catch (err) {
      console.error('GameRepository getAllBets failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }
}
