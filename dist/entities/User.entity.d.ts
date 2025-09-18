import { Artwork } from './Artwork.entity';
import { Curation } from './Curation.entity';
import { Comment } from './Comment.entity';
import { Like } from './Like.entity';
import { Follow } from './Follow.entity';
export declare class User {
    id: string;
    email: string;
    name: string;
    username: string;
    passwordHash: string;
    isArtist: boolean;
    avatarUrl?: string;
    coverUrl?: string;
    bio?: string;
    tags?: string[];
    location?: string;
    followersCount: number;
    followingCount: number;
    artworksCount: number;
    likesReceivedCount: number;
    isVerified: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    artworks: Artwork[];
    curations: Curation[];
    comments: Comment[];
    likes: Like[];
    following: Follow[];
    followers: Follow[];
    toJSON(): Partial<User>;
    get stats(): {
        followers: number;
        following: number;
        artworks: number;
        likes: number;
    };
}
//# sourceMappingURL=User.entity.d.ts.map