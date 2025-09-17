import { Router, Request, Response } from 'express';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AppDataSource } from '../main';
import { User } from '../entities/User.entity';
import { Follow } from '../entities/Follow.entity';
import { authGuard, AuthenticatedRequest } from '../guards/auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';

export class UserController {
  public router: Router;
  private userRepository: Repository<User>;
  private followRepository: Repository<Follow>;

  constructor() {
    this.router = Router();
    this.userRepository = AppDataSource.getRepository(User);
    this.followRepository = AppDataSource.getRepository(Follow);
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Protected routes (require authentication)
    this.router.get('/me', authGuard.authenticate.bind(authGuard), this.getCurrentUser.bind(this));
    this.router.put('/me', authGuard.authenticate.bind(authGuard), this.updateCurrentUser.bind(this));
    this.router.post('/follow/:userId', authGuard.authenticate.bind(authGuard), this.followUser.bind(this));
    this.router.delete('/follow/:userId', authGuard.authenticate.bind(authGuard), this.unfollowUser.bind(this));
    this.router.get('/following', authGuard.authenticate.bind(authGuard), this.getFollowing.bind(this));
    this.router.get('/followers', authGuard.authenticate.bind(authGuard), this.getFollowers.bind(this));

    // Public routes
    this.router.get('/artists', this.getArtists.bind(this));
    this.router.get('/:userId', this.getUserById.bind(this));
    this.router.get('/:userId/followers', this.getUserFollowers.bind(this));
    this.router.get('/:userId/following', this.getUserFollowing.bind(this));
  }

  /**
   * Get current authenticated user
   */
  private async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const user = authenticatedReq.user;

      res.status(200).json({
        message: 'User retrieved successfully',
        user: user.toJSON(),
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Update current user profile
   */
  private async updateCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.id;

      // Validate request body
      const updateUserDto = plainToClass(UpdateUserDto, req.body);
      const errors = await validate(updateUserDto);

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

      // Check if username is being changed and is available
      if (updateUserDto.username) {
        const existingUser = await this.userRepository.findOne({
          where: { username: updateUserDto.username },
        });

        if (existingUser && existingUser.id !== userId) {
          res.status(409).json({
            message: 'Username already exists',
          });
          return;
        }
      }

      // Update user
      await this.userRepository.update(userId, updateUserDto);

      // Get updated user
      const updatedUser = await this.userRepository.findOne({
        where: { id: userId },
      });

      res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser?.toJSON(),
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Follow a user
   */
  private async followUser(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const followerId = authenticatedReq.user.id;
      const followingId = req.params.userId;

      // Check if trying to follow self
      if (followerId === followingId) {
        res.status(400).json({
          message: 'Cannot follow yourself',
        });
        return;
      }

      // Check if target user exists
      const targetUser = await this.userRepository.findOne({
        where: { id: followingId },
      });

      if (!targetUser) {
        res.status(404).json({
          message: 'User not found',
        });
        return;
      }

      // Check if already following
      const existingFollow = await this.followRepository.findOne({
        where: { followerId, followingId },
      });

      if (existingFollow) {
        res.status(409).json({
          message: 'Already following this user',
        });
        return;
      }

      // Create follow relationship
      const follow = this.followRepository.create({
        followerId,
        followingId,
      });

      await this.followRepository.save(follow);

      // Update counters
      await Promise.all([
        this.userRepository.increment({ id: followerId }, 'followingCount', 1),
        this.userRepository.increment({ id: followingId }, 'followersCount', 1),
      ]);

      res.status(201).json({
        message: 'User followed successfully',
        isFollowing: true,
      });
    } catch (error) {
      console.error('Follow user error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Unfollow a user
   */
  private async unfollowUser(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const followerId = authenticatedReq.user.id;
      const followingId = req.params.userId;

      // Find follow relationship
      const follow = await this.followRepository.findOne({
        where: { followerId, followingId },
      });

      if (!follow) {
        res.status(404).json({
          message: 'Not following this user',
        });
        return;
      }

      // Remove follow relationship
      await this.followRepository.remove(follow);

      // Update counters
      await Promise.all([
        this.userRepository.decrement({ id: followerId }, 'followingCount', 1),
        this.userRepository.decrement({ id: followingId }, 'followersCount', 1),
      ]);

      res.status(200).json({
        message: 'User unfollowed successfully',
        isFollowing: false,
      });
    } catch (error) {
      console.error('Unfollow user error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Get users that current user is following
   */
  private async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      const follows = await this.followRepository.find({
        where: { followerId: userId },
        relations: ['following'],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const following = follows.map(follow => follow.following.toJSON());

      res.status(200).json({
        message: 'Following list retrieved successfully',
        following,
        page,
        limit,
        total: follows.length,
      });
    } catch (error) {
      console.error('Get following error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Get current user's followers
   */
  private async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      const follows = await this.followRepository.find({
        where: { followingId: userId },
        relations: ['follower'],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const followers = follows.map(follow => follow.follower.toJSON());

      res.status(200).json({
        message: 'Followers list retrieved successfully',
        followers,
        page,
        limit,
        total: follows.length,
      });
    } catch (error) {
      console.error('Get followers error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Get list of artists
   */
  private async getArtists(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const search = req.query.search as string;

      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .where('user.isArtist = :isArtist', { isArtist: true });

      // Add search filter
      if (search) {
        queryBuilder.andWhere(
          '(user.name ILIKE :search OR user.username ILIKE :search OR user.location ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Order by followers count and creation date
      queryBuilder.orderBy('user.followersCount', 'DESC')
                  .addOrderBy('user.createdAt', 'DESC');

      // Apply pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const [artists, total] = await queryBuilder.getManyAndCount();

      res.status(200).json({
        message: 'Artists retrieved successfully',
        artists: artists.map(artist => artist.toJSON()),
        page,
        limit,
        total,
      });
    } catch (error) {
      console.error('Get artists error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Get user by ID
   */
  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        message: 'User retrieved successfully',
        user: user.toJSON(),
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Get user's followers
   */
  private async getUserFollowers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      // Check if user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        res.status(404).json({
          message: 'User not found',
        });
        return;
      }

      const follows = await this.followRepository.find({
        where: { followingId: userId },
        relations: ['follower'],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const followers = follows.map(follow => follow.follower.toJSON());

      res.status(200).json({
        message: 'User followers retrieved successfully',
        followers,
        page,
        limit,
        total: follows.length,
      });
    } catch (error) {
      console.error('Get user followers error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Get users that the specified user is following
   */
  private async getUserFollowing(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      // Check if user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        res.status(404).json({
          message: 'User not found',
        });
        return;
      }

      const follows = await this.followRepository.find({
        where: { followerId: userId },
        relations: ['following'],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const following = follows.map(follow => follow.following.toJSON());

      res.status(200).json({
        message: 'User following retrieved successfully',
        following,
        page,
        limit,
        total: follows.length,
      });
    } catch (error) {
      console.error('Get user following error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }
}
