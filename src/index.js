import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectToDatabase } from './config/db.js';
import dataEntriesRouter from './routes/dataEntries.js';
import authRouter from './routes/auth.js';

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// JSON parsing with error handling
app.use(express.json({ limit: '1mb' }));

// Custom JSON error handler for invalid JSON (must be after JSON parser)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next(err);
});

// Health check - optimized for performance
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/data-entries', dataEntriesRouter);
app.use('/api/auth', authRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 4000;

async function start() {
  await connectToDatabase();
  app.listen(port, '0.0.0.0', () => {
    console.log(`API listening on port ${port}`);
    console.log(`Server accessible at http://localhost:${port} `);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});


