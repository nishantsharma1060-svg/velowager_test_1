import { IWalletService } from '../interfaces/IWalletService.js';
import { WalletRepository } from '../repositories/WalletRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { Wallet, Transaction, db } from '../db.js';
import { ReferralRepository } from '../repositories/ReferralRepository.js';

export class WalletService implements IWalletService {
  private walletRepo = new WalletRepository();
  private userRepo = new UserRepository();
  private referralRepo = new ReferralRepository();

  async getBalance(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findByUserId(userId);
    if (!wallet) {
      wallet = await this.walletRepo.createWallet(userId);
    }

    // Auto-reset wagering if the user has no funds left (< 1 Rs)
    const totalFunds = wallet.balance + wallet.promoBalance;
    if (totalFunds < 1 && ((wallet.requiredWagering ?? 0) > 0 || (wallet.completedWagering ?? 0) > 0)) {
      await this.walletRepo.setWageringManually(userId, 0, 0);
      wallet.requiredWagering = 0;
      wallet.completedWagering = 0;
    }

    return wallet;
  }

  async deposit(userId: string, amount: number, remark: string, isManual = true, utr?: string): Promise<Transaction> {
    const settings = db.settings;
    if (amount < settings.minDeposit) {
      throw new Error(`Minimum deposit amount is ₹${settings.minDeposit}`);
    }

    const wallet = await this.getBalance(userId);

    // Create a pending deposit transaction
    let tx = await this.walletRepo.addTransaction({
      userId,
      type: 'deposit',
      amount,
      currentBalance: wallet.balance,
      status: 'pending',
      remark: isManual ? `Pending deposit approval: ${remark}` : remark,
      utr
    });

    if (!isManual) {
      // Auto-approve deposit (if payment gateway is integrated in future)
      const approvedTx = await this.approveDeposit(tx.id);
      if (approvedTx) {
        tx = approvedTx;
      }
    } else {
      // Notification to admin panel or in-app admin alert
      db.executeTransaction((d) => {
        d.notifications.push({
          id: 'notif-' + Math.random().toString(36).substr(2, 9),
          userId,
          title: 'Deposit Requested',
          content: `Your deposit request for ₹${amount} is submitted and is pending admin approval.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      });
    }

    return tx;
  }

  async requestWithdrawal(userId: string, amount: number, utr?: string, remark?: string): Promise<Transaction> {
    const settings = db.settings;
    if (amount < settings.minWithdraw) {
      throw new Error(`Minimum withdrawal amount is ₹${settings.minWithdraw}`);
    }

    const wallet = await this.getBalance(userId);
    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance to request withdrawal');
    }

    // Check wagering requirement
    const reqWager = wallet.requiredWagering ?? 0;
    const compWager = wallet.completedWagering ?? 0;
    if (compWager < reqWager) {
      throw new Error(`Wagering requirement not met. You must wager ₹${(reqWager - compWager).toFixed(2)} more before you can request a withdrawal. (Completed: ₹${compWager.toFixed(2)} of ₹${reqWager.toFixed(2)})`);
    }

    // Deduct from balance immediately to hold the amount, or create transaction and deduct on approval
    // Traditional secure platforms deduct balance immediately. If rejected, it is credited back.
    await this.walletRepo.updateBalance(userId, -amount);
    const updatedWallet = await this.getBalance(userId);

    const tx = await this.walletRepo.addTransaction({
      userId,
      type: 'withdraw',
      amount,
      currentBalance: updatedWallet.balance,
      status: 'pending',
      remark: remark || `Withdraw request submitted for ₹${amount}`,
      utr
    });

    db.executeTransaction((d) => {
      d.notifications.push({
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        userId,
        title: 'Withdrawal Requested',
        content: `Your withdrawal request for ₹${amount} has been successfully submitted for verification.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    return tx;
  }

  async deductBet(userId: string, gameId: string, amount: number, remark: string): Promise<Transaction> {
    const wallet = await this.getBalance(userId);
    const totalAvailable = wallet.balance + wallet.promoBalance;
    if (totalAvailable < amount) {
      throw new Error('Insufficient balance to place bet');
    }

    // Deduct promo balance first, then cash balance
    let promoDeduction = 0;
    let cashDeduction = 0;

    if (wallet.promoBalance >= amount) {
      promoDeduction = amount;
    } else {
      promoDeduction = wallet.promoBalance;
      cashDeduction = amount - promoDeduction;
    }

    if (promoDeduction > 0) {
      await this.walletRepo.updateBalance(userId, -promoDeduction, true);
    }
    if (cashDeduction > 0) {
      await this.walletRepo.updateBalance(userId, -cashDeduction, false);
    }

    const updatedWallet = await this.getBalance(userId);

    // Track completed wagering on bet placement
    await this.walletRepo.updateWagering(userId, 0, amount);

    const tx = await this.walletRepo.addTransaction({
      userId,
      type: 'bet_deduct',
      amount,
      currentBalance: updatedWallet.balance,
      status: 'approved',
      remark: `Bet placement deduction: ${remark}`
    });

    return tx;
  }

  async creditWinnings(userId: string, gameId: string, amount: number, remark: string): Promise<Transaction> {
    await this.walletRepo.updateBalance(userId, amount, false);
    const updatedWallet = await this.getBalance(userId);

    const tx = await this.walletRepo.addTransaction({
      userId,
      type: 'winning_credit',
      amount,
      currentBalance: updatedWallet.balance,
      status: 'approved',
      remark: `Winning credit: ${remark}`
    });

    db.executeTransaction((d) => {
      d.notifications.push({
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        userId,
        title: 'Bet Won! 🎉',
        content: `Congratulations! You won ₹${amount.toFixed(2)} in game ${gameId}. Cash credited to wallet.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    return tx;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return this.walletRepo.getTransactionsByUserId(userId);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.walletRepo.getAllTransactions();
  }

  async approveWithdrawal(transactionId: string): Promise<Transaction> {
    const tx = await this.walletRepo.findTransactionById(transactionId);
    if (!tx || tx.type !== 'withdraw') {
      throw new Error('Withdrawal transaction not found');
    }
    if (tx.status !== 'pending') {
      throw new Error('Transaction is already processed');
    }

    const updatedTx = await this.walletRepo.updateTransactionStatus(transactionId, 'approved', 'Withdrawal approved by Admin');

    db.executeTransaction((d) => {
      d.notifications.push({
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        userId: tx.userId,
        title: 'Withdrawal Approved',
        content: `Your withdrawal request of ₹${tx.amount} has been approved and paid out!`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    return updatedTx!;
  }

  async rejectWithdrawal(transactionId: string, rejectReason: string): Promise<Transaction> {
    const tx = await this.walletRepo.findTransactionById(transactionId);
    if (!tx || tx.type !== 'withdraw') {
      throw new Error('Withdrawal transaction not found');
    }
    if (tx.status !== 'pending') {
      throw new Error('Transaction is already processed');
    }

    // Refund money back to main balance
    await this.walletRepo.updateBalance(tx.userId, tx.amount);
    const updatedWallet = await this.getBalance(tx.userId);

    const updatedTx = await this.walletRepo.updateTransactionStatus(
      transactionId, 
      'rejected', 
      `Withdrawal rejected: ${rejectReason}. ₹${tx.amount} refunded.`
    );

    db.executeTransaction((d) => {
      d.notifications.push({
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        userId: tx.userId,
        title: 'Withdrawal Rejected',
        content: `Your withdrawal request of ₹${tx.amount} was rejected: ${rejectReason}. Funds refunded.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    return updatedTx!;
  }

  async approveDeposit(transactionId: string): Promise<Transaction> {
    const tx = await this.walletRepo.findTransactionById(transactionId);
    if (!tx || tx.type !== 'deposit') {
      throw new Error('Deposit transaction not found');
    }
    if (tx.status !== 'pending') {
      throw new Error('Transaction is already processed');
    }

    // Credit money to the wallet balance
    await this.walletRepo.updateBalance(tx.userId, tx.amount);

    // Increment required wagering on successful deposit (deposit amount * settings.wageringMultiplier)
    const settings = db.settings;
    const multiplier = settings.wageringMultiplier ?? 1;
    const wagerRequiredChange = tx.amount * multiplier;
    await this.walletRepo.updateWagering(tx.userId, wagerRequiredChange, 0);

    const updatedWallet = await this.getBalance(tx.userId);

    const updatedTx = await this.walletRepo.updateTransactionStatus(
      transactionId,
      'approved',
      'Deposit approved and credited by Admin'
    );

    // Pay a one-time 10% bonus when a referred user's approved deposit is Rs.500+.
    if (tx.amount >= 500 && !(await this.referralRepo.hasDepositCommission(tx.id))) {
      const referee = await this.userRepo.findById(tx.userId);
      if (referee?.referredByCode) {
        const referrer = await this.userRepo.findByReferralCode(referee.referredByCode);
        if (referrer) {
          const bonus = Number((tx.amount * 0.10).toFixed(2));
          await this.adminCreditDebit(referrer.id, bonus, 'credit', `10% referral deposit bonus for deposit ${tx.id}`);
          await this.referralRepo.addCommission({ referrerId: referrer.id, refereeId: referee.id, depositTransactionId: tx.id, commissionType: 'deposit', amount: bonus });
          await db.executeTransaction((d) => {
            d.notifications.push({
              id: 'notif-' + Math.random().toString(36).substr(2, 9), userId: referrer.id,
              title: 'Referral Deposit Bonus',
              content: `You received Rs.${bonus.toFixed(2)} (10%) from a referred user's qualifying deposit of Rs.${tx.amount.toFixed(2)}.`,
              isRead: false, createdAt: new Date().toISOString()
            });
            if (!d.agentPayouts) d.agentPayouts = [];
            d.agentPayouts.push({
              id: 'ap-deposit-' + Math.random().toString(36).substr(2, 9), agentId: referrer.id,
              amount: bonus, subordinateRevenue: tx.amount, type: 'automatic', createdAt: new Date().toISOString()
            });
          });
        }
      }
    }

    db.executeTransaction((d) => {
      d.notifications.push({
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        userId: tx.userId,
        title: 'Deposit Credited',
        content: `Great news! Your manual deposit of ₹${tx.amount} has been confirmed and credited.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    return updatedTx!;
  }

  async rejectDeposit(transactionId: string): Promise<Transaction> {
    const tx = await this.walletRepo.findTransactionById(transactionId);
    if (!tx || tx.type !== 'deposit') {
      throw new Error('Deposit transaction not found');
    }
    if (tx.status !== 'pending') {
      throw new Error('Transaction is already processed');
    }

    const updatedTx = await this.walletRepo.updateTransactionStatus(
      transactionId,
      'rejected',
      'Deposit request declined by Admin'
    );

    db.executeTransaction((d) => {
      d.notifications.push({
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        userId: tx.userId,
        title: 'Deposit Rejected',
        content: `Your deposit request of ₹${tx.amount} was rejected by administrative verify.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    return updatedTx!;
  }

  async adminCreditDebit(userId: string, amount: number, type: 'credit' | 'debit', remark: string): Promise<Transaction> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const balanceChange = type === 'credit' ? amount : -amount;
    await this.walletRepo.updateBalance(userId, balanceChange, false);
    const updatedWallet = await this.getBalance(userId);

    const tx = await this.walletRepo.addTransaction({
      userId,
      type: type === 'credit' ? 'admin_credit' : 'admin_debit',
      amount,
      currentBalance: updatedWallet.balance,
      status: 'approved',
      remark: `Admin adjustments: ${remark}`
    });

    db.executeTransaction((d) => {
      d.notifications.push({
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        userId,
        title: `Account Wallet ${type === 'credit' ? 'Credited' : 'Debited'}`,
        content: `Admin updated your wallet by ₹${amount}. Reason: ${remark}`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    return tx;
  }
}
