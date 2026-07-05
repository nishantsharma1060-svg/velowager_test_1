import { db as pgDb } from '../../src/db/index.ts';
import { referrals, referralCommissions } from '../../src/db/schema.ts';
import { Referral, ReferralCommission, db as fileDb } from '../db.js';
import { eq, desc } from 'drizzle-orm';

export class ReferralRepository {
  async createReferral(referrerId: string, refereeId: string): Promise<Referral> {
    const id = 'ref-' + Math.random().toString(36).substr(2, 9);
    const newRef = {
      id,
      referrerId,
      refereeId,
      createdAt: new Date()
    };

    if (fileDb.isOffline) {
      const offlineRef: Referral = {
        ...newRef,
        createdAt: newRef.createdAt.toISOString()
      };
      fileDb.referrals.push(offlineRef);
      await fileDb.save();
      return offlineRef;
    }

    try {
      await pgDb.insert(referrals).values(newRef);
      return {
        ...newRef,
        createdAt: newRef.createdAt.toISOString()
      } as Referral;
    } catch (err) {
      console.error('ReferralRepository createReferral failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async addCommission(commission: Omit<ReferralCommission, 'id' | 'createdAt'>): Promise<ReferralCommission> {
    const id = 'refc-' + Math.random().toString(36).substr(2, 9);
    const newComm = {
      id,
      referrerId: commission.referrerId,
      refereeId: commission.refereeId,
      betId: commission.betId,
      amount: commission.amount,
      createdAt: new Date()
    };

    if (fileDb.isOffline) {
      const offlineComm: ReferralCommission = {
        ...newComm,
        createdAt: newComm.createdAt.toISOString()
      };
      fileDb.referralCommissions.push(offlineComm);
      await fileDb.save();
      return offlineComm;
    }

    try {
      await pgDb.insert(referralCommissions).values(newComm);
      return {
        ...newComm,
        createdAt: newComm.createdAt.toISOString()
      } as ReferralCommission;
    } catch (err) {
      console.error('ReferralRepository addCommission failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getReferralsByReferrerId(referrerId: string): Promise<Referral[]> {
    if (fileDb.isOffline) {
      return fileDb.referrals.filter(x => x.referrerId === referrerId);
    }

    try {
      const result = await pgDb.select().from(referrals).where(eq(referrals.referrerId, referrerId));
      return result.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString()
      })) as Referral[];
    } catch (err) {
      console.error('ReferralRepository getReferralsByReferrerId failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getCommissionsByReferrerId(referrerId: string): Promise<ReferralCommission[]> {
    if (fileDb.isOffline) {
      return fileDb.referralCommissions
        .filter(x => x.referrerId === referrerId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    try {
      const result = await pgDb.select().from(referralCommissions)
        .where(eq(referralCommissions.referrerId, referrerId))
        .orderBy(desc(referralCommissions.createdAt));
      return result.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString()
      })) as ReferralCommission[];
    } catch (err) {
      console.error('ReferralRepository getCommissionsByReferrerId failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }

  async getAllCommissions(): Promise<ReferralCommission[]> {
    if (fileDb.isOffline) {
      return [...fileDb.referralCommissions];
    }

    try {
      const result = await pgDb.select().from(referralCommissions);
      return result.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString()
      })) as ReferralCommission[];
    } catch (err) {
      console.error('ReferralRepository getAllCommissions failed:', err);
      throw new Error('Database operation failed', { cause: err });
    }
  }
}
