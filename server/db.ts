import { db as pgDb } from '../src/db/index.ts';
import {
  users as pgUsers,
  wallets as pgWallets,
  transactions as pgTransactions,
  games as pgGames,
  gameRounds as pgGameRounds,
  bets as pgBets,
  referrals as pgReferrals,
  referralCommissions as pgReferralCommissions,
  notifications as pgNotifications,
  platformSettings as pgPlatformSettings,
  auditLogs as pgAuditLogs,
  gatewayOrders as pgGatewayOrders,
  tickets as pgTickets,
  agentPayouts as pgAgentPayouts,
  coupons as pgCoupons,
} from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

// Define DB Models Types
export interface Coupon {
  code: string;
  amount: number;
  currency?: string;
  isRedeemed: boolean;
  redeemedBy?: string;
  createdAt: string;
  redeemedAt?: string;
}

export interface AgentPayout {
  id: string;
  agentId: string;
  amount: number;
  subordinateRevenue: number;
  type: 'manual' | 'automatic';
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  mobile: string;
  username?: string;
  email?: string;
  passwordHash: string;
  referralCode: string;
  referredByCode?: string;
  status: 'active' | 'frozen' | 'banned';
  isAgent?: boolean;
  adminRole?: 'master' | 'operations' | 'finance' | 'support' | 'games' | 'viewer';
  adminPermissions?: string[];
  signupIp?: string;
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  bankHolderName?: string;
  twoFactorSecret?: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  promoBalance: number;
  requiredWagering?: number;
  completedWagering?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'bet_deduct' | 'winning_credit' | 'referral_commission' | 'admin_credit' | 'admin_debit';
  amount: number;
  currentBalance: number;
  status: 'pending' | 'approved' | 'rejected';
  remark: string;
  utr?: string;
  createdAt: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  minBet: number;
  maxBet: number;
}

export interface GameRound {
  id: string; // Unique round UUID
  gameId: string;
  gameMode: string; // '30s', '1m', '3m', '5m'
  periodNumber: string; // e.g. '202606290001'
  status: 'betting' | 'closed' | 'settled';
  resultColor?: string; // 'red', 'green', 'violet', 'red-violet', 'green-violet'
  resultNumber?: number; // 0-9
  totalBetAmount: number;
  totalWinAmount: number;
  resultStrategy: 'fair' | 'admin_manual' | 'high_profit';
  createdAt: string;
  closedAt?: string;
  settledAt?: string;
}

export interface Bet {
  id: string;
  roundId: string;
  userId: string;
  gameId: string;
  gameMode: string;
  periodNumber: string;
  betType: 'color' | 'number'; // 'color' or 'number'
  betValue: string; // 'red', 'green', 'violet' or '0'-'9'
  amount: number;
  winningAmount: number;
  status: 'pending' | 'won' | 'lost';
  winFeeDeducted: number;
  createdAt: string;
  settledAt?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  createdAt: string;
}

export interface ReferralCommission {
  id: string;
  referrerId: string;
  refereeId: string;
  betId: string;
  amount: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  apiUrl: string;
  merchantId: string;
  apiKey: string;
  isEnabled: boolean;
  isDefault: boolean;
  minAmount: number;
  maxAmount: number;
  description?: string;
}

export interface PlatformSettings {
  signupBonus: number;
  referralCommissionPercent: number;
  winningFeePercent: number;
  minDeposit: number;
  minWithdraw: number;
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  announcements: string[];
  wageringMultiplier?: number;
  highBetAlwaysLoss?: boolean;
  affiliateBannerText?: string;
  affiliateBannerImageUrl?: string;
  autoSettleCommissions?: boolean;
  paymentGateways?: PaymentGateway[];
}

export interface AuditLog {
  id: string;
  userId?: string; // admin or user
  action: string;
  ipAddress?: string;
  createdAt: string;
}

// Payment Gateway Order
export interface GatewayOrder {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  paymentMethod?: string;
  gatewayTxId?: string;
  signature?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DBStructure {
  users: User[];
  wallets: Wallet[];
  transactions: Transaction[];
  games: Game[];
  rounds: GameRound[];
  bets: Bet[];
  referrals: Referral[];
  referralCommissions: ReferralCommission[];
  notifications: Notification[];
  settings: PlatformSettings;
  auditLogs: AuditLog[];
  gatewayOrders?: GatewayOrder[];
  tickets?: Ticket[];
  agentPayouts?: AgentPayout[];
  coupons?: Coupon[];
  vaultTransfers?: any[];
}

class PostgresDatabase {
  private data: DBStructure;
  public readonly isOffline = false;

  constructor() {
    this.data = this.getDefaultStructure();
  }

  private getDefaultStructure(): DBStructure {
    return {
      users: [],
      wallets: [],
      transactions: [],
      games: [],
      rounds: [],
      bets: [],
      referrals: [],
      referralCommissions: [],
      notifications: [],
      settings: {
        signupBonus: 100,
        referralCommissionPercent: 5,
        winningFeePercent: 2,
        minDeposit: 100,
        minWithdraw: 200,
        isMaintenanceMode: false,
        maintenanceMessage: '',
        announcements: [],
        wageringMultiplier: 1,
        highBetAlwaysLoss: false,
        affiliateBannerText: 'Earn passive income by inviting your friends!',
        affiliateBannerImageUrl: '',
        autoSettleCommissions: true,
        paymentGateways: [
          {
            id: 'jazpays',
            name: 'JazPays',
            apiUrl: process.env.JAZPAYS_URL || 'https://api.jazpays.com/v1/create',
            merchantId: process.env.JAZPAYS_MERCHANT_ID || '100222071',
            apiKey: process.env.JAZPAYS_API_KEY || '',
            isEnabled: true,
            isDefault: true,
            minAmount: 100,
            maxAmount: 50000,
            description: 'Fast UPI deposits via QR & UPI ID'
          }
        ],
      },
      auditLogs: [],
      gatewayOrders: [],
      tickets: [],
      agentPayouts: [],
      coupons: [],
      vaultTransfers: [],
    };
  }

  public async init() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required; PostgreSQL is the only supported database');
    }
    await this.refreshCache();
  }

  public async refreshCache() {
    try {
      const usersList = await pgDb.select().from(pgUsers);
      const walletsList = await pgDb.select().from(pgWallets);
      const transactionsList = await pgDb.select().from(pgTransactions);
      
      let gamesList = await pgDb.select().from(pgGames);
      const defaultGames = [
        {
          id: 'color-trading',
          name: 'Color Trading (WinGo)',
          description: 'Predict colors (Red, Green, Violet) or numbers (0-9) in fast-paced interval draws.',
          isEnabled: true,
          minBet: 10,
          maxBet: 50000
        },
        {
          id: 'mine',
          name: 'Mines',
          description: 'Avoid hidden mines on a 5x5 grid and cash out when your multiplier increases!',
          isEnabled: true,
          minBet: 10,
          maxBet: 50000
        },
        {
          id: 'crash',
          name: 'Crash',
          description: 'Watch the rocket rise and multiplier grow. Cash out before it crashes!',
          isEnabled: true,
          minBet: 10,
          maxBet: 50000
        },
        {
          id: 'flip',
          name: 'Coin Flip',
          description: 'Flip a coin (Heads or Tails) with a transparent, direct payout!',
          isEnabled: true,
          minBet: 10,
          maxBet: 50000
        }
      ];

      let modified = false;
      for (const dg of defaultGames) {
        if (!gamesList.some(g => g.id === dg.id)) {
          await pgDb.insert(pgGames).values(dg);
          modified = true;
        }
      }
      if (modified) {
        gamesList = await pgDb.select().from(pgGames);
      }

      const roundsList = await pgDb.select().from(pgGameRounds);
      const betsList = await pgDb.select().from(pgBets);
      const referralsList = await pgDb.select().from(pgReferrals);
      const referralCommissionsList = await pgDb.select().from(pgReferralCommissions);
      const notificationsList = await pgDb.select().from(pgNotifications);
      const settingsList = await pgDb.select().from(pgPlatformSettings);
      const auditLogsList = await pgDb.select().from(pgAuditLogs);
      const gatewayOrdersList = await pgDb.select().from(pgGatewayOrders);
      
      let ticketsList: any[] = [];
      try {
        ticketsList = await pgDb.select().from(pgTickets);
      } catch (err) {
        // Table may not exist yet if migrations hasn't run
      }

      let agentPayoutsList: any[] = [];
      try {
        agentPayoutsList = await pgDb.select().from(pgAgentPayouts);
      } catch (err) {
        // Table may not exist yet if migrations hasn't run
      }

      let couponsList: any[] = [];
      try {
        couponsList = await pgDb.select().from(pgCoupons);
      } catch (err) {
        // Table may not exist yet if migrations hasn't run
      }

      this.data.users = usersList.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString()
      })) as User[];

      this.data.wallets = walletsList.map(w => ({
        userId: w.userId,
        balance: w.balance,
        promoBalance: w.promoBalance,
        requiredWagering: w.requiredWagering,
        completedWagering: w.completedWagering,
      })) as Wallet[];

      this.data.transactions = transactionsList.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString()
      })) as Transaction[];

      this.data.games = gamesList as Game[];

      this.data.rounds = roundsList.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        closedAt: r.closedAt?.toISOString() || undefined,
        settledAt: r.settledAt?.toISOString() || undefined,
      })) as GameRound[];

      this.data.bets = betsList.map(b => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        settledAt: b.settledAt?.toISOString() || undefined,
      })) as Bet[];

      this.data.referrals = referralsList.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString()
      })) as Referral[];

      this.data.referralCommissions = referralCommissionsList.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString()
      })) as ReferralCommission[];

      this.data.notifications = notificationsList.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString()
      })) as Notification[];

      if (settingsList[0]) {
        this.data.settings = {
          signupBonus: settingsList[0].signupBonus,
          referralCommissionPercent: settingsList[0].referralCommissionPercent,
          winningFeePercent: settingsList[0].winningFeePercent,
          minDeposit: settingsList[0].minDeposit,
          minWithdraw: settingsList[0].minWithdraw,
          isMaintenanceMode: settingsList[0].isMaintenanceMode,
          maintenanceMessage: settingsList[0].maintenanceMessage,
          announcements: settingsList[0].announcements,
          wageringMultiplier: settingsList[0].wageringMultiplier,
          highBetAlwaysLoss: settingsList[0].highBetAlwaysLoss,
          affiliateBannerText: settingsList[0].affiliateBannerText,
          affiliateBannerImageUrl: settingsList[0].affiliateBannerImageUrl,
          autoSettleCommissions: settingsList[0].autoSettleCommissions,
          paymentGateways: (settingsList[0] as any).paymentGateways || [],
        };
      }

      this.data.auditLogs = auditLogsList.map(l => ({
        ...l,
        createdAt: l.createdAt.toISOString()
      })) as AuditLog[];

      this.data.gatewayOrders = gatewayOrdersList.map(o => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt?.toISOString() || undefined,
      })) as GatewayOrder[];

      this.data.tickets = ticketsList.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt?.toISOString() || undefined,
      })) as Ticket[];

      this.data.agentPayouts = agentPayoutsList.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString()
      })) as AgentPayout[];

      this.data.coupons = couponsList.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        redeemedAt: c.redeemedAt?.toISOString() || undefined,
      })) as Coupon[];

    } catch (err) {
      throw err;
    }
  }

  public async save() {
    try {
      // 1. Sync Platform Settings
      if (this.data.settings) {
        await pgDb.update(pgPlatformSettings).set({
          signupBonus: this.data.settings.signupBonus,
          referralCommissionPercent: this.data.settings.referralCommissionPercent,
          winningFeePercent: this.data.settings.winningFeePercent,
          minDeposit: this.data.settings.minDeposit,
          minWithdraw: this.data.settings.minWithdraw,
          isMaintenanceMode: this.data.settings.isMaintenanceMode,
          maintenanceMessage: this.data.settings.maintenanceMessage,
          announcements: this.data.settings.announcements,
          wageringMultiplier: this.data.settings.wageringMultiplier ?? 1,
          highBetAlwaysLoss: this.data.settings.highBetAlwaysLoss ?? false,
          affiliateBannerText: this.data.settings.affiliateBannerText ?? 'Earn passive income by inviting your friends!',
          affiliateBannerImageUrl: this.data.settings.affiliateBannerImageUrl ?? '',
          autoSettleCommissions: this.data.settings.autoSettleCommissions ?? true,
          paymentGateways: this.data.settings.paymentGateways || [],
        }).where(eq(pgPlatformSettings.id, 1));
      }

      // 2. Sync Notifications
      for (const notif of this.data.notifications) {
        try {
          // Verify user exists in PostgreSQL to avoid foreign key violation
          const userExists = await pgDb.select().from(pgUsers).where(eq(pgUsers.id, notif.userId));
          if (!userExists[0]) {
            console.warn(`[Database Sync] Skipping notification ${notif.id} because user ${notif.userId} does not exist in PostgreSQL.`);
            continue;
          }

          const exists = await pgDb.select().from(pgNotifications).where(eq(pgNotifications.id, notif.id));
          if (!exists[0]) {
            await pgDb.insert(pgNotifications).values({
              id: notif.id,
              userId: notif.userId,
              title: notif.title,
              content: notif.content,
              isRead: notif.isRead,
              createdAt: new Date(notif.createdAt)
            });
          } else if (exists[0].isRead !== notif.isRead) {
            await pgDb.update(pgNotifications).set({ isRead: notif.isRead }).where(eq(pgNotifications.id, notif.id));
          }
        } catch (err) {
          console.error(`[Database Sync] Failed to sync notification ${notif.id}:`, err);
        }
      }

      // 3. Sync Audit Logs
      for (const log of this.data.auditLogs) {
        try {
          let targetUserId: string | null = log.userId || null;
          if (targetUserId) {
            // Verify user exists in PostgreSQL to avoid foreign key violation
            const userExists = await pgDb.select().from(pgUsers).where(eq(pgUsers.id, targetUserId));
            if (!userExists[0]) {
              console.warn(`[Database Sync] Clearing userId for audit log ${log.id} because user ${targetUserId} does not exist in PostgreSQL.`);
              targetUserId = null;
            }
          }

          const exists = await pgDb.select().from(pgAuditLogs).where(eq(pgAuditLogs.id, log.id));
          if (!exists[0]) {
            await pgDb.insert(pgAuditLogs).values({
              id: log.id,
              userId: targetUserId,
              action: log.action,
              ipAddress: log.ipAddress || null,
              createdAt: new Date(log.createdAt)
            });
          }
        } catch (err) {
          console.error(`[Database Sync] Failed to sync audit log ${log.id}:`, err);
        }
      }

      // 4. Sync Gateway Orders
      for (const order of this.data.gatewayOrders || []) {
        try {
          // Verify user exists in PostgreSQL to avoid foreign key violation
          const userExists = await pgDb.select().from(pgUsers).where(eq(pgUsers.id, order.userId));
          if (!userExists[0]) {
            console.warn(`[Database Sync] Skipping gateway order ${order.id} because user ${order.userId} does not exist in PostgreSQL.`);
            continue;
          }

          const exists = await pgDb.select().from(pgGatewayOrders).where(eq(pgGatewayOrders.id, order.id));
          if (!exists[0]) {
            await pgDb.insert(pgGatewayOrders).values({
              id: order.id,
              userId: order.userId,
              amount: order.amount,
              status: order.status,
              paymentMethod: order.paymentMethod || null,
              gatewayTxId: order.gatewayTxId || null,
              createdAt: new Date(order.createdAt)
            });
          } else if (exists[0].status !== order.status) {
            await pgDb.update(pgGatewayOrders).set({
              status: order.status,
              paymentMethod: order.paymentMethod,
              gatewayTxId: order.gatewayTxId,
              updatedAt: order.updatedAt ? new Date(order.updatedAt) : null
            }).where(eq(pgGatewayOrders.id, order.id));
          }
        } catch (err) {
          console.error(`[Database Sync] Failed to sync gateway order ${order.id}:`, err);
        }
      }

      // 5. Sync Support Tickets
      if (this.data.tickets) {
        for (const t of this.data.tickets) {
          try {
            // Verify user exists in PostgreSQL to avoid foreign key violation
            const userExists = await pgDb.select().from(pgUsers).where(eq(pgUsers.id, t.userId));
            if (!userExists[0]) {
              console.warn(`[Database Sync] Skipping support ticket ${t.id} because user ${t.userId} does not exist in PostgreSQL.`);
              continue;
            }

            const exists = await pgDb.select().from(pgTickets).where(eq(pgTickets.id, t.id));
            if (!exists[0]) {
              await pgDb.insert(pgTickets).values({
                id: t.id,
                userId: t.userId,
                subject: t.subject,
                message: t.message,
                status: t.status,
                adminReply: t.adminReply || null,
                createdAt: new Date(t.createdAt),
                updatedAt: t.updatedAt ? new Date(t.updatedAt) : null,
              });
            } else if (exists[0].status !== t.status || exists[0].adminReply !== t.adminReply) {
              await pgDb.update(pgTickets).set({
                status: t.status,
                adminReply: t.adminReply || null,
                updatedAt: t.updatedAt ? new Date(t.updatedAt) : null,
              }).where(eq(pgTickets.id, t.id));
            }
          } catch (err) {
            console.error(`[Database Sync] Failed to sync support ticket ${t.id}:`, err);
          }
        }
      }

      // 6. Sync Agent Payouts
      if (this.data.agentPayouts) {
        for (const p of this.data.agentPayouts) {
          try {
            const userExists = await pgDb.select().from(pgUsers).where(eq(pgUsers.id, p.agentId));
            if (!userExists[0]) {
              console.warn(`[Database Sync] Skipping agent payout ${p.id} because agent ${p.agentId} does not exist in PostgreSQL.`);
              continue;
            }

            const exists = await pgDb.select().from(pgAgentPayouts).where(eq(pgAgentPayouts.id, p.id));
            if (!exists[0]) {
              await pgDb.insert(pgAgentPayouts).values({
                id: p.id,
                agentId: p.agentId,
                amount: p.amount,
                subordinateRevenue: p.subordinateRevenue,
                type: p.type,
                createdAt: new Date(p.createdAt),
              });
            }
          } catch (err) {
            console.error(`[Database Sync] Failed to sync agent payout ${p.id}:`, err);
          }
        }
      }

      // 7. Sync Coupons
      if (this.data.coupons) {
        for (const c of this.data.coupons) {
          try {
            const exists = await pgDb.select().from(pgCoupons).where(eq(pgCoupons.code, c.code));
            if (!exists[0]) {
              await pgDb.insert(pgCoupons).values({
                code: c.code,
                amount: c.amount,
                isRedeemed: c.isRedeemed,
                redeemedBy: c.redeemedBy || null,
                createdAt: new Date(c.createdAt),
                redeemedAt: c.redeemedAt ? new Date(c.redeemedAt) : null,
              });
            } else if (exists[0].isRedeemed !== c.isRedeemed || exists[0].redeemedBy !== c.redeemedBy) {
              await pgDb.update(pgCoupons).set({
                isRedeemed: c.isRedeemed,
                redeemedBy: c.redeemedBy || null,
                redeemedAt: c.redeemedAt ? new Date(c.redeemedAt) : null,
              }).where(eq(pgCoupons.code, c.code));
            }
          } catch (err) {
            console.error(`[Database Sync] Failed to sync coupon ${c.code}:`, err);
          }
        }
      }

      await this.refreshCache();
    } catch (err) {
      console.error('Failed to sync changes to PostgreSQL:', err);
    }
  }

  public get users() { return this.data.users; }
  public get wallets() { return this.data.wallets; }
  public get transactions() { return this.data.transactions; }
  public get games() { return this.data.games; }
  public get rounds() { return this.data.rounds; }
  public get bets() { return this.data.bets; }
  public get referrals() { return this.data.referrals; }
  public get referralCommissions() { return this.data.referralCommissions; }
  public get notifications() { return this.data.notifications; }
  public get settings() { return this.data.settings; }
  
  public set settings(newSettings: PlatformSettings) {
    this.data.settings = newSettings;
    this.save();
  }
  
  public get auditLogs() { return this.data.auditLogs; }
  public get gatewayOrders() { return this.data.gatewayOrders || (this.data.gatewayOrders = []); }
  public get tickets() { return this.data.tickets || (this.data.tickets = []); }
  public get agentPayouts() { return this.data.agentPayouts || (this.data.agentPayouts = []); }
  public get coupons() { return this.data.coupons || (this.data.coupons = []); }
  public get vaultTransfers() { return this.data.vaultTransfers || (this.data.vaultTransfers = []); }

  public async executeTransaction(cb: (db: DBStructure) => void) {
    cb(this.data);
    await this.save();
  }
}

export const db = new PostgresDatabase();
