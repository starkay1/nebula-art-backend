import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import winston from 'winston';

// Import entities
import { User } from './entities/User.entity';
import { Artwork } from './entities/Artwork.entity';
import { Curation } from './entities/Curation.entity';
import { Comment } from './entities/Comment.entity';
import { Like } from './entities/Like.entity';
import { Follow } from './entities/Follow.entity';

// Import controllers
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { ArtworkController } from './controllers/artwork.controller';
import { CurationController } from './controllers/curation.controller';

// Import middleware
import { loggerMiddleware } from './middleware/logger.middleware';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nebula-art-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'nebula_art',
  synchronize: process.env.NODE_ENV !== 'production', // Only sync in development
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Artwork, Curation, Comment, Like, Follow],
  migrations: ['dist/migrations/**/*.js'],
  subscribers: ['dist/subscribers/**/*.js'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function bootstrap(): Promise<void> {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established successfully');

    // Create Express app
    const app = express();

    // Security middleware
    app.use(helmet());
    
    // CORS configuration
    app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: 'Too many requests from this IP, please try again later.',
    });
    app.use(limiter);

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Custom middleware
    app.use(loggerMiddleware);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // API routes
    const authController = new AuthController();
    const userController = new UserController();
    const artworkController = new ArtworkController();
    const curationController = new CurationController();

    app.use('/auth', authController.router);
    app.use('/users', userController.router);
    app.use('/artworks', artworkController.router);
    app.use('/curations', curationController.router);

    // Global error handler
    app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl,
      });
    });

    // Start server
    const PORT = process.env.PORT || 3000;

    // Start the server
    app.listen(PORT, () => {
      logger.info(`🚀 Nebula Art API server is running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🎨 API endpoints: http://localhost:${PORT}/auth, /users, /artworks, /curations`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await AppDataSource.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await AppDataSource.destroy();
  process.exit(0);
});

// Start the application
bootstrap().catch((error) => {
  logger.error('Bootstrap failed:', error);
  process.exit(1);
});

export { AppDataSource };
