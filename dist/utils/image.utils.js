"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUtils = void 0;
const sharp_1 = __importDefault(require("sharp"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class ImageUtils {
    constructor() {
        this.uploadPath = process.env.UPLOAD_PATH || './uploads';
        this.allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(',');
        this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760');
        this.ensureUploadDirectory();
    }
    async processArtworkImage(imageData) {
        try {
            const buffer = await this.decodeImageData(imageData);
            await this.validateImage(buffer);
            const filename = (0, uuid_1.v4)();
            const timestamp = Date.now();
            const [originalUrl, mediumUrl, thumbnailUrl] = await Promise.all([
                this.processOriginalImage(buffer, `${filename}_original_${timestamp}`),
                this.processMediumImage(buffer, `${filename}_medium_${timestamp}`),
                this.processThumbnailImage(buffer, `${filename}_thumb_${timestamp}`),
            ]);
            return {
                original: originalUrl,
                medium: mediumUrl,
                thumbnail: thumbnailUrl,
            };
        }
        catch (error) {
            throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getImageDimensions(imageUrl) {
        try {
            if (imageUrl.startsWith('./') || imageUrl.startsWith('/')) {
                const filePath = path_1.default.resolve(imageUrl);
                const metadata = await (0, sharp_1.default)(filePath).metadata();
                if (metadata.width && metadata.height) {
                    return {
                        width: metadata.width,
                        height: metadata.height,
                    };
                }
            }
            return null;
        }
        catch (error) {
            console.error('Failed to get image dimensions:', error);
            return null;
        }
    }
    async deleteImage(imageUrl) {
        try {
            if (imageUrl.startsWith('./') || imageUrl.startsWith('/')) {
                const filePath = path_1.default.resolve(imageUrl);
                await promises_1.default.unlink(filePath);
            }
        }
        catch (error) {
            console.error('Failed to delete image:', error);
        }
    }
    async decodeImageData(imageData) {
        try {
            if (imageData.startsWith('data:image/')) {
                const base64Data = imageData.split(',')[1];
                if (!base64Data) {
                    throw new Error('Invalid base64 image data');
                }
                return Buffer.from(base64Data, 'base64');
            }
            if (imageData.startsWith('./') || imageData.startsWith('/')) {
                return await promises_1.default.readFile(imageData);
            }
            return Buffer.from(imageData, 'base64');
        }
        catch (error) {
            throw new Error(`Failed to decode image data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async validateImage(buffer) {
        try {
            if (buffer.length > this.maxFileSize) {
                throw new Error(`Image size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
            }
            const metadata = await (0, sharp_1.default)(buffer).metadata();
            if (!metadata.format) {
                throw new Error('Invalid image format');
            }
            const mimeType = `image/${metadata.format}`;
            if (!this.allowedMimeTypes.includes(mimeType)) {
                throw new Error(`Unsupported image format: ${metadata.format}. Allowed formats: ${this.allowedMimeTypes.join(', ')}`);
            }
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('Input buffer contains unsupported image format')) {
                throw new Error('Unsupported image format');
            }
            throw error;
        }
    }
    async processOriginalImage(buffer, filename) {
        const outputPath = path_1.default.join(this.uploadPath, `${filename}.jpg`);
        await (0, sharp_1.default)(buffer)
            .jpeg({
            quality: 90,
            progressive: true,
            mozjpeg: true
        })
            .toFile(outputPath);
        return outputPath;
    }
    async processMediumImage(buffer, filename) {
        const outputPath = path_1.default.join(this.uploadPath, `${filename}.jpg`);
        await (0, sharp_1.default)(buffer)
            .resize(800, 600, {
            fit: 'inside',
            withoutEnlargement: true,
        })
            .jpeg({
            quality: 85,
            progressive: true,
            mozjpeg: true
        })
            .toFile(outputPath);
        return outputPath;
    }
    async processThumbnailImage(buffer, filename) {
        const outputPath = path_1.default.join(this.uploadPath, `${filename}.jpg`);
        await (0, sharp_1.default)(buffer)
            .resize(200, 200, {
            fit: 'cover',
            position: 'center',
        })
            .jpeg({
            quality: 80,
            progressive: true,
            mozjpeg: true
        })
            .toFile(outputPath);
        return outputPath;
    }
    async ensureUploadDirectory() {
        try {
            await promises_1.default.access(this.uploadPath);
        }
        catch {
            await promises_1.default.mkdir(this.uploadPath, { recursive: true });
        }
    }
    generateResponsiveUrls(baseUrl) {
        const urlWithoutExt = baseUrl.replace(/\.[^/.]+$/, '');
        const ext = path_1.default.extname(baseUrl);
        return {
            '1x': baseUrl,
            '2x': `${urlWithoutExt}@2x${ext}`,
            '3x': `${urlWithoutExt}@3x${ext}`,
        };
    }
    async convertToWebP(buffer, quality = 80) {
        return await (0, sharp_1.default)(buffer)
            .webp({ quality, effort: 6 })
            .toBuffer();
    }
    async extractDominantColors(buffer, count = 5) {
        try {
            const { data } = await (0, sharp_1.default)(buffer)
                .resize(150, 150)
                .raw()
                .toBuffer({ resolveWithObject: true });
            const colors = [];
            for (let i = 0; i < Math.min(count, data.length / 3); i += 3) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                colors.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
            }
            return colors;
        }
        catch (error) {
            console.error('Failed to extract dominant colors:', error);
            return [];
        }
    }
}
exports.ImageUtils = ImageUtils;
//# sourceMappingURL=image.utils.js.map