import { db as pgDb } from '../../src/db/index.ts';
import { wallets, transactions } from '../../src/db/schema.ts';
import { Wallet, Transaction, db as fileDb } from '../db.js';
import { eq, desc } from 'drizzle-orm';

export class WalletRepository {
  async findByUserId(userId: string): Promise<Wallet | null> {
    if (fileDb.isOffline) {
      const w = fileDb.wallets.find(x => x.userId === userId);
      return w ? { ...w } : null;
    }

    try {
      const result = await pgDb.select().from(wallets).where(eq(wallets.userId, userId));
      if (!result[0]) return null;
      return {
        userId: result[0].userId,
        balance: result[0].balance,
        promoBalance: result[0].promoBalance,
        requiredWagering: result[0].requiredWagering ?? 0,
        completedWagering: result[0].completedWagering ?? 0
      } as Wallet;
    } catch (err) {
      console.error('WalletRepository findByUserId failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async createWallet(userId: string): Promise<Wallet> {
    const newWallet = {
      userId,
      balance: 0,
      promoBalance: 0,
      requiredWagering: 0,
      completedWagering: 0
    };

    if (fileDb.isOffline) {
      fileDb.wallets.push(newWallet);
      await fileDb.save();
      return { ...newWallet };
    }

    try {
      await pgDb.insert(wallets).values(newWallet);
      return { ...newWallet } as Wallet;
    } catch (err) {
      console.error('WalletRepository createWallet failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateWagering(userId: string, requiredChange: number, completedChange: number): Promise<Wallet | null> {
    if (fileDb.isOffline) {
      const w = fileDb.wallets.find(x => x.userId === userId);
      if (w) {
        w.requiredWagering = Number((Math.max(0, (w.requiredWagering ?? 0) + requiredChange)).toFixed(2));
        w.completedWagering = Number((Math.max(0, (w.completedWagering ?? 0) + completedChange)).toFixed(2));
        await fileDb.save();
      }
      return w ? { ...w } : null;
    }

    try {
      const wallet = await this.findByUserId(userId);
      if (!wallet) return null;
      const requiredWagering = Number((Math.max(0, (wallet.requiredWagering ?? 0) + requiredChange)).toFixed(2));
      const completedWagering = Number((Math.max(0, (wallet.completedWagering ?? 0) + completedChange)).toFixed(2));
      await pgDb.update(wallets).set({ requiredWagering, completedWagering }).where(eq(wallets.userId, userId));
      return {
        ...wallet,
        requiredWagering,
        completedWagering
      };
    } catch (err) {
      console.error('WalletRepository updateWagering failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async setWageringManually(userId: string, required: number, completed: number): Promise<Wallet | null> {
    if (fileDb.isOffline) {
      const w = fileDb.wallets.find(x => x.userId === userId);
      if (w) {
        w.requiredWagering = Number(required.toFixed(2));
        w.completedWagering = Number(completed.toFixed(2));
        await fileDb.save();
      }
      return w ? { ...w } : null;
    }

    try {
      const wallet = await this.findByUserId(userId);
      if (!wallet) return null;
      const requiredWagering = Number(required.toFixed(2));
      const completedWagering = Number(completed.toFixed(2));
      await pgDb.update(wallets).set({ requiredWagering, completedWagering }).where(eq(wallets.userId, userId));
      return {
        ...wallet,
        requiredWagering,
        completedWagering
      };
    } catch (err) {
      console.error('WalletRepository setWageringManually failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateBalance(userId: string, amount: number, isPromo: boolean = false): Promise<Wallet | null> {
    if (fileDb.isOffline) {
      const w = fileDb.wallets.find(x => x.userId === userId);
      if (w) {
        if (isPromo) {
          w.promoBalance = Number(((w.promoBalance ?? 0) + amount).toFixed(2));
        } else {
          w.balance = Number(((w.balance ?? 0) + amount).toFixed(2));
        }
        await fileDb.save();
      }
      return w ? { ...w } : null;
    }

    try {
      const wallet = await this.findByUserId(userId);
      if (!wallet) return null;
      if (isPromo) {
        const promoBalance = Number(((wallet.promoBalance ?? 0) + amount).toFixed(2));
        await pgDb.update(wallets).set({ promoBalance }).where(eq(wallets.userId, userId));
        return { ...wallet, promoBalance };
      } else {
        const balance = Number(((wallet.balance ?? 0) + amount).toFixed(2));
        await pgDb.update(wallets).set({ balance }).where(eq(wallets.userId, userId));
        return { ...wallet, balance };
      }
    } catch (err) {
      console.error('WalletRepository updateBalance failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const id = 'tx-' + Math.random().toString(36).substr(2, 9);
    const newTx = {
      id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      currentBalance: transaction.currentBalance,
      status: transaction.status,
      remark: transaction.remark,
      utr: transaction.utr || null,
      createdAt: new Date()
    };

    if (fileDb.isOffline) {
      const offlineTx: Transaction = {
        ...newTx,
        utr: newTx.utr || undefined,
        createdAt: newTx.createdAt.toISOString()
      };
      fileDb.transactions.push(offlineTx);
      await fileDb.save();
      return offlineTx;
    }

    try {
      await pgDb.insert(transactions).values(newTx);
      return {
        ...newTx,
        createdAt: newTx.createdAt.toISOString()
      } as Transaction;
    } catch (err) {
      console.error('WalletRepository addTransaction failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async findTransactionById(id: string): Promise<Transaction | null> {
    if (fileDb.isOffline) {
      const t = fileDb.transactions.find(x => x.id === id);
      return t ? { ...t } : null;
    }

    try {
      const result = await pgDb.select().from(transactions).where(eq(transactions.id, id));
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString()
      } as Transaction;
    } catch (err) {
      console.error('WalletRepository findTransactionById failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateTransactionStatus(id: string, status: 'approved' | 'rejected', remark?: string): Promise<Transaction | null> {
    if (fileDb.isOffline) {
      const t = fileDb.transactions.find(x => x.id === id);
      if (t) {
        t.status = status;
        if (remark) t.remark = remark;
        await fileDb.save();
      }
      return t ? { ...t } : null;
    }

    try {
      const updates: any = { status };
      if (remark) {
        updates.remark = remark;
      }
      await pgDb.update(transactions).set(updates).where(eq(transactions.id, id));
      return this.findTransactionById(id);
    } catch (err) {
      console.error('WalletRepository updateTransactionStatus failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    if (fileDb.isOffline) {
      return fileDb.transactions
        .filter(x => x.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    try {
      const result = await pgDb.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
      return result.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString()
      })) as Transaction[];
    } catch (err) {
      console.error('WalletRepository getTransactionsByUserId failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    if (fileDb.isOffline) {
      return [...fileDb.transactions]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    try {
      const result = await pgDb.select().from(transactions).orderBy(desc(transactions.createdAt));
      return result.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString()
      })) as Transaction[];
    } catch (err) {
      console.error('WalletRepository getAllTransactions failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }
}
