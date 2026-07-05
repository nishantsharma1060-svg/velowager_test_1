import { IGame } from '../interfaces/IGame.js';
import { GameRound, Bet, db } from '../db.js';
import { WalletService } from './WalletService.js';
import { ReferralRepository } from '../repositories/ReferralRepository.js';

export class ColorTradingGame implements IGame {
  public id = 'color-trading';
  public name = 'Color Trading (WinGo)';
  public modes = ['30s', '1m', '3m', '5m'];

  private walletService = new WalletService();
  private referralRepo = new ReferralRepository();

  async onRoundStart(round: GameRound): Promise<void> {
    // Can hook up dynamic notification or server events here if necessary
  }

  async onRoundClose(round: GameRound): Promise<void> {
    // Close betting period
  }

  /**
   * Helper to map number to its typical color attributes in standard WinGo
   */
  public getNumberAttributes(num: number): { color: string; colorSecondary?: string } {
    if (num === 0) {
      return { color: 'red', colorSecondary: 'violet' }; // 0 is Red & Violet
    }
    if (num === 5) {
      return { color: 'green', colorSecondary: 'violet' }; // 5 is Green & Violet
    }
    if ([1, 3, 7, 9].includes(num)) {
      return { color: 'green' };
    }
    // 2, 4, 6, 8
    return { color: 'red' };
  }

  /**
   * Settle bets against the final drawn number and color.
   */
  async settleRound(
    round: GameRound,
    bets: Bet[],
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
  }> {
    let resultNumber: number;

    // 1. Determine Result Number
    if (manualResult && manualResult.number !== undefined && manualResult.number >= 0 && manualResult.number <= 9) {
      resultNumber = manualResult.number;
    } else {
      // Determine strategy (fair vs profit optimization)
      const strategy = round.resultStrategy;
      const highBetAlwaysLoss = db.settings.highBetAlwaysLoss;

      if (highBetAlwaysLoss && bets.length > 0) {
        const maxBetAmount = Math.max(...bets.map(b => b.amount));
        const highestBets = bets.filter(b => b.amount === maxBetAmount);

        // Find all numbers 0-9 where all highest bets lose
        const losingNums: number[] = [];
        for (let testNum = 0; testNum <= 9; testNum++) {
          const wins = highestBets.some(bet => this.evaluateBetWin(bet, testNum));
          if (!wins) {
            losingNums.push(testNum);
          }
        }

        if (losingNums.length > 0) {
          if (strategy === 'high_profit') {
            // Find the number from losingNums that results in the LEAST payout to maximize house revenue
            let minPayoutNum = losingNums[0];
            let minPayoutAmount = Infinity;
            for (const testNum of losingNums) {
              let testPayout = 0;
              for (const bet of bets) {
                testPayout += this.calculateTestPayout(bet, testNum);
              }
              if (testPayout < minPayoutAmount) {
                minPayoutAmount = testPayout;
                minPayoutNum = testNum;
              }
            }
            resultNumber = minPayoutNum;
          } else {
            // Pick a random number from the losing numbers list
            const randIdx = Math.floor(Math.random() * losingNums.length);
            resultNumber = losingNums[randIdx];
          }
        } else {
          // Fallback if no losing number exists (e.g. conflicting high bets)
          resultNumber = Math.floor(Math.random() * 10);
        }
      } else if (strategy === 'high_profit' && bets.length > 0) {
        // Find the number that results in the LEAST payout to maximize house revenue
        let minPayoutNum = 0;
        let minPayoutAmount = Infinity;

        for (let testNum = 0; testNum <= 9; testNum++) {
          let testPayout = 0;
          for (const bet of bets) {
            const payout = this.calculateTestPayout(bet, testNum);
            testPayout += payout;
          }
          if (testPayout < minPayoutAmount) {
            minPayoutAmount = testPayout;
            minPayoutNum = testNum;
          }
        }
        resultNumber = minPayoutNum;
      } else {
        // Fair/random result
        resultNumber = Math.floor(Math.random() * 10);
      }
    }

    // Determine colors associated with drawn number
    const attrs = this.getNumberAttributes(resultNumber);
    const resultColor = attrs.colorSecondary 
      ? `${attrs.color}-${attrs.colorSecondary}` 
      : attrs.color;

    let totalWinAmount = 0;
    const settledBets: Array<{
      betId: string;
      winningAmount: number;
      status: 'won' | 'lost';
      winFeeDeducted: number;
    }> = [];

    const settings = db.settings;
    const winFeePercent = settings.winningFeePercent || 2; // Default 2%

    // 2. Loop & evaluate each bet
    for (const bet of bets) {
      const isWin = this.evaluateBetWin(bet, resultNumber);
      
      let winAmount = 0;
      let winFee = 0;

      if (isWin) {
        // Calculate Win Multiplier
        let multiplier = 1;
        if (bet.betType === 'number') {
          multiplier = 9; // Number guess wins 9x
        } else if (bet.betType === 'color') {
          const val = bet.betValue.toLowerCase();
          if (val === 'violet') {
            multiplier = 4.5; // Violet prediction wins 4.5x
          } else if (val === 'red' || val === 'green') {
            // Check if special violet mixed draw (0 or 5)
            if (resultNumber === 0 || resultNumber === 5) {
              multiplier = 1.5; // Shared color win is 1.5x
            } else {
              multiplier = 2.0; // Clean color win is 2x
            }
          }
        }

        // Apply fee deduction before crediting
        const grossWinnings = bet.amount * multiplier;
        winFee = (grossWinnings * winFeePercent) / 100;
        winAmount = grossWinnings - winFee;
        totalWinAmount += winAmount;

        // Credit to the user's wallet
        await this.walletService.creditWinnings(
          bet.userId,
          'color-trading',
          winAmount,
          `WinGo ${bet.gameMode} Win - Period ${bet.periodNumber} (No. ${resultNumber}, Color: ${resultColor})`
        );
      }

      // Record final bet outcome
      settledBets.push({
        betId: bet.id,
        winningAmount: winAmount,
        status: isWin ? 'won' : 'lost',
        winFeeDeducted: winFee
      });

      // Handle Referral Commission
      // We credit commission to the user's referrer based on total bet placed
      const betUser = db.users.find(u => u.id === bet.userId);
      if (betUser && betUser.referredByCode) {
        const referrer = db.users.find(u => u.referralCode === betUser.referredByCode);
        if (referrer) {
          const commissionPercent = settings.referralCommissionPercent || 5;
          const commAmount = Number(((bet.amount * commissionPercent) / 100).toFixed(2));
          
          if (commAmount > 0) {
            const autoSettle = settings.autoSettleCommissions !== false; // default true if undefined
            
            if (autoSettle) {
              // Credit referrer's cash balance
              await this.walletService.adminCreditDebit(
                referrer.id,
                commAmount,
                'credit',
                `Referral Bet Commission from referee ${betUser.mobile.slice(0, 3)}***${betUser.mobile.slice(-3)} play`
              );

              // Record as automatic payout
              const payoutId = 'ap-auto-' + Math.random().toString(36).substr(2, 9);
              await db.executeTransaction((d) => {
                if (!d.agentPayouts) d.agentPayouts = [];
                d.agentPayouts.push({
                  id: payoutId,
                  agentId: referrer.id,
                  amount: commAmount,
                  subordinateRevenue: bet.amount,
                  type: 'automatic',
                  createdAt: new Date().toISOString()
                });

                d.notifications.push({
                  id: 'notif-' + Math.random().toString(36).substr(2, 9),
                  userId: referrer.id,
                  title: 'Commission Settled',
                  content: `You received auto-settlement of ₹${commAmount} referral commission from referee ${betUser.mobile.slice(0, 3)}***${betUser.mobile.slice(-3)} play.`,
                  isRead: false,
                  createdAt: new Date().toISOString()
                });
              });
            } else {
              // Only record pending notification
              await db.executeTransaction((d) => {
                d.notifications.push({
                  id: 'notif-' + Math.random().toString(36).substr(2, 9),
                  userId: referrer.id,
                  title: 'Pending Commission Earned',
                  content: `You earned ₹${commAmount} pending commission from referee ${betUser.mobile.slice(0, 3)}***${betUser.mobile.slice(-3)} play. This will be settled during the next payout cycle.`,
                  isRead: false,
                  createdAt: new Date().toISOString()
                });
              });
            }

            // Save referral commission record
            await this.referralRepo.addCommission({
              referrerId: referrer.id,
              refereeId: betUser.id,
              betId: bet.id,
              amount: commAmount
            });
          }
        }
      }
    }

    return {
      resultColor,
      resultNumber,
      totalWinAmount,
      settledBets
    };
  }

  /**
   * Internal simulation check to calculate potential winnings for optimization algorithms
   */
  private calculateTestPayout(bet: Bet, testNum: number): number {
    const isWin = this.evaluateBetWin(bet, testNum);
    if (!isWin) return 0;

    let multiplier = 1;
    if (bet.betType === 'number') {
      multiplier = 9;
    } else if (bet.betType === 'color') {
      const val = bet.betValue.toLowerCase();
      if (val === 'violet') {
        multiplier = 4.5;
      } else if (val === 'red' || val === 'green') {
        if (testNum === 0 || testNum === 5) {
          multiplier = 1.5;
        } else {
          multiplier = 2.0;
        }
      }
    }
    return bet.amount * multiplier;
  }

  /**
   * Determine if bet wins for drawn number
   */
  private evaluateBetWin(bet: Bet, drawnNum: number): boolean {
    if (bet.betType === 'number') {
      return parseInt(bet.betValue, 10) === drawnNum;
    }

    // Color prediction
    const userColor = bet.betValue.toLowerCase();
    const attrs = this.getNumberAttributes(drawnNum);

    if (userColor === 'violet') {
      return attrs.colorSecondary === 'violet';
    }

    // Red or Green
    return attrs.color === userColor;
  }
}
