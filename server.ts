import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import path from 'path';

// Load environment variables from .env and fall back to .env.example if .env doesn't exist


import express from 'express';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { seedIfNeeded } from './src/db/seed.ts';
import { gameEngine } from './server/services/GameEngine.js';
import apiRouter from './server/api.js';

async function startServer() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Add it to the Render service environment variables.');
  }

  // Initialize and seed PostgreSQL database
  await seedIfNeeded();
  await db.init();

  const app = express();
  app.set('trust proxy', true);
  const isProd = process.env.NODE_ENV === 'production';
 const port = Number(process.env.PORT) || 3000;

  // JSON and URL-encoded body parsing middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
