import { User } from './User.entity';
export declare class Curation {
    id: string;
    title: string;
    description?: string;
    curatorId: string;
    artworkIds: string[];
    coverImageUrl?: string;
    tags?: string[];
    viewsCount: number;
    likesCount: number;
    artworksCount: number;
    isFeatured: boolean;
    isPublic: boolean;
    theme?: string;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
    curator: User;
    get stats(): {
        views: number;
        likes: number;
        artworks: number;
    };
    addArtwork(artworkId: string): void;
    removeArtwork(artworkId: string): void;
    reorderArtworks(newOrder: string[]): void;
}
//# sourceMappingURL=Curation.entity.d.ts.map