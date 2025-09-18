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
exports.Comment = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const Artwork_entity_1 = require("./Artwork.entity");
let Comment = class Comment {
    get isReply() {
        return this.parentId !== null && this.parentId !== undefined;
    }
    get stats() {
        return {
            likes: this.likesCount,
            replies: this.repliesCount,
        };
    }
    incrementRepliesCount() {
        this.repliesCount += 1;
    }
    decrementRepliesCount() {
        if (this.repliesCount > 0) {
            this.repliesCount -= 1;
        }
    }
    markAsEdited() {
        this.isEdited = true;
        this.editedAt = new Date();
    }
};
exports.Comment = Comment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Comment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Comment.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Comment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'artwork_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Comment.prototype, "artworkId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_id', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Comment.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'likes_count', default: 0 }),
    __metadata("design:type", Number)
], Comment.prototype, "likesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'replies_count', default: 0 }),
    __metadata("design:type", Number)
], Comment.prototype, "repliesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_edited', default: false }),
    __metadata("design:type", Boolean)
], Comment.prototype, "isEdited", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'edited_at', nullable: true }),
    __metadata("design:type", Date)
], Comment.prototype, "editedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Comment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Comment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, user => user.comments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_entity_1.User)
], Comment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Artwork_entity_1.Artwork, artwork => artwork.comments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'artwork_id' }),
    __metadata("design:type", Artwork_entity_1.Artwork)
], Comment.prototype, "artwork", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Comment, comment => comment.replies, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_id' }),
    __metadata("design:type", Comment)
], Comment.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comment, comment => comment.parent),
    __metadata("design:type", Array)
], Comment.prototype, "replies", void 0);
exports.Comment = Comment = __decorate([
    (0, typeorm_1.Entity)('comments')
], Comment);
//# sourceMappingURL=Comment.entity.js.map