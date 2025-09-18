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
exports.CreateArtworkDto = void 0;
const class_validator_1 = require("class-validator");
class CreateArtworkDto {
}
exports.CreateArtworkDto = CreateArtworkDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Title must not exceed 200 characters' }),
    __metadata("design:type", String)
], CreateArtworkDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    (0, class_validator_1.MaxLength)(2000, { message: 'Description must not exceed 2000 characters' }),
    __metadata("design:type", String)
], CreateArtworkDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Image data is required' }),
    (0, class_validator_1.IsString)({ message: 'Image data must be a string' }),
    __metadata("design:type", String)
], CreateArtworkDto.prototype, "imageData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Tags must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each tag must be a string' }),
    (0, class_validator_1.MaxLength)(50, { each: true, message: 'Each tag must not exceed 50 characters' }),
    __metadata("design:type", Array)
], CreateArtworkDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Category must be a string' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Category must not exceed 50 characters' }),
    (0, class_validator_1.IsIn)(['painting', 'sculpture', 'photography', 'digital', 'mixed-media', 'drawing', 'printmaking', 'installation', 'other'], {
        message: 'Category must be one of: painting, sculpture, photography, digital, mixed-media, drawing, printmaking, installation, other'
    }),
    __metadata("design:type", String)
], CreateArtworkDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Medium must be a string' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Medium must not exceed 100 characters' }),
    __metadata("design:type", String)
], CreateArtworkDto.prototype, "medium", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Width must be a number' }),
    (0, class_validator_1.Min)(1, { message: 'Width must be at least 1' }),
    __metadata("design:type", Number)
], CreateArtworkDto.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Height must be a number' }),
    (0, class_validator_1.Min)(1, { message: 'Height must be at least 1' }),
    __metadata("design:type", Number)
], CreateArtworkDto.prototype, "height", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'Price must be a number with at most 2 decimal places' }),
    (0, class_validator_1.Min)(0, { message: 'Price must be non-negative' }),
    __metadata("design:type", Number)
], CreateArtworkDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Currency must be a string' }),
    (0, class_validator_1.IsIn)(['CNY', 'USD', 'EUR', 'GBP', 'JPY'], {
        message: 'Currency must be one of: CNY, USD, EUR, GBP, JPY'
    }),
    __metadata("design:type", String)
], CreateArtworkDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isForSale must be a boolean' }),
    __metadata("design:type", Boolean)
], CreateArtworkDto.prototype, "isForSale", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isPublic must be a boolean' }),
    __metadata("design:type", Boolean)
], CreateArtworkDto.prototype, "isPublic", void 0);
//# sourceMappingURL=create-artwork.dto.js.map