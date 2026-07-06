ALTER TABLE "platform_settings" ADD COLUMN IF NOT EXISTS "google_oauth_enabled" boolean DEFAULT true NOT NULL;
