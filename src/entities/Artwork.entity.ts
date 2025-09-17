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
import { Comment } from './Comment.entity';
import { Like } from './Like.entity';

@Entity('artworks')
export class Artwork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'medium_url', nullable: true })
  mediumUrl?: string;

  @Column({ name: 'artist_id' })
  @Index()
  artistId: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  medium?: string;

  @Column({ type: 'int', nullable: true })
  width?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;

  @Column({ name: 'comments_count', default: 0 })
  commentsCount: number;

  @Column({ name: 'views_count', default: 0 })
  viewsCount: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ name: 'currency', length: 3, default: 'CNY' })
  currency: string;

  @Column({ name: 'is_for_sale', default: false })
  isForSale: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.artworks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artist_id' })
  artist: User;

  @OneToMany(() => Comment, comment => comment.artwork)
  comments: Comment[];

  @OneToMany(() => Like, like => like.artwork)
  likes: Like[];

  // Virtual properties for API responses
  get stats() {
    return {
      likes: this.likesCount,
      comments: this.commentsCount,
      views: this.viewsCount,
    };
  }

  get imageUrls() {
    return {
      original: this.imageUrl,
      medium: this.mediumUrl || this.imageUrl,
      thumbnail: this.thumbnailUrl || this.imageUrl,
    };
  }

  get dimensions() {
    if (this.width && this.height) {
      return {
        width: this.width,
        height: this.height,
        aspectRatio: this.width / this.height,
      };
    }
    return null;
  }
}
