import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env and fall back to .env.example if .env doesn't exist
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
}
if (fs.existsSync('.env.example')) {
  dotenv.config({ path: '.env.example' });
}

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { seedIfNeeded } from './src/db/seed.ts';
import { gameEngine } from './server/services/GameEngine.js';
import apiRouter from './server/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize and seed PostgreSQL database
  console.log('Server: Initializing Cloud SQL PostgreSQL connection...');
  await db.init();
  await seedIfNeeded();

  const app = express();
  app.set('trust proxy', true);
  const isProd = process.env.NODE_ENV === 'production';
  const port = 3000;

  // JSON and URL-encoded body parsing middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register all modular REST API controller endpoints
  app.use('/api', apiRouter);

  // Initialize and run the Game Engine's master clock loop
  gameEngine.startClock();

  if (!isProd) {
    console.log('Server: Running in DEVELOPMENT mode. Integrating Vite middleware...');
    
    // Create Vite dev server in middleware mode with spa support
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    // Use Vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    console.log('Server: Running in PRODUCTION mode. Serving pre-built static files...');
    
    // Serve static compiled assets from dist/
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    // Support single-page routing fallback
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Modular Gaming Platform Server started successfully at http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to launch application server:', err);
});
