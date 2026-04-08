import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/products.js';
import reagentRoutes from './routes/reagents.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS configuration
app.use(cors());

// JSON body parser
app.use(express.json());

// Mount API routes
app.use('/api/products', productRoutes);
app.use('/api/reagents', reagentRoutes);

// Serve frontend static files in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback: serve index.html for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ success: false, error: 'Route not found' });
  } else {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
