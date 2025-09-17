import { Router, Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { authGuard, AuthenticatedRequest } from '../guards/auth.guard';
import { CurationService } from '../services/curation.service';
import { CreateCurationDto } from '../dto/create-curation.dto';

export class CurationController {
  public router: Router;
  private curationService: CurationService;

  constructor() {
    this.router = Router();
    this.curationService = new CurationService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Protected routes (require authentication)
    this.router.post('/', authGuard.authenticate.bind(authGuard), this.createCuration.bind(this));
    this.router.put('/:id', authGuard.authenticate.bind(authGuard), this.updateCuration.bind(this));
    this.router.delete('/:id', authGuard.authenticate.bind(authGuard), this.deleteCuration.bind(this));
    this.router.post('/:id/artworks', authGuard.authenticate.bind(authGuard), this.addArtworkToCuration.bind(this));
    this.router.delete('/:id/artworks/:artworkId', authGuard.authenticate.bind(authGuard), this.removeArtworkFromCuration.bind(this));
    this.router.put('/:id/reorder', authGuard.authenticate.bind(authGuard), this.reorderArtworks.bind(this));

    // Public routes (with optional authentication)
    this.router.get('/', authGuard.optionalAuth.bind(authGuard), this.getCurations.bind(this));
    this.router.get('/featured', this.getFeaturedCurations.bind(this));
    this.router.get('/:id', authGuard.optionalAuth.bind(authGuard), this.getCurationById.bind(this));
    this.router.get('/:id/artworks', authGuard.optionalAuth.bind(authGuard), this.getCurationArtworks.bind(this));
  }

  /**
   * Create a new curation
   */
  private async createCuration(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const curatorId = authenticatedReq.user.id;

      // Validate request body
      const createCurationDto = plainToClass(CreateCurationDto, req.body);
      const errors = await validate(createCurationDto);

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

      // Create curation
      const curation = await this.curationService.createCuration(curatorId, createCurationDto);

      res.status(201).json({
        message: 'Curation created successfully',
        curation,
      });
    } catch (error) {
      console.error('Create curation error:', error);
      
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
   * Get curations with pagination and filtering
   */
  private async getCurations(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const curatorId = req.query.curatorId as string;
      const category = req.query.category as string;
      const theme = req.query.theme as string;
      const sortBy = (req.query.sortBy as 'created_at' | 'likes_count' | 'views_count') || 'created_at';
      const sortOrder = (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC';

      const result = await this.curationService.getCurations({
        page,
        limit,
        curatorId,
        category,
        theme,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        message: 'Curations retrieved successfully',
        ...result,
      });
    } catch (error) {
      console.error('Get curations error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Get curation by ID
   */
  private async getCurationById(req: Request, res: Response): Promise<void> {
    try {
      const curationId = req.params.id;

      const curation = await this.curationService.getCurationById(curationId);

      if (!curation) {
        res.status(404).json({
          message: 'Curation not found',
        });
        return;
      }

      res.status(200).json({
        message: 'Curation retrieved successfully',
        curation,
      });
    } catch (error) {
      console.error('Get curation by ID error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Update curation
   */
  private async updateCuration(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const curatorId = authenticatedReq.user.id;
      const curationId = req.params.id;

      // Validate request body
      const updateCurationDto = plainToClass(CreateCurationDto, req.body);
      const errors = await validate(updateCurationDto, { skipMissingProperties: true });

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

      // Update curation
      const curation = await this.curationService.updateCuration(curationId, curatorId, updateCurationDto);

      res.status(200).json({
        message: 'Curation updated successfully',
        curation,
      });
    } catch (error) {
      console.error('Update curation error:', error);
      
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
   * Delete curation
   */
  private async deleteCuration(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const curatorId = authenticatedReq.user.id;
      const curationId = req.params.id;

      await this.curationService.deleteCuration(curationId, curatorId);

      res.status(200).json({
        message: 'Curation deleted successfully',
      });
    } catch (error) {
      console.error('Delete curation error:', error);
      
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
   * Add artwork to curation
   */
  private async addArtworkToCuration(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const curatorId = authenticatedReq.user.id;
      const curationId = req.params.id;
      const { artworkId } = req.body;

      if (!artworkId) {
        res.status(400).json({
          message: 'Artwork ID is required',
        });
        return;
      }

      const curation = await this.curationService.addArtworkToCuration(curationId, curatorId, artworkId);

      res.status(200).json({
        message: 'Artwork added to curation successfully',
        curation,
      });
    } catch (error) {
      console.error('Add artwork to curation error:', error);
      
      if (error instanceof Error && (
        error.message.includes('not found') || 
        error.message.includes('unauthorized') ||
        error.message.includes('already exists')
      )) {
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
   * Remove artwork from curation
   */
  private async removeArtworkFromCuration(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const curatorId = authenticatedReq.user.id;
      const curationId = req.params.id;
      const artworkId = req.params.artworkId;

      const curation = await this.curationService.removeArtworkFromCuration(curationId, curatorId, artworkId);

      res.status(200).json({
        message: 'Artwork removed from curation successfully',
        curation,
      });
    } catch (error) {
      console.error('Remove artwork from curation error:', error);
      
      if (error instanceof Error && (
        error.message.includes('not found') || 
        error.message.includes('unauthorized')
      )) {
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
   * Reorder artworks in curation
   */
  private async reorderArtworks(req: Request, res: Response): Promise<void> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const curatorId = authenticatedReq.user.id;
      const curationId = req.params.id;
      const { artworkIds } = req.body;

      if (!Array.isArray(artworkIds)) {
        res.status(400).json({
          message: 'Artwork IDs must be an array',
        });
        return;
      }

      const curation = await this.curationService.reorderArtworks(curationId, curatorId, artworkIds);

      res.status(200).json({
        message: 'Artworks reordered successfully',
        curation,
      });
    } catch (error) {
      console.error('Reorder artworks error:', error);
      
      if (error instanceof Error && (
        error.message.includes('not found') || 
        error.message.includes('unauthorized') ||
        error.message.includes('Invalid')
      )) {
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
   * Get featured curations
   */
  private async getFeaturedCurations(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const curations = await this.curationService.getFeaturedCurations(limit);

      res.status(200).json({
        message: 'Featured curations retrieved successfully',
        curations,
      });
    } catch (error) {
      console.error('Get featured curations error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }

  /**
   * Get artworks in a curation
   */
  private async getCurationArtworks(req: Request, res: Response): Promise<void> {
    try {
      const curationId = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      const result = await this.curationService.getCurationArtworks(curationId, page, limit);

      res.status(200).json({
        message: 'Curation artworks retrieved successfully',
        ...result,
      });
    } catch (error) {
      console.error('Get curation artworks error:', error);
      
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
}
