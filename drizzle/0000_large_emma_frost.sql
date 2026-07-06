CREATE TABLE "agent_payouts" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"amount" double precision NOT NULL,
	"subordinate_revenue" double precision NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bets" (
	"id" text PRIMARY KEY NOT NULL,
	"round_id" text NOT NULL,
	"user_id" text NOT NULL,
	"game_id" text NOT NULL,
	"game_mode" text NOT NULL,
	"period_number" text NOT NULL,
	"bet_type" text NOT NULL,
	"bet_value" text NOT NULL,
	"amount" double precision NOT NULL,
	"winning_amount" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"win_fee_deducted" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"settled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"code" text PRIMARY KEY NOT NULL,
	"amount" double precision NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"is_redeemed" boolean DEFAULT false NOT NULL,
	"redeemed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"redeemed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "game_rounds" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"game_mode" text NOT NULL,
	"period_number" text NOT NULL,
	"status" text DEFAULT 'betting' NOT NULL,
	"result_color" text,
	"result_number" integer,
	"total_bet_amount" double precision DEFAULT 0 NOT NULL,
	"total_win_amount" double precision DEFAULT 0 NOT NULL,
	"result_strategy" text DEFAULT 'fair' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp,
	"settled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"min_bet" double precision NOT NULL,
	"max_bet" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gateway_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" double precision NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"gateway_tx_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"signup_bonus" double precision NOT NULL,
	"referral_commission_percent" double precision NOT NULL,
	"winning_fee_percent" double precision NOT NULL,
	"min_deposit" double precision NOT NULL,
	"min_withdraw" double precision NOT NULL,
	"is_maintenance_mode" boolean DEFAULT false NOT NULL,
	"maintenance_message" text NOT NULL,
	"announcements" jsonb NOT NULL,
	"wagering_multiplier" double precision DEFAULT 1 NOT NULL,
	"high_bet_always_loss" boolean DEFAULT false NOT NULL,
	"affiliate_banner_text" text DEFAULT 'Earn passive income by inviting your friends!' NOT NULL,
	"affiliate_banner_image_url" text DEFAULT '' NOT NULL,
	"auto_settle_commissions" boolean DEFAULT true NOT NULL,
	"payment_gateways" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_commissions" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_id" text NOT NULL,
	"referee_id" text NOT NULL,
	"bet_id" text NOT NULL,
	"amount" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_id" text NOT NULL,
	"referee_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"admin_reply" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" double precision NOT NULL,
	"current_balance" double precision NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"remark" text NOT NULL,
	"utr" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"mobile" text NOT NULL,
	"username" text,
	"email" text,
	"password_hash" text NOT NULL,
	"referral_code" text NOT NULL,
	"referred_by_code" text,
	"status" text DEFAULT 'active' NOT NULL,
	"is_agent" boolean DEFAULT false NOT NULL,
	"signup_ip" text,
	"bank_name" text,
	"bank_account" text,
	"bank_ifsc" text,
	"bank_holder_name" text,
	"two_factor_secret" text,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_mobile_unique" UNIQUE("mobile"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"user_id" text PRIMARY KEY NOT NULL,
	"balance" double precision DEFAULT 0 NOT NULL,
	"promo_balance" double precision DEFAULT 0 NOT NULL,
	"required_wagering" double precision DEFAULT 0 NOT NULL,
	"completed_wagering" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_payouts" ADD CONSTRAINT "agent_payouts_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_round_id_game_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."game_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_redeemed_by_users_id_fk" FOREIGN KEY ("redeemed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gateway_orders" ADD CONSTRAINT "gateway_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_referee_id_users_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_bet_id_bets_id_fk" FOREIGN KEY ("bet_id") REFERENCES "public"."bets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referee_id_users_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;