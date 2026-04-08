import express from 'express';
import cors from 'cors';
import productRoutes from './routes/products.js';
import reagentRoutes from './routes/reagents.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// CORS configuration
app.use(cors({ origin: 'http://localhost:3000' }));

// JSON body parser
app.use(express.json());

// Mount routes
app.use('/api/products', productRoutes);
app.use('/api/reagents', reagentRoutes);

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
