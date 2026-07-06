ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "admin_role" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "admin_permissions" jsonb DEFAULT '[]'::jsonb NOT NULL;
