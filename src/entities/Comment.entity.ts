import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';
import { Artwork } from './Artwork.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'artwork_id' })
  @Index()
  artworkId: string;

  @Column({ name: 'parent_id', nullable: true })
  @Index()
  parentId?: string;

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;

  @Column({ name: 'replies_count', default: 0 })
  repliesCount: number;

  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @Column({ name: 'edited_at', nullable: true })
  editedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Artwork, artwork => artwork.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artwork_id' })
  artwork: Artwork;

  @ManyToOne(() => Comment, comment => comment.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent?: Comment;

  @OneToMany(() => Comment, comment => comment.parent)
  replies: Comment[];

  // Virtual properties for API responses
  get isReply(): boolean {
    return this.parentId !== null && this.parentId !== undefined;
  }

  get stats() {
    return {
      likes: this.likesCount,
      replies: this.repliesCount,
    };
  }

  // Helper methods
  incrementRepliesCount(): void {
    this.repliesCount += 1;
  }

  decrementRepliesCount(): void {
    if (this.repliesCount > 0) {
      this.repliesCount -= 1;
    }
  }

  markAsEdited(): void {
    this.isEdited = true;
    this.editedAt = new Date();
  }
}
