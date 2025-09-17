import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { AppDataSource } from '../main';
import { User } from '../entities/User.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
  userId: string;
}

export class AuthGuard {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Middleware to verify JWT token and attach user to request
   */
  public async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          message: 'Access token is required',
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify JWT token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'default-secret'
      ) as { userId: string; iat: number };

      // Find user in database
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
      });

      if (!user) {
        res.status(401).json({
          message: 'User not found',
        });
        return;
      }

      // Attach user to request object
      (req as AuthenticatedRequest).user = user;
      (req as AuthenticatedRequest).userId = user.id;

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          message: 'Invalid or expired token',
        });
        return;
      }

      console.error('Authentication error:', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  }

  /**
   * Middleware to verify user is an artist
   */
  public async requireArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authenticatedReq = req as AuthenticatedRequest;
    
    if (!authenticatedReq.user) {
      res.status(401).json({
        message: 'Authentication required',
      });
      return;
    }

    if (!authenticatedReq.user.isArtist) {
      res.status(403).json({
        message: 'Artist privileges required',
      });
      return;
    }

    next();
  }

  /**
   * Optional authentication - doesn't fail if no token provided
   */
  public async optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, continue without authentication
        next();
        return;
      }

      const token = authHeader.substring(7);

      // Verify JWT token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'default-secret'
      ) as { userId: string; iat: number };

      // Find user in database
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
      });

      if (user) {
        // Attach user to request object if found
        (req as AuthenticatedRequest).user = user;
        (req as AuthenticatedRequest).userId = user.id;
      }

      next();
    } catch (error) {
      // If token is invalid, continue without authentication
      next();
    }
  }

  /**
   * Check if user owns the resource
   */
  public checkOwnership(userIdField: string = 'userId') {
    return (req: Request, res: Response, next: NextFunction): void => {
      const authenticatedReq = req as AuthenticatedRequest;
      const resourceUserId = req.params[userIdField] || req.body[userIdField];

      if (!authenticatedReq.user) {
        res.status(401).json({
          message: 'Authentication required',
        });
        return;
      }

      if (authenticatedReq.user.id !== resourceUserId) {
        res.status(403).json({
          message: 'Access denied: You can only access your own resources',
        });
        return;
      }

      next();
    };
  }

  /**
   * Rate limiting per user
   */
  public userRateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction): void => {
      const authenticatedReq = req as AuthenticatedRequest;
      
      if (!authenticatedReq.user) {
        res.status(401).json({
          message: 'Authentication required',
        });
        return;
      }

      const userId = authenticatedReq.user.id;
      const now = Date.now();
      const userLimit = userRequestCounts.get(userId);

      if (!userLimit || now > userLimit.resetTime) {
        // Reset or initialize counter
        userRequestCounts.set(userId, {
          count: 1,
          resetTime: now + windowMs,
        });
        next();
        return;
      }

      if (userLimit.count >= maxRequests) {
        res.status(429).json({
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
        });
        return;
      }

      // Increment counter
      userLimit.count++;
      userRequestCounts.set(userId, userLimit);
      next();
    };
  }
}

// Export singleton instance
export const authGuard = new AuthGuard();
