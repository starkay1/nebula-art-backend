import { Router, Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { authGuard, AuthenticatedRequest } from '../guards/auth.guard';
import { ArtworkService } from '../services/artwork.service';
import { CreateArtworkDto } from '../dto/create-artwork.dto';

export class ArtworkController {
  public router: Router;
  private artworkService: ArtworkService;

  constructor() {
    this.router = Router();
    this.artworkService = new ArtworkService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Protected routes (require authentication)
    this.router.post('/', authGuard.authenticate.bind(authGuard), this.createArtwork.bind(this));
    this.router.put('/:id', authGuard.authenticate.bind(authGuard), this.updateArtwork.bind(this));
    this.router.delete('/:id', authGuard.authenticate.bind(authGuard), this.deleteArtwork.bind(this));
    this.router.post('/:id/like', authGuard.authenticate.bind(authGuard), this.toggleLike.bind(this));

    // Public routes (with optional authentication)
    this.router.get('/', authGuard.optionalAuth.bind(authGuard), this.getArtworks.bind(this));
    this.router.get('/featured', this.getFeaturedArtworks.bind(this));
    this.router.get('/search', authGuard.optionalAuth.bind(authGuard), this.searchArtworks.bind(this));
    this.router.get('/:id', authGuard.optionalAuth.bind(authGuard), this.getArtworkById.bind(this));
  }

  /**
   * Create a new artwork
   */
  private async createArtwork(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const artistId = authenticatedReq.user.id;

      // Check if user is an artist
      if (!authenticatedReq.user.isArtist) {
        res.status(403).json({
          message: 'Only artists can create artworks',
        });
        return;
      }

      // Validate request body
      const createArtworkDto = plainToClass(CreateArtworkDto, req.body);
      const errors = await validate(createArtworkDto);

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

      // Create artwork
      const artwork = await this.artworkService.createArtwork(artistId, createArtworkDto);

      res.status(201).json({
        message: 'Artwork created successfully',
        artwork,
      });
    } catch (error) {
      console.error('Create artwork error:', error);
      
      if (error instanceof Error && error.message.includes('Image processing failed')) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Get artworks with pagination and filtering
   */
  private async getArtworks(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const artistId = req.query.artistId as string;
      const category = req.query.category as string;
      const isForSale = req.query.isForSale === 'true' ? true : req.query.isForSale === 'false' ? false : undefined;
      const sortBy = (req.query.sortBy as 'created_at' | 'likes_count' | 'views_count') || 'created_at';
      const sortOrder = (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC';
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;

      const result = await this.artworkService.getArtworks({
        page,
        limit,
        artistId,
        category,
        isForSale,
        sortBy,
        sortOrder,
        tags,
      });

      res.status(200).json({
        message: 'Artworks retrieved successfully',
        ...result,
      });
    } catch (error) {
      console.error('Get artworks error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Get artwork by ID
   */
  private async getArtworkById(req: Request, res: Response): Promise<void> {
    try {
      const artworkId = req.params.id;
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user?.id;

      const artwork = await this.artworkService.getArtworkById(artworkId, userId);

      if (!artwork) {
        res.status(404).json({
          message: 'Artwork not found',
        });
        return;
      }

      res.status(200).json({
        message: 'Artwork retrieved successfully',
        artwork,
      });
    } catch (error) {
      console.error('Get artwork by ID error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Update artwork
   */
  private async updateArtwork(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const artistId = authenticatedReq.user.id;
      const artworkId = req.params.id;

      // Validate request body
      const updateArtworkDto = plainToClass(CreateArtworkDto, req.body);
      const errors = await validate(updateArtworkDto, { skipMissingProperties: true });

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

      // Update artwork
      const artwork = await this.artworkService.updateArtwork(artworkId, artistId, updateArtworkDto);

      res.status(200).json({
        message: 'Artwork updated successfully',
        artwork,
      });
    } catch (error) {
      console.error('Update artwork error:', error);
      
      if (error instanceof Error && (
        error.message.includes('not found') || 
        error.message.includes('unauthorized')
      )) {
        res.status(404).json({
          message: error.message,
        });
        return;
      }

      if (error instanceof Error && error.message.includes('Image processing failed')) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Delete artwork
   */
  private async deleteArtwork(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const artistId = authenticatedReq.user.id;
      const artworkId = req.params.id;

      await this.artworkService.deleteArtwork(artworkId, artistId);

      res.status(200).json({
        message: 'Artwork deleted successfully',
      });
    } catch (error) {
      console.error('Delete artwork error:', error);
      
      if (error instanceof Error && (
        error.message.includes('not found') || 
        error.message.includes('unauthorized')
      )) {
        res.status(404).json({
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Toggle like on artwork
   */
  private async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.id;
      const artworkId = req.params.id;

      const result = await this.artworkService.toggleLike(artworkId, userId);

      res.status(200).json({
        message: result.isLiked ? 'Artwork liked successfully' : 'Artwork unliked successfully',
        ...result,
      });
    } catch (error) {
      console.error('Toggle like error:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Get featured artworks
   */
  private async getFeaturedArtworks(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const artworks = await this.artworkService.getFeaturedArtworks(limit);

      res.status(200).json({
        message: 'Featured artworks retrieved successfully',
        artworks,
      });
    } catch (error) {
      console.error('Get featured artworks error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Search artworks
   */
  private async searchArtworks(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          message: 'Search query is required',
        });
        return;
      }

      const result = await this.artworkService.searchArtworks(query.trim(), {
        page,
        limit,
      });

      res.status(200).json({
        message: 'Search results retrieved successfully',
        query: query.trim(),
        page,
        limit,
        ...result,
      });
    } catch (error) {
      console.error('Search artworks error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }
}
