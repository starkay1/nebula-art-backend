import { Artwork } from '../entities/Artwork.entity';
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
export declare class ArtworkService {
    private artworkRepository;
    private userRepository;
    private likeRepository;
    private imageUtils;
    constructor();
    createArtwork(artistId: string, createArtworkDto: CreateArtworkDto): Promise<Artwork>;
    getArtworks(options?: ArtworkQueryOptions): Promise<{
        artworks: Artwork[];
        total: number;
        page: number;
        limit: number;
    }>;
    getArtworkById(id: string, userId?: string): Promise<Artwork | null>;
    updateArtwork(id: string, artistId: string, updateData: Partial<CreateArtworkDto>): Promise<Artwork>;
    deleteArtwork(id: string, artistId: string): Promise<void>;
    toggleLike(artworkId: string, userId: string): Promise<{
        isLiked: boolean;
        likesCount: number;
    }>;
    getFeaturedArtworks(limit?: number): Promise<Artwork[]>;
    searchArtworks(query: string, options?: ArtworkQueryOptions): Promise<{
        artworks: Artwork[];
        total: number;
    }>;
}
//# sourceMappingURL=artwork.service.d.ts.map