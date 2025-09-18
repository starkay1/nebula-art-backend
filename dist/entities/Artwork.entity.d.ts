import { User } from './User.entity';
import { Comment } from './Comment.entity';
import { Like } from './Like.entity';
export declare class Artwork {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
    artistId: string;
    tags?: string[];
    category?: string;
    medium?: string;
    width?: number;
    height?: number;
    likesCount: number;
    commentsCount: number;
    viewsCount: number;
    isFeatured: boolean;
    isPublic: boolean;
    price?: number;
    currency: string;
    isForSale: boolean;
    createdAt: Date;
    updatedAt: Date;
    artist: User;
    comments: Comment[];
    likes: Like[];
    get stats(): {
        likes: number;
        comments: number;
        views: number;
    };
    get imageUrls(): {
        original: string;
        medium: string;
        thumbnail: string;
    };
    get dimensions(): {
        width: number;
        height: number;
        aspectRatio: number;
    };
}
//# sourceMappingURL=Artwork.entity.d.ts.map