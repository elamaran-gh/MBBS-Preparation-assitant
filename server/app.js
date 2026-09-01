import express from 'express';
import cors from 'cors';
import questionRoutes from './routes/questionRoutes.js';
import referenceRoutes from './routes/referenceRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
// API Routes
app.use('/api/questions', questionRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', documentRoutes);

// Base route check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'healthy', timestamp: new Date() });
});

// Centralized error handling
app.use(errorHandler);

export default app;
