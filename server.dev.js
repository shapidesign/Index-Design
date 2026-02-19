/**
 * Local Development API Server
 * Runs alongside Vite to serve /api/* routes during dev
 * Usage: node server.dev.js
 */

import './load-env.js'; // Must be first to populate env before other imports run
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Use absolute path for .env.local (dotenv fallback)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // fallback to .env
import express from 'express';
import resourcesHandler from './api/resources.js';
import hallOfFameHandler from './api/hall-of-fame.js';
import museumHandler from './api/museum.js';
import booksHandler from './api/books.js';
import suggestionsHandler from './api/suggestions.js';

const app = express();
const PORT = 3000;

// Parse JSON body
app.use(express.json());

// Wrap Vercel handler for Express
function wrapHandler(handler) {
  return async (req, res) => {
    // Vercel-style req.query is already provided by Express
    try {
      await handler(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// API routes
app.all('/api/resources', wrapHandler(resourcesHandler));
app.all('/api/hall-of-fame', wrapHandler(hallOfFameHandler));
app.all('/api/museum', wrapHandler(museumHandler));
app.all('/api/books', wrapHandler(booksHandler));
app.all('/api/suggestions', wrapHandler(suggestionsHandler));

app.listen(PORT, () => {
  console.log(`🎮 Dev API server running at http://localhost:${PORT}`);
  console.log(`   Resources: http://localhost:${PORT}/api/resources`);
  console.log(`   Search:    http://localhost:${PORT}/api/resources?q=font`);
});
