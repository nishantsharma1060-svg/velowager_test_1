ALTER TABLE "referral_commissions" ALTER COLUMN "bet_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "referral_commissions" ADD COLUMN "deposit_transaction_id" text;--> statement-breakpoint
ALTER TABLE "referral_commissions" ADD COLUMN "commission_type" text DEFAULT 'deposit' NOT NULL;--> statement-breakpoint
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_deposit_transaction_id_transactions_id_fk" FOREIGN KEY ("deposit_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_deposit_transaction_id_unique" UNIQUE("deposit_transaction_id");