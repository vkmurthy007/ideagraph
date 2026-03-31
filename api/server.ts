// api/server.ts
// Express server entry point.
// Run with: tsx watch api/server.ts

import express from 'express';
import cors from 'cors';
import { handleGenerate } from './generate';
import { handleEnrich } from './enrich';
import { handleCollapse } from './collapse';
import { handleExpand } from './expand';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: [
    'http://localhost:5173',            // Vite dev server
    'http://localhost:4173',            // Vite preview
    /https:\/\/.*\.github\.io$/,        // Any GitHub Pages domain
    process.env.FRONTEND_URL ?? '',     // Explicit production frontend URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '50kb' }));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    model: 'claude-sonnet-4-20250514',
  });
});

// ─── Graph generation routes ──────────────────────────────────────────────────

app.post('/api/generate', handleGenerate);
app.post('/api/enrich',   handleEnrich);
app.post('/api/collapse', handleCollapse);
app.post('/api/expand',   handleExpand);

// ─── 404 fallback ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[IdeaGraph API] Running on http://localhost:${PORT}`);
  console.log(`[IdeaGraph API] Anthropic key: ${process.env.ANTHROPIC_API_KEY ? '✓ set' : '✗ missing'}`);
});

export default app;
