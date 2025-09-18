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
exports.Curation = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
let Curation = class Curation {
    get stats() {
        return {
            views: this.viewsCount,
            likes: this.likesCount,
            artworks: this.artworksCount,
        };
    }
    addArtwork(artworkId) {
        if (!this.artworkIds.includes(artworkId)) {
            this.artworkIds.push(artworkId);
            this.artworksCount = this.artworkIds.length;
        }
    }
    removeArtwork(artworkId) {
        const index = this.artworkIds.indexOf(artworkId);
        if (index > -1) {
            this.artworkIds.splice(index, 1);
            this.artworksCount = this.artworkIds.length;
        }
    }
    reorderArtworks(newOrder) {
        const currentIds = new Set(this.artworkIds);
        const newIds = new Set(newOrder);
        if (currentIds.size === newIds.size &&
            [...currentIds].every(id => newIds.has(id))) {
            this.artworkIds = newOrder;
        }
        else {
            throw new Error('Invalid artwork order: missing or extra artwork IDs');
        }
    }
};
exports.Curation = Curation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Curation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Curation.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Curation.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'curator_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Curation.prototype, "curatorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'artwork_ids', type: 'simple-json' }),
    __metadata("design:type", Array)
], Curation.prototype, "artworkIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cover_image_url', nullable: true }),
    __metadata("design:type", String)
], Curation.prototype, "coverImageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Curation.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'views_count', default: 0 }),
    __metadata("design:type", Number)
], Curation.prototype, "viewsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'likes_count', default: 0 }),
    __metadata("design:type", Number)
], Curation.prototype, "likesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'artworks_count', default: 0 }),
    __metadata("design:type", Number)
], Curation.prototype, "artworksCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    __metadata("design:type", Boolean)
], Curation.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_public', default: true }),
    __metadata("design:type", Boolean)
], Curation.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Curation.prototype, "theme", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Curation.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Curation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Curation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, user => user.curations, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'curator_id' }),
    __metadata("design:type", User_entity_1.User)
], Curation.prototype, "curator", void 0);
exports.Curation = Curation = __decorate([
    (0, typeorm_1.Entity)('curations')
], Curation);
//# sourceMappingURL=Curation.entity.js.map