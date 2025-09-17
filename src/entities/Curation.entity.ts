import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';

@Entity('curations')
export class Curation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'curator_id' })
  @Index()
  curatorId: string;

  @Column({ name: 'artwork_ids', type: 'simple-json' })
  artworkIds: string[];

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ name: 'views_count', default: 0 })
  viewsCount: number;

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;

  @Column({ name: 'artworks_count', default: 0 })
  artworksCount: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  theme?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.curations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curator_id' })
  curator: User;

  // Virtual properties for API responses
  get stats() {
    return {
      views: this.viewsCount,
      likes: this.likesCount,
      artworks: this.artworksCount,
    };
  }

  // Helper methods
  addArtwork(artworkId: string): void {
    if (!this.artworkIds.includes(artworkId)) {
      this.artworkIds.push(artworkId);
      this.artworksCount = this.artworkIds.length;
    }
  }

  removeArtwork(artworkId: string): void {
    const index = this.artworkIds.indexOf(artworkId);
    if (index > -1) {
      this.artworkIds.splice(index, 1);
      this.artworksCount = this.artworkIds.length;
    }
  }

  reorderArtworks(newOrder: string[]): void {
    // Validate that all artwork IDs are present
    const currentIds = new Set(this.artworkIds);
    const newIds = new Set(newOrder);
    
    if (currentIds.size === newIds.size && 
        [...currentIds].every(id => newIds.has(id))) {
      this.artworkIds = newOrder;
    } else {
      throw new Error('Invalid artwork order: missing or extra artwork IDs');
    }
  }
}
