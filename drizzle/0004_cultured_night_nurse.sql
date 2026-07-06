ALTER TABLE "platform_settings" ADD COLUMN IF NOT EXISTS "telegram_url" text DEFAULT '' NOT NULL;
