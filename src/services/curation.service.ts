import { Repository, In } from 'typeorm';
import { AppDataSource } from '../main';
import { Curation } from '../entities/Curation.entity';
import { User } from '../entities/User.entity';
import { Artwork } from '../entities/Artwork.entity';
import { CreateCurationDto } from '../dto/create-curation.dto';

export interface CurationQueryOptions {
  page?: number;
  limit?: number;
  curatorId?: string;
  category?: string;
  theme?: string;
  sortBy?: 'created_at' | 'likes_count' | 'views_count';
  sortOrder?: 'ASC' | 'DESC';
}

export class CurationService {
  private curationRepository: Repository<Curation>;
  private userRepository: Repository<User>;
  private artworkRepository: Repository<Artwork>;

  constructor() {
    this.curationRepository = AppDataSource.getRepository(Curation);
    this.userRepository = AppDataSource.getRepository(User);
    this.artworkRepository = AppDataSource.getRepository(Artwork);
  }

  /**
   * Create a new curation
   */
  async createCuration(curatorId: string, createCurationDto: CreateCurationDto): Promise<Curation> {
    // Verify curator exists
    const curator = await this.userRepository.findOne({ where: { id: curatorId } });
    if (!curator) {
      throw new Error('Curator not found');
    }

    // Verify all artworks exist and are public
    const artworks = await this.artworkRepository.find({
      where: { 
        id: In(createCurationDto.artworkIds),
        isPublic: true 
      },
    });

    if (artworks.length !== createCurationDto.artworkIds.length) {
      throw new Error('One or more artworks not found or not public');
    }

    // Create curation entity
    const curation = this.curationRepository.create({
      title: createCurationDto.title,
      description: createCurationDto.description,
      curatorId,
      artworkIds: createCurationDto.artworkIds,
      coverImageUrl: createCurationDto.coverImageUrl,
      tags: createCurationDto.tags,
      theme: createCurationDto.theme,
      category: createCurationDto.category,
      isPublic: createCurationDto.isPublic !== false, // Default to true
      isFeatured: createCurationDto.isFeatured || false,
      artworksCount: createCurationDto.artworkIds.length,
    });

    // Save curation
    const savedCuration = await this.curationRepository.save(curation);

    // Load curation with curator relation
    return await this.curationRepository.findOne({
      where: { id: savedCuration.id },
      relations: ['curator'],
    }) as Curation;
  }

  /**
   * Get curations with pagination and filtering
   */
  async getCurations(options: CurationQueryOptions = {}): Promise<{ curations: Curation[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      curatorId,
      category,
      theme,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = options;

    const queryBuilder = this.curationRepository
      .createQueryBuilder('curation')
      .leftJoinAndSelect('curation.curator', 'curator')
      .where('curation.isPublic = :isPublic', { isPublic: true });

    // Apply filters
    if (curatorId) {
      queryBuilder.andWhere('curation.curatorId = :curatorId', { curatorId });
    }

    if (category) {
      queryBuilder.andWhere('curation.category = :category', { category });
    }

    if (theme) {
      queryBuilder.andWhere('curation.theme = :theme', { theme });
    }

    // Apply sorting
    queryBuilder.orderBy(`curation.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [curations, total] = await queryBuilder.getManyAndCount();

    return {
      curations,
      total,
      page,
      limit,
    };
  }

  /**
   * Get curation by ID
   */
  async getCurationById(id: string): Promise<Curation | null> {
    const curation = await this.curationRepository.findOne({
      where: { id },
      relations: ['curator'],
    });

    if (!curation) {
      return null;
    }

    // Increment view count
    await this.curationRepository.increment({ id }, 'viewsCount', 1);

    return curation;
  }

  /**
   * Update curation
   */
  async updateCuration(id: string, curatorId: string, updateData: Partial<CreateCurationDto>): Promise<Curation> {
    const curation = await this.curationRepository.findOne({
      where: { id, curatorId },
    });

    if (!curation) {
      throw new Error('Curation not found or unauthorized');
    }

    // If artwork IDs are being updated, verify they exist
    if (updateData.artworkIds) {
      const artworks = await this.artworkRepository.find({
        where: { 
          id: In(updateData.artworkIds),
          isPublic: true 
        },
      });

      if (artworks.length !== updateData.artworkIds.length) {
        throw new Error('One or more artworks not found or not public');
      }

      updateData.artworksCount = updateData.artworkIds.length;
    }

    // Update curation
    await this.curationRepository.update(id, updateData);

    // Return updated curation with relations
    return await this.curationRepository.findOne({
      where: { id },
      relations: ['curator'],
    }) as Curation;
  }

  /**
   * Delete curation
   */
  async deleteCuration(id: string, curatorId: string): Promise<void> {
    const curation = await this.curationRepository.findOne({
      where: { id, curatorId },
    });

    if (!curation) {
      throw new Error('Curation not found or unauthorized');
    }

    await this.curationRepository.remove(curation);
  }

  /**
   * Add artwork to curation
   */
  async addArtworkToCuration(curationId: string, curatorId: string, artworkId: string): Promise<Curation> {
    const curation = await this.curationRepository.findOne({
      where: { id: curationId, curatorId },
    });

    if (!curation) {
      throw new Error('Curation not found or unauthorized');
    }

    // Verify artwork exists and is public
    const artwork = await this.artworkRepository.findOne({
      where: { id: artworkId, isPublic: true },
    });

    if (!artwork) {
      throw new Error('Artwork not found or not public');
    }

    // Check if artwork is already in curation
    if (curation.artworkIds.includes(artworkId)) {
      throw new Error('Artwork already exists in curation');
    }

    // Add artwork to curation
    curation.addArtwork(artworkId);

    // Save updated curation
    await this.curationRepository.save(curation);

    // Return updated curation with relations
    return await this.curationRepository.findOne({
      where: { id: curationId },
      relations: ['curator'],
    }) as Curation;
  }

  /**
   * Remove artwork from curation
   */
  async removeArtworkFromCuration(curationId: string, curatorId: string, artworkId: string): Promise<Curation> {
    const curation = await this.curationRepository.findOne({
      where: { id: curationId, curatorId },
    });

    if (!curation) {
      throw new Error('Curation not found or unauthorized');
    }

    // Check if artwork is in curation
    if (!curation.artworkIds.includes(artworkId)) {
      throw new Error('Artwork not found in curation');
    }

    // Remove artwork from curation
    curation.removeArtwork(artworkId);

    // Save updated curation
    await this.curationRepository.save(curation);

    // Return updated curation with relations
    return await this.curationRepository.findOne({
      where: { id: curationId },
      relations: ['curator'],
    }) as Curation;
  }

  /**
   * Reorder artworks in curation
   */
  async reorderArtworks(curationId: string, curatorId: string, newOrder: string[]): Promise<Curation> {
    const curation = await this.curationRepository.findOne({
      where: { id: curationId, curatorId },
    });

    if (!curation) {
      throw new Error('Curation not found or unauthorized');
    }

    // Reorder artworks
    try {
      curation.reorderArtworks(newOrder);
    } catch (error) {
      throw new Error(`Failed to reorder artworks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Save updated curation
    await this.curationRepository.save(curation);

    // Return updated curation with relations
    return await this.curationRepository.findOne({
      where: { id: curationId },
      relations: ['curator'],
    }) as Curation;
  }

  /**
   * Get featured curations
   */
  async getFeaturedCurations(limit: number = 10): Promise<Curation[]> {
    return await this.curationRepository.find({
      where: { isFeatured: true, isPublic: true },
      relations: ['curator'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get artworks in a curation with pagination
   */
  async getCurationArtworks(curationId: string, page: number = 1, limit: number = 20): Promise<{ artworks: Artwork[]; total: number; page: number; limit: number }> {
    const curation = await this.curationRepository.findOne({
      where: { id: curationId, isPublic: true },
    });

    if (!curation) {
      throw new Error('Curation not found');
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const paginatedArtworkIds = curation.artworkIds.slice(skip, skip + limit);

    // Get artworks in the correct order
    const artworks: Artwork[] = [];
    for (const artworkId of paginatedArtworkIds) {
      const artwork = await this.artworkRepository.findOne({
        where: { id: artworkId, isPublic: true },
        relations: ['artist'],
      });
      if (artwork) {
        artworks.push(artwork);
      }
    }

    return {
      artworks,
      total: curation.artworkIds.length,
      page,
      limit,
    };
  }

  /**
   * Search curations by title, description, or tags
   */
  async searchCurations(query: string, options: CurationQueryOptions = {}): Promise<{ curations: Curation[]; total: number }> {
    const { page = 1, limit = 20 } = options;

    const queryBuilder = this.curationRepository
      .createQueryBuilder('curation')
      .leftJoinAndSelect('curation.curator', 'curator')
      .where('curation.isPublic = :isPublic', { isPublic: true })
      .andWhere(
        '(curation.title ILIKE :query OR curation.description ILIKE :query OR :query = ANY(curation.tags))',
        { query: `%${query}%` }
      );

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by relevance (likes and views)
    queryBuilder.orderBy('curation.likesCount + curation.viewsCount', 'DESC');

    const [curations, total] = await queryBuilder.getManyAndCount();

    return { curations, total };
  }
}
