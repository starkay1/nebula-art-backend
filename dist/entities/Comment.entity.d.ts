import { User } from './User.entity';
import { Artwork } from './Artwork.entity';
export declare class Comment {
    id: string;
    content: string;
    userId: string;
    artworkId: string;
    parentId?: string;
    likesCount: number;
    repliesCount: number;
    isEdited: boolean;
    editedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    artwork: Artwork;
    parent?: Comment;
    replies: Comment[];
    get isReply(): boolean;
    get stats(): {
        likes: number;
        replies: number;
    };
    incrementRepliesCount(): void;
    decrementRepliesCount(): void;
    markAsEdited(): void;
}
//# sourceMappingURL=Comment.entity.d.ts.map