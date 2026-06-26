import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './services/db.js';
import joinRouter from './routes/join.js';
import adminRouter from './routes/admin.js';
import inquiryRouter from './routes/inquiry.js';
import membershipRouter from './routes/membership.js';

const app = express();
const PORT = process.env.PORT ?? 4000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development (including static files)
  methods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/join', joinRouter);
app.use('/api/admin', adminRouter);
app.use('/api/inquiry', inquiryRouter);
app.use('/api/membership', membershipRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Start
async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Server] Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

start();
