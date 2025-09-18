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
exports.Like = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const Artwork_entity_1 = require("./Artwork.entity");
let Like = class Like {
};
exports.Like = Like;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Like.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Like.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'artwork_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Like.prototype, "artworkId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Like.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, user => user.likes, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_entity_1.User)
], Like.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Artwork_entity_1.Artwork, artwork => artwork.likes, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'artwork_id' }),
    __metadata("design:type", Artwork_entity_1.Artwork)
], Like.prototype, "artwork", void 0);
exports.Like = Like = __decorate([
    (0, typeorm_1.Entity)('likes'),
    (0, typeorm_1.Unique)(['userId', 'artworkId']),
    (0, typeorm_1.Index)(['userId', 'artworkId'])
], Like);
//# sourceMappingURL=Like.entity.js.map