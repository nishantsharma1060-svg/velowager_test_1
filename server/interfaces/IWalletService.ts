import { Wallet, Transaction } from '../db.js';

export interface IWalletService {
  getBalance(userId: string): Promise<Wallet>;
  deposit(userId: string, amount: number, remark: string, isManual?: boolean, utr?: string): Promise<Transaction>;
  requestWithdrawal(userId: string, amount: number, utr?: string, remark?: string): Promise<Transaction>;
  deductBet(userId: string, gameId: string, amount: number, remark: string): Promise<Transaction>;
  creditWinnings(userId: string, gameId: string, amount: number, remark: string): Promise<Transaction>;
  getTransactions(userId: string): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  approveWithdrawal(transactionId: string): Promise<Transaction>;
  rejectWithdrawal(transactionId: string, rejectReason: string): Promise<Transaction>;
  approveDeposit(transactionId: string): Promise<Transaction>;
  rejectDeposit(transactionId: string): Promise<Transaction>;
  adminCreditDebit(userId: string, amount: number, type: 'credit' | 'debit', remark: string): Promise<Transaction>;
}
