import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import path from 'path';

// Load environment variables from .env and fall back to .env.example if .env doesn't exist


import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { seedIfNeeded } from './src/db/seed.ts';
import { gameEngine } from './server/services/GameEngine.js';
import apiRouter from './server/api.js';
import { db as schemaDb } from './src/db/index.ts';
import { sql } from 'drizzle-orm';

async function ensureRuntimeSchema() {
  // Existing manually-created Render services might not execute render.yaml's
  // migration command. Keep additive compatibility changes idempotent.
  await schemaDb.execute(sql.raw('ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role text'));
  await schemaDb.execute(sql.raw("ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_permissions jsonb DEFAULT '[]'::jsonb NOT NULL"));
  await schemaDb.execute(sql.raw('ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS google_oauth_enabled boolean DEFAULT true NOT NULL'));
  await schemaDb.execute(sql.raw("ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS telegram_url text DEFAULT '' NOT NULL"));
  await schemaDb.execute(sql.raw('ALTER TABLE referral_commissions ALTER COLUMN bet_id DROP NOT NULL'));
  await schemaDb.execute(sql.raw('ALTER TABLE referral_commissions ADD COLUMN IF NOT EXISTS deposit_transaction_id text'));
  await schemaDb.execute(sql.raw("ALTER TABLE referral_commissions ADD COLUMN IF NOT EXISTS commission_type text DEFAULT 'deposit' NOT NULL"));
  await schemaDb.execute(sql.raw('CREATE UNIQUE INDEX IF NOT EXISTS referral_commissions_deposit_transaction_id_unique ON referral_commissions (deposit_transaction_id)'));
}

async function startServer() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Add it to the Render service environment variables.');
  }
  if (process.env.NODE_ENV === 'production') {
    const required = ['APP_URL', 'MASTER_ADMIN_PASSWORD', 'PAYMENT_CALLBACK_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }

  // Bring older Render databases up to the minimum schema before seeding.
  await ensureRuntimeSchema();

  // Initialize and seed PostgreSQL database
  await seedIfNeeded();
  await db.init();

  const app = express();
  // Render terminates TLS one proxy hop in front of the Node process.
  app.set('trust proxy', 1);
  const isProd = process.env.NODE_ENV === 'production';
 const port = Number(process.env.PORT) || 3000;

  app.use(helmet({ contentSecurityPolicy: false }));
  if (isProd) {
    app.use((_req, res, next) => {
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
      next();
    });
  }

  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: 'draft-7', legacyHeaders: false }));

  // JSON and URL-encoded body parsing middlewares
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Render uses this endpoint to verify that the web process is accepting traffic.
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Register all modular REST API controller endpoints
  app.use('/api', apiRouter);

  // Initialize and run the Game Engine's master clock loop
  gameEngine.startClock();

  if (!isProd) {
    // Create Vite dev server in middleware mode with spa support
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    // Use Vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    // Serve static compiled assets from dist/
    // server.cjs is emitted into dist/, alongside index.html and assets/.
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Support single-page routing fallback
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to launch application server:', err);
});
