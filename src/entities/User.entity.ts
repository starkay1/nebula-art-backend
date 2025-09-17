import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Artwork } from './Artwork.entity';
import { Curation } from './Curation.entity';
import { Comment } from './Comment.entity';
import { Like } from './Like.entity';
import { Follow } from './Follow.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  name: string;

  @Column({ name: 'username', unique: true })
  @Index()
  username: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'is_artist', default: false })
  isArtist: boolean;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'cover_url', nullable: true })
  coverUrl?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ nullable: true })
  location?: string;

  @Column({ name: 'followers_count', default: 0 })
  followersCount: number;

  @Column({ name: 'following_count', default: 0 })
  followingCount: number;

  @Column({ name: 'artworks_count', default: 0 })
  artworksCount: number;

  @Column({ name: 'likes_received_count', default: 0 })
  likesReceivedCount: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Artwork, artwork => artwork.artist)
  artworks: Artwork[];

  @OneToMany(() => Curation, curation => curation.curator)
  curations: Curation[];

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @OneToMany(() => Like, like => like.user)
  likes: Like[];

  @OneToMany(() => Follow, follow => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, follow => follow.following)
  followers: Follow[];

  // Virtual properties for API responses
  toJSON(): Partial<User> {
    const { passwordHash, ...result } = this;
    return result;
  }

  // Helper methods
  get stats() {
    return {
      followers: this.followersCount,
      following: this.followingCount,
      artworks: this.artworksCount,
      likes: this.likesReceivedCount,
    };
  }
}
