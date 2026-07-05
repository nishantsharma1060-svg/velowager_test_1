import { db as pgDb } from '../../src/db/index.ts';
import { users } from '../../src/db/schema.ts';
import { User, db as fileDb } from '../db.js';
import { eq } from 'drizzle-orm';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    if (fileDb.isOffline) {
      const u = fileDb.users.find(x => x.id === id);
      return u ? { ...u } : null;
    }

    try {
      const result = await pgDb.select().from(users).where(eq(users.id, id));
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString()
      } as User;
    } catch (err) {
      console.error('UserRepository findById failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async findByMobile(mobile: string): Promise<User | null> {
    if (fileDb.isOffline) {
      const u = fileDb.users.find(x => x.mobile === mobile);
      return u ? { ...u } : null;
    }

    try {
      const result = await pgDb.select().from(users).where(eq(users.mobile, mobile));
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString()
      } as User;
    } catch (err) {
      console.error('UserRepository findByMobile failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    if (fileDb.isOffline) {
      const u = fileDb.users.find(x => x.username?.toLowerCase() === username.toLowerCase());
      return u ? { ...u } : null;
    }

    try {
      const result = await pgDb.select().from(users).where(eq(users.username, username));
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString()
      } as User;
    } catch (err) {
      console.error('UserRepository findByUsername failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    if (fileDb.isOffline) {
      const u = fileDb.users.find(x => x.email?.toLowerCase() === email.toLowerCase());
      return u ? { ...u } : null;
    }

    try {
      const result = await pgDb.select().from(users).where(eq(users.email, email));
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString()
      } as User;
    } catch (err) {
      console.error('UserRepository findByEmail failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async findByReferralCode(code: string): Promise<User | null> {
    if (fileDb.isOffline) {
      const u = fileDb.users.find(x => x.referralCode.toUpperCase() === code.toUpperCase());
      return u ? { ...u } : null;
    }

    try {
      const result = await pgDb.select().from(users).where(eq(users.referralCode, code.toUpperCase()));
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString()
      } as User;
    } catch (err) {
      console.error('UserRepository findByReferralCode failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async create(user: Omit<User, 'id' | 'createdAt'> & { signupIp?: string }): Promise<User> {
    const id = 'user-' + Math.random().toString(36).substr(2, 9);
    const newUser = {
      id,
      mobile: user.mobile,
      username: user.username || null,
      email: user.email || null,
      passwordHash: user.passwordHash,
      referralCode: user.referralCode,
      referredByCode: user.referredByCode || null,
      status: user.status || 'active',
      isAgent: user.isAgent || false,
      signupIp: user.signupIp || null,
      bankName: (user as any).bankName || null,
      bankAccount: (user as any).bankAccount || null,
      bankIfsc: (user as any).bankIfsc || null,
      bankHolderName: (user as any).bankHolderName || null,
      createdAt: new Date(),
    };

    if (fileDb.isOffline) {
      const offlineUser: User = {
        ...newUser,
        username: newUser.username || undefined,
        email: newUser.email || undefined,
        referredByCode: newUser.referredByCode || undefined,
        signupIp: newUser.signupIp || undefined,
        bankName: newUser.bankName || undefined,
        bankAccount: newUser.bankAccount || undefined,
        bankIfsc: newUser.bankIfsc || undefined,
        bankHolderName: newUser.bankHolderName || undefined,
        createdAt: newUser.createdAt.toISOString()
      };
      fileDb.users.push(offlineUser);
      await fileDb.save();
      return offlineUser;
    }

    try {
      await pgDb.insert(users).values(newUser);
      return {
        ...newUser,
        createdAt: newUser.createdAt.toISOString()
      } as User;
    } catch (err) {
      console.error('UserRepository create failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateStatus(id: string, status: 'active' | 'frozen' | 'banned'): Promise<User | null> {
    if (fileDb.isOffline) {
      const u = fileDb.users.find(x => x.id === id);
      if (u) {
        u.status = status;
        await fileDb.save();
      }
      return u ? { ...u } : null;
    }

    try {
      await pgDb.update(users).set({ status }).where(eq(users.id, id));
      return this.findById(id);
    } catch (err) {
      console.error('UserRepository updateStatus failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getAllUsers(): Promise<User[]> {
    if (fileDb.isOffline) {
      return [...fileDb.users];
    }

    try {
      const result = await pgDb.select().from(users);
      return result.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString()
      })) as User[];
    } catch (err) {
      console.error('UserRepository getAllUsers failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateAgentStatus(id: string, isAgent: boolean): Promise<User | null> {
    if (fileDb.isOffline) {
      const u = fileDb.users.find(x => x.id === id);
      if (u) {
        u.isAgent = isAgent;
        await fileDb.save();
      }
      return u ? { ...u } : null;
    }

    try {
      await pgDb.update(users).set({ isAgent }).where(eq(users.id, id));
      return this.findById(id);
    } catch (err) {
      console.error('UserRepository updateAgentStatus failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateBankDetails(id: string, bankDetails: { bankName: string; bankAccount: string; bankIfsc: string; bankHolderName: string }): Promise<User | null> {
    if (fileDb.isOffline) {
      const u = fileDb.users.find(x => x.id === id);
      if (u) {
        Object.assign(u, bankDetails);
        await fileDb.save();
      }
      return u ? { ...u } : null;
    }

    try {
      await pgDb.update(users).set(bankDetails).where(eq(users.id, id));
      return this.findById(id);
    } catch (err) {
      console.error('UserRepository updateBankDetails failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateReferredByCode(id: string, referredByCode: string): Promise<User | null> {
    if (fileDb.isOffline) {
      const u = fileDb.users.find(x => x.id === id);
      if (u) {
        u.referredByCode = referredByCode;
        await fileDb.save();
      }
      return u ? { ...u } : null;
    }

    try {
      await pgDb.update(users).set({ referredByCode }).where(eq(users.id, id));
      return this.findById(id);
    } catch (err) {
      console.error('UserRepository updateReferredByCode failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async updateTwoFactor(id: string, secret: string | null, enabled: boolean): Promise<User | null> {
    if (fileDb.isOffline) {
      const u = fileDb.users.find(x => x.id === id);
      if (u) {
        u.twoFactorSecret = secret || undefined;
        u.twoFactorEnabled = enabled;
        await fileDb.save();
      }
      return u ? { ...u } : null;
    }

    try {
      await pgDb.update(users).set({ 
        twoFactorSecret: secret, 
        twoFactorEnabled: enabled 
      }).where(eq(users.id, id));
      return this.findById(id);
    } catch (err) {
      console.error('UserRepository updateTwoFactor failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }
}
