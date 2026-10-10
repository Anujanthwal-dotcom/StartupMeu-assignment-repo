import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import connectDB from './config/db';
import authRouter from './routes/authRouter';
import expenseRouter from './routes/expenseRouter';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT ?? 5000;

// --- Global middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// --- API routes ---
app.use('/api/auth', authRouter);
app.use('/api/expenses', expenseRouter);

// --- Error handler (must be last) ---
app.use(errorHandler);

// --- Start ---
const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
