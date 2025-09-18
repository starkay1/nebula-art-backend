import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AppDataSource } from '../main';
import { User } from '../entities/User.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

export class AuthController {
  public router: Router;
  private userRepository: Repository<User>;

  constructor() {
    this.router = Router();
    this.userRepository = AppDataSource.getRepository(User);
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', this.register.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.post('/refresh', this.refreshToken.bind(this));
    this.router.post('/logout', this.logout.bind(this));
  }

  /**
   * Register a new user
   */
  private async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const registerDto = plainToClass(RegisterDto, req.body);
      const errors = await validate(registerDto);

      if (errors.length > 0) {
        res.status(400).json({
          message: 'Validation failed',
          errors: errors.map(error => ({
            field: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: registerDto.email },
          { username: registerDto.username },
        ],
      });

      if (existingUser) {
        res.status(409).json({
          message: existingUser.email === registerDto.email 
            ? 'Email already exists' 
            : 'Username already exists',
        });
        return;
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

      // Create user
      const user = this.userRepository.create({
        email: registerDto.email,
        name: registerDto.name,
        username: registerDto.username,
        passwordHash,
        isArtist: registerDto.isArtist || false,
        bio: registerDto.bio,
        location: registerDto.location,
      });

      const savedUser = await this.userRepository.save(user);

      // Generate JWT token
      const token = this.generateToken(savedUser.id);

      // Update last login
      await this.userRepository.update(savedUser.id, { lastLoginAt: new Date() });

      res.status(201).json({
        message: 'User registered successfully',
        user: savedUser.toJSON(),
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Login user
   */
  private async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const loginDto = plainToClass(LoginDto, req.body);
      const errors = await validate(loginDto);

      if (errors.length > 0) {
        res.status(400).json({
          message: 'Validation failed',
          errors: errors.map(error => ({
            field: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      // Find user by email or username
      const user = await this.userRepository.findOne({
        where: [
          { email: loginDto.emailOrUsername },
          { username: loginDto.emailOrUsername },
        ],
      });

      if (!user) {
        res.status(401).json({
          message: 'Invalid credentials',
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

      if (!isPasswordValid) {
        res.status(401).json({
          message: 'Invalid credentials',
        });
        return;
      }

      // Generate JWT token
      const token = this.generateToken(user.id);

      // Update last login
      await this.userRepository.update(user.id, { lastLoginAt: new Date() });

      res.status(200).json({
        message: 'Login successful',
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Refresh JWT token
   */
  private async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          message: 'Token is required',
        });
        return;
      }

      // Verify current token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };

      // Check if user still exists
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
      });

      if (!user) {
        res.status(401).json({
          message: 'User not found',
        });
        return;
      }

      // Generate new token
      const newToken = this.generateToken(user.id);

      res.status(200).json({
        message: 'Token refreshed successfully',
        token: newToken,
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          message: 'Invalid token',
        });
        return;
      }

      console.error('Token refresh error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Logout user (client-side token removal)
   */
  private async logout(req: Request, res: Response): Promise<void> {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the token from storage. Here we just acknowledge the logout.
    res.status(200).json({
      message: 'Logout successful',
    });
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
  }
}
