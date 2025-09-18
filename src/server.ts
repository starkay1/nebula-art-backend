import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simple Express app for testing
const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'nebula-art-backend'
  });
});

// Basic API info
app.get('/', (req, res) => {
  res.json({
    message: 'Nebula Art Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth/*',
      users: '/users/*',
      artworks: '/artworks/*',
      curations: '/curations/*'
    }
  });
});

// Database configuration (simplified)
let AppDataSource: DataSource | null = null;

if (process.env.DATABASE_URL) {
  AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false, // Don't auto-sync in production
    logging: false,
    entities: [], // Empty for now
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

// Test database connection
app.get('/db-test', async (req, res) => {
  try {
    if (!AppDataSource) {
      return res.json({ status: 'no database configured' });
    }
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    res.json({ 
      status: 'database connected',
      isConnected: AppDataSource.isInitialized 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'database error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Nebula Art API server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Database test: http://localhost:${PORT}/db-test`);
});

export default app;
