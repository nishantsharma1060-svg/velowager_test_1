import { pgTable, text, boolean, doublePrecision, timestamp, integer, serial, jsonb } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  mobile: text('mobile').notNull().unique(),
  username: text('username'),
  email: text('email'),
  passwordHash: text('password_hash').notNull(),
  referralCode: text('referral_code').notNull().unique(),
  referredByCode: text('referred_by_code'),
  status: text('status').$type<'active' | 'frozen' | 'banned'>().default('active').notNull(),
  isAgent: boolean('is_agent').default(false).notNull(),
  adminRole: text('admin_role').$type<'master' | 'operations' | 'finance' | 'support' | 'games' | 'viewer'>(),
  adminPermissions: jsonb('admin_permissions').$type<string[]>().default([]).notNull(),
  signupIp: text('signup_ip'),
  
  // Bank details required before withdrawal
  bankName: text('bank_name'),
  bankAccount: text('bank_account'),
  bankIfsc: text('bank_ifsc'),
  bankHolderName: text('bank_holder_name'),
  
  // 2FA details
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Wallets Table
export const wallets = pgTable('wallets', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  balance: doublePrecision('balance').default(0).notNull(),
  promoBalance: doublePrecision('promo_balance').default(0).notNull(),
  requiredWagering: doublePrecision('required_wagering').default(0).notNull(),
  completedWagering: doublePrecision('completed_wagering').default(0).notNull(),
});

// 3. Transactions Table
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').$type<'deposit' | 'withdraw' | 'bet_deduct' | 'winning_credit' | 'referral_commission' | 'admin_credit' | 'admin_debit'>().notNull(),
  amount: doublePrecision('amount').notNull(),
  currentBalance: doublePrecision('current_balance').notNull(),
  status: text('status').$type<'pending' | 'approved' | 'rejected'>().default('pending').notNull(),
  remark: text('remark').notNull(),
  utr: text('utr'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Games Table
export const games = pgTable('games', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  minBet: doublePrecision('min_bet').notNull(),
  maxBet: doublePrecision('max_bet').notNull(),
});

// 5. GameRounds Table
export const gameRounds = pgTable('game_rounds', {
  id: text('id').primaryKey(),
  gameId: text('game_id').references(() => games.id, { onDelete: 'cascade' }).notNull(),
  gameMode: text('game_mode').notNull(), // '30s', '1m', '3m', '5m'
  periodNumber: text('period_number').notNull(),
  status: text('status').$type<'betting' | 'closed' | 'settled'>().default('betting').notNull(),
  resultColor: text('result_color'), // 'red', 'green', 'violet', 'red-violet', 'green-violet'
  resultNumber: integer('result_number'), // 0-9
  totalBetAmount: doublePrecision('total_bet_amount').default(0).notNull(),
  totalWinAmount: doublePrecision('total_win_amount').default(0).notNull(),
  resultStrategy: text('result_strategy').$type<'fair' | 'admin_manual' | 'high_profit'>().default('fair').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
  settledAt: timestamp('settled_at'),
});

// 6. Bets Table
export const bets = pgTable('bets', {
  id: text('id').primaryKey(),
  roundId: text('round_id').references(() => gameRounds.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  gameId: text('game_id').references(() => games.id, { onDelete: 'cascade' }).notNull(),
  gameMode: text('game_mode').notNull(),
  periodNumber: text('period_number').notNull(),
  betType: text('bet_type').$type<'color' | 'number'>().notNull(), // 'color' or 'number'
  betValue: text('bet_value').notNull(), // 'red', 'green', 'violet' or '0'-'9'
  amount: doublePrecision('amount').notNull(),
  winningAmount: doublePrecision('winning_amount').default(0).notNull(),
  status: text('status').$type<'pending' | 'won' | 'lost'>().default('pending').notNull(),
  winFeeDeducted: doublePrecision('win_fee_deducted').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  settledAt: timestamp('settled_at'),
});

// 7. Referrals Table
export const referrals = pgTable('referrals', {
  id: text('id').primaryKey(),
  referrerId: text('referrer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  refereeId: text('referee_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. ReferralCommissions Table
export const referralCommissions = pgTable('referral_commissions', {
  id: text('id').primaryKey(),
  referrerId: text('referrer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  refereeId: text('referee_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  betId: text('bet_id').references(() => bets.id, { onDelete: 'cascade' }),
  depositTransactionId: text('deposit_transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).unique(),
  commissionType: text('commission_type').$type<'bet' | 'deposit'>().default('deposit').notNull(),
  amount: doublePrecision('amount').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Notifications Table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. PlatformSettings Table
export const platformSettings = pgTable('platform_settings', {
  id: integer('id').primaryKey(), // fixed to 1
  signupBonus: doublePrecision('signup_bonus').notNull(),
  referralCommissionPercent: doublePrecision('referral_commission_percent').notNull(),
  winningFeePercent: doublePrecision('winning_fee_percent').notNull(),
  minDeposit: doublePrecision('min_deposit').notNull(),
  minWithdraw: doublePrecision('min_withdraw').notNull(),
  isMaintenanceMode: boolean('is_maintenance_mode').default(false).notNull(),
  maintenanceMessage: text('maintenance_message').notNull(),
  announcements: jsonb('announcements').$type<string[]>().notNull(),
  wageringMultiplier: doublePrecision('wagering_multiplier').default(1).notNull(),
  highBetAlwaysLoss: boolean('high_bet_always_loss').default(false).notNull(),
  affiliateBannerText: text('affiliate_banner_text').default('Earn passive income by inviting your friends!').notNull(),
  affiliateBannerImageUrl: text('affiliate_banner_image_url').default('').notNull(),
  autoSettleCommissions: boolean('auto_settle_commissions').default(true).notNull(),
  paymentGateways: jsonb('payment_gateways').$type<any[]>().default([]).notNull(),
  googleOAuthEnabled: boolean('google_oauth_enabled').default(true).notNull(),
});

// 11. AuditLogs Table
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. GatewayOrders Table
export const gatewayOrders = pgTable('gateway_orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: doublePrecision('amount').notNull(),
  status: text('status').$type<'pending' | 'success' | 'failed'>().default('pending').notNull(),
  paymentMethod: text('payment_method'),
  gatewayTxId: text('gateway_tx_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
});

// 13. Support Tickets Table
export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').$type<'open' | 'resolved'>().default('open').notNull(),
  adminReply: text('admin_reply'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
});

// 14. Agent Payouts Table
export const agentPayouts = pgTable('agent_payouts', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: doublePrecision('amount').notNull(),
  subordinateRevenue: doublePrecision('subordinate_revenue').notNull(),
  type: text('type').$type<'manual' | 'automatic'>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 15. Admin Coupons Table
export const coupons = pgTable('coupons', {
  code: text('code').primaryKey(),
  amount: doublePrecision('amount').notNull(),
  currency: text('currency').default('INR').notNull(),
  isRedeemed: boolean('is_redeemed').default(false).notNull(),
  redeemedBy: text('redeemed_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  redeemedAt: timestamp('redeemed_at'),
});
