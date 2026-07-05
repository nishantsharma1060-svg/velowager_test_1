import { GameRound } from '../db.js';

export interface IGame {
  id: string; // Unique game identifier e.g. 'color-trading'
  name: string;
  modes: string[]; // Supported modes e.g. ['30s', '1m', '3m', '5m']
  
  /**
   * Called when a new round starts.
   */
  onRoundStart(round: GameRound): Promise<void>;

  /**
   * Called when betting closes for a round (e.g. 5 seconds before result).
   */
  onRoundClose(round: GameRound): Promise<void>;

  /**
   * Calculates result and settles all bets for the round.
   * Returns final result details to store in the round record.
   */
  settleRound(
    round: GameRound, 
    bets: any[], 
    manualResult?: { color?: string; number?: number }
  ): Promise<{
    resultColor: string;
    resultNumber: number;
    totalWinAmount: number;
    settledBets: Array<{
      betId: string;
      winningAmount: number;
      status: 'won' | 'lost';
      winFeeDeducted: number;
    }>;
  }>;
}
