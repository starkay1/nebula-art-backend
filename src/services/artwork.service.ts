import { Repository } from 'typeorm';
import { AppDataSource } from '../main';
import { Artwork } from '../entities/Artwork.entity';
import { User } from '../entities/User.entity';
import { Like } from '../entities/Like.entity';
import { ImageUtils } from '../utils/image.utils';
import { CreateArtworkDto } from '../dto/create-artwork.dto';

export interface ArtworkQueryOptions {
  page?: number;
  limit?: number;
  artistId?: string;
  tags?: string[];
  category?: string;
  isForSale?: boolean;
  sortBy?: 'created_at' | 'likes_count' | 'views_count';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ProcessedImageUrls {
  original: string;
  medium: string;
  thumbnail: string;
}

export class ArtworkService {
  private artworkRepository: Repository<Artwork>;
  private userRepository: Repository<User>;
  private likeRepository: Repository<Like>;
  private imageUtils: ImageUtils;

  constructor() {
    this.artworkRepository = AppDataSource.getRepository(Artwork);
    this.userRepository = AppDataSource.getRepository(User);
    this.likeRepository = AppDataSource.getRepository(Like);
    this.imageUtils = new ImageUtils();
  }

  /**
   * Create a new artwork with image processing
   */
  async createArtwork(artistId: string, createArtworkDto: CreateArtworkDto): Promise<Artwork> {
    // Verify artist exists
    const artist = await this.userRepository.findOne({ where: { id: artistId } });
    if (!artist) {
      throw new Error('Artist not found');
    }

    // Process uploaded image
    let processedImages: ProcessedImageUrls;
    try {
      processedImages = await this.imageUtils.processArtworkImage(createArtworkDto.imageData);
    } catch (error) {
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Get image dimensions
    const dimensions = await this.imageUtils.getImageDimensions(processedImages.original);

    // Create artwork entity
    const artwork = this.artworkRepository.create({
      title: createArtworkDto.title,
      description: createArtworkDto.description,
      imageUrl: processedImages.original,
      thumbnailUrl: processedImages.thumbnail,
      mediumUrl: processedImages.medium,
      artistId,
      tags: createArtworkDto.tags,
      category: createArtworkDto.category,
      medium: createArtworkDto.medium,
      width: dimensions?.width,
      height: dimensions?.height,
      price: createArtworkDto.price,
      currency: createArtworkDto.currency || 'CNY',
      isForSale: createArtworkDto.isForSale || false,
      isPublic: createArtworkDto.isPublic !== false, // Default to true
    });

    // Save artwork
    const savedArtwork = await this.artworkRepository.save(artwork);

    // Update artist's artwork count
    await this.userRepository.increment({ id: artistId }, 'artworksCount', 1);

    // Load artwork with artist relation
    return await this.artworkRepository.findOne({
      where: { id: savedArtwork.id },
      relations: ['artist'],
    }) as Artwork;
  }

  /**
   * Get artworks with pagination and filtering
   */
  async getArtworks(options: ArtworkQueryOptions = {}): Promise<{ artworks: Artwork[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      artistId,
      tags,
      category,
      isForSale,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = options;

    const queryBuilder = this.artworkRepository
      .createQueryBuilder('artwork')
      .leftJoinAndSelect('artwork.artist', 'artist')
      .where('artwork.isPublic = :isPublic', { isPublic: true });

    // Apply filters
    if (artistId) {
      queryBuilder.andWhere('artwork.artistId = :artistId', { artistId });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('artwork.tags && :tags', { tags });
    }

    if (category) {
      queryBuilder.andWhere('artwork.category = :category', { category });
    }

    if (isForSale !== undefined) {
      queryBuilder.andWhere('artwork.isForSale = :isForSale', { isForSale });
    }

    // Apply sorting
    queryBuilder.orderBy(`artwork.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [artworks, total] = await queryBuilder.getManyAndCount();

    return {
      artworks,
      total,
      page,
      limit,
    };
  }

  /**
   * Get artwork by ID
   */
  async getArtworkById(id: string, userId?: string): Promise<Artwork | null> {
    const artwork = await this.artworkRepository.findOne({
      where: { id },
      relations: ['artist'],
    });

    if (!artwork) {
      return null;
    }

    // Increment view count
    await this.artworkRepository.increment({ id }, 'viewsCount', 1);

    // Check if user has liked this artwork
    if (userId) {
      const like = await this.likeRepository.findOne({
        where: { userId, artworkId: id },
      });
      (artwork as any).isLiked = !!like;
    }

    return artwork;
  }

  /**
   * Update artwork
   */
  async updateArtwork(id: string, artistId: string, updateData: Partial<CreateArtworkDto>): Promise<Artwork> {
    const artwork = await this.artworkRepository.findOne({
      where: { id, artistId },
    });

    if (!artwork) {
      throw new Error('Artwork not found or unauthorized');
    }

    // Process new image if provided
    if (updateData.imageData) {
      try {
        const processedImages = await this.imageUtils.processArtworkImage(updateData.imageData);
        const dimensions = await this.imageUtils.getImageDimensions(processedImages.original);

        updateData.imageUrl = processedImages.original;
        updateData.thumbnailUrl = processedImages.thumbnail;
        updateData.mediumUrl = processedImages.medium;
        updateData.width = dimensions?.width;
        updateData.height = dimensions?.height;

        // Clean up old images
        await this.imageUtils.deleteImage(artwork.imageUrl);
        if (artwork.thumbnailUrl) await this.imageUtils.deleteImage(artwork.thumbnailUrl);
        if (artwork.mediumUrl) await this.imageUtils.deleteImage(artwork.mediumUrl);
      } catch (error) {
        throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Remove imageData from update as it's not a database field
    const { imageData, ...dbUpdateData } = updateData;

    // Update artwork
    await this.artworkRepository.update(id, dbUpdateData);

    // Return updated artwork with relations
    return await this.artworkRepository.findOne({
      where: { id },
      relations: ['artist'],
    }) as Artwork;
  }

  /**
   * Delete artwork
   */
  async deleteArtwork(id: string, artistId: string): Promise<void> {
    const artwork = await this.artworkRepository.findOne({
      where: { id, artistId },
    });

    if (!artwork) {
      throw new Error('Artwork not found or unauthorized');
    }

    // Delete associated images
    await this.imageUtils.deleteImage(artwork.imageUrl);
    if (artwork.thumbnailUrl) await this.imageUtils.deleteImage(artwork.thumbnailUrl);
    if (artwork.mediumUrl) await this.imageUtils.deleteImage(artwork.mediumUrl);

    // Delete artwork
    await this.artworkRepository.remove(artwork);

    // Update artist's artwork count
    await this.userRepository.decrement({ id: artistId }, 'artworksCount', 1);
  }

  /**
   * Toggle like on artwork
   */
  async toggleLike(artworkId: string, userId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const artwork = await this.artworkRepository.findOne({ where: { id: artworkId } });
    if (!artwork) {
      throw new Error('Artwork not found');
    }

    const existingLike = await this.likeRepository.findOne({
      where: { userId, artworkId },
    });

    if (existingLike) {
      // Unlike
      await this.likeRepository.remove(existingLike);
      await this.artworkRepository.decrement({ id: artworkId }, 'likesCount', 1);
      
      // Update artist's likes received count
      await this.userRepository.decrement({ id: artwork.artistId }, 'likesReceivedCount', 1);

      const updatedArtwork = await this.artworkRepository.findOne({ where: { id: artworkId } });
      return {
        isLiked: false,
        likesCount: updatedArtwork?.likesCount || 0,
      };
    } else {
      // Like
      const like = this.likeRepository.create({ userId, artworkId });
      await this.likeRepository.save(like);
      await this.artworkRepository.increment({ id: artworkId }, 'likesCount', 1);
      
      // Update artist's likes received count
      await this.userRepository.increment({ id: artwork.artistId }, 'likesReceivedCount', 1);

      const updatedArtwork = await this.artworkRepository.findOne({ where: { id: artworkId } });
      return {
        isLiked: true,
        likesCount: updatedArtwork?.likesCount || 0,
      };
    }
  }

  /**
   * Get featured artworks
   */
  async getFeaturedArtworks(limit: number = 10): Promise<Artwork[]> {
    return await this.artworkRepository.find({
      where: { isFeatured: true, isPublic: true },
      relations: ['artist'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Search artworks by title, description, or tags
   */
  async searchArtworks(query: string, options: ArtworkQueryOptions = {}): Promise<{ artworks: Artwork[]; total: number }> {
    const { page = 1, limit = 20 } = options;

    const queryBuilder = this.artworkRepository
      .createQueryBuilder('artwork')
      .leftJoinAndSelect('artwork.artist', 'artist')
      .where('artwork.isPublic = :isPublic', { isPublic: true })
      .andWhere(
        '(artwork.title ILIKE :query OR artwork.description ILIKE :query OR :query = ANY(artwork.tags))',
        { query: `%${query}%` }
      );

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by relevance (likes and views)
    queryBuilder.orderBy('artwork.likesCount + artwork.viewsCount', 'DESC');

    const [artworks, total] = await queryBuilder.getManyAndCount();

    return { artworks, total };
  }
}
