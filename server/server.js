import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import tasksRoutes from './routes/tasks.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// MIDDLEWARE
// =============================================

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// =============================================
// ROUTES
// =============================================

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FoodBridge API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/tasks', tasksRoutes);

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// =============================================
// SERVER START
// =============================================

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     FoodBridge API Server Running     ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`🚀 Server:    http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log('⏰ Started at:', new Date().toLocaleString());
  console.log('════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
