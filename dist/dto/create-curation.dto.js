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
exports.CreateCurationDto = void 0;
const class_validator_1 = require("class-validator");
class CreateCurationDto {
}
exports.CreateCurationDto = CreateCurationDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Title must not exceed 200 characters' }),
    __metadata("design:type", String)
], CreateCurationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    (0, class_validator_1.MaxLength)(2000, { message: 'Description must not exceed 2000 characters' }),
    __metadata("design:type", String)
], CreateCurationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'At least one artwork is required' }),
    (0, class_validator_1.IsArray)({ message: 'Artwork IDs must be an array' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one artwork is required' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each artwork ID must be a string' }),
    __metadata("design:type", Array)
], CreateCurationDto.prototype, "artworkIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Cover image URL must be a string' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Cover image URL must not exceed 500 characters' }),
    __metadata("design:type", String)
], CreateCurationDto.prototype, "coverImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Tags must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each tag must be a string' }),
    (0, class_validator_1.MaxLength)(50, { each: true, message: 'Each tag must not exceed 50 characters' }),
    __metadata("design:type", Array)
], CreateCurationDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Theme must be a string' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Theme must not exceed 50 characters' }),
    (0, class_validator_1.IsIn)(['contemporary', 'classical', 'modern', 'abstract', 'landscape', 'portrait', 'still-life', 'conceptual', 'mixed'], {
        message: 'Theme must be one of: contemporary, classical, modern, abstract, landscape, portrait, still-life, conceptual, mixed'
    }),
    __metadata("design:type", String)
], CreateCurationDto.prototype, "theme", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Category must be a string' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Category must not exceed 50 characters' }),
    (0, class_validator_1.IsIn)(['exhibition', 'collection', 'showcase', 'competition', 'educational', 'seasonal', 'featured'], {
        message: 'Category must be one of: exhibition, collection, showcase, competition, educational, seasonal, featured'
    }),
    __metadata("design:type", String)
], CreateCurationDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isPublic must be a boolean' }),
    __metadata("design:type", Boolean)
], CreateCurationDto.prototype, "isPublic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isFeatured must be a boolean' }),
    __metadata("design:type", Boolean)
], CreateCurationDto.prototype, "isFeatured", void 0);
//# sourceMappingURL=create-curation.dto.js.map