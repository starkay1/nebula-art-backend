import { Curation } from '../entities/Curation.entity';
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
export declare class CurationService {
    private curationRepository;
    private userRepository;
    private artworkRepository;
    constructor();
    createCuration(curatorId: string, createCurationDto: CreateCurationDto): Promise<Curation>;
    getCurations(options?: CurationQueryOptions): Promise<{
        curations: Curation[];
        total: number;
        page: number;
        limit: number;
    }>;
    getCurationById(id: string): Promise<Curation | null>;
    updateCuration(id: string, curatorId: string, updateData: Partial<CreateCurationDto>): Promise<Curation>;
    deleteCuration(id: string, curatorId: string): Promise<void>;
    addArtworkToCuration(curationId: string, curatorId: string, artworkId: string): Promise<Curation>;
    removeArtworkFromCuration(curationId: string, curatorId: string, artworkId: string): Promise<Curation>;
    reorderArtworks(curationId: string, curatorId: string, newOrder: string[]): Promise<Curation>;
    getFeaturedCurations(limit?: number): Promise<Curation[]>;
    getCurationArtworks(curationId: string, page?: number, limit?: number): Promise<{
        artworks: Artwork[];
        total: number;
        page: number;
        limit: number;
    }>;
    searchCurations(query: string, options?: CurationQueryOptions): Promise<{
        curations: Curation[];
        total: number;
    }>;
}
//# sourceMappingURL=curation.service.d.ts.map