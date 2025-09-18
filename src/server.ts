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

// Database status endpoint (simplified)
app.get('/db-status', (req, res) => {
  res.json({ 
    status: 'database configured',
    hasUrl: !!process.env.DATABASE_URL,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API endpoints for frontend compatibility
app.post('/auth/login', (req, res) => {
  res.status(501).json({ 
    message: 'API endpoint not implemented yet',
    endpoint: '/auth/login',
    status: 'coming_soon'
  });
});

app.post('/auth/register', (req, res) => {
  res.status(501).json({ 
    message: 'API endpoint not implemented yet',
    endpoint: '/auth/register',
    status: 'coming_soon'
  });
});

app.get('/users/profile', (req, res) => {
  res.status(501).json({ 
    message: 'API endpoint not implemented yet',
    endpoint: '/users/profile',
    status: 'coming_soon'
  });
});

app.get('/artworks', (req, res) => {
  res.status(501).json({ 
    message: 'API endpoint not implemented yet',
    endpoint: '/artworks',
    status: 'coming_soon'
  });
});

app.get('/curations', (req, res) => {
  res.status(501).json({ 
    message: 'API endpoint not implemented yet',
    endpoint: '/curations',
    status: 'coming_soon'
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Nebula Art API server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Database status: http://localhost:${PORT}/db-status`);
});

export default app;
