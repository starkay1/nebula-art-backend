"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Artwork = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const Comment_entity_1 = require("./Comment.entity");
const Like_entity_1 = require("./Like.entity");
let Artwork = class Artwork {
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
};
exports.Artwork = Artwork;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Artwork.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Artwork.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Artwork.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_url' }),
    __metadata("design:type", String)
], Artwork.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'thumbnail_url', nullable: true }),
    __metadata("design:type", String)
], Artwork.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medium_url', nullable: true }),
    __metadata("design:type", String)
], Artwork.prototype, "mediumUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'artist_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Artwork.prototype, "artistId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Artwork.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Artwork.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Artwork.prototype, "medium", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Artwork.prototype, "width", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Artwork.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'likes_count', default: 0 }),
    __metadata("design:type", Number)
], Artwork.prototype, "likesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comments_count', default: 0 }),
    __metadata("design:type", Number)
], Artwork.prototype, "commentsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'views_count', default: 0 }),
    __metadata("design:type", Number)
], Artwork.prototype, "viewsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    __metadata("design:type", Boolean)
], Artwork.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_public', default: true }),
    __metadata("design:type", Boolean)
], Artwork.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Artwork.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 3, default: 'CNY' }),
    __metadata("design:type", String)
], Artwork.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_for_sale', default: false }),
    __metadata("design:type", Boolean)
], Artwork.prototype, "isForSale", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Artwork.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Artwork.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, user => user.artworks, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'artist_id' }),
    __metadata("design:type", User_entity_1.User)
], Artwork.prototype, "artist", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comment_entity_1.Comment, comment => comment.artwork),
    __metadata("design:type", Array)
], Artwork.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Like_entity_1.Like, like => like.artwork),
    __metadata("design:type", Array)
], Artwork.prototype, "likes", void 0);
exports.Artwork = Artwork = __decorate([
    (0, typeorm_1.Entity)('artworks')
], Artwork);
//# sourceMappingURL=Artwork.entity.js.map