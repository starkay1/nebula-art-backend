"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtworkService = void 0;
const main_1 = require("../main");
const Artwork_entity_1 = require("../entities/Artwork.entity");
const User_entity_1 = require("../entities/User.entity");
const Like_entity_1 = require("../entities/Like.entity");
const image_utils_1 = require("../utils/image.utils");
class ArtworkService {
    constructor() {
        this.artworkRepository = main_1.AppDataSource.getRepository(Artwork_entity_1.Artwork);
        this.userRepository = main_1.AppDataSource.getRepository(User_entity_1.User);
        this.likeRepository = main_1.AppDataSource.getRepository(Like_entity_1.Like);
        this.imageUtils = new image_utils_1.ImageUtils();
    }
    async createArtwork(artistId, createArtworkDto) {
        const artist = await this.userRepository.findOne({ where: { id: artistId } });
        if (!artist) {
            throw new Error('Artist not found');
        }
        let processedImages;
        try {
            processedImages = await this.imageUtils.processArtworkImage(createArtworkDto.imageData);
        }
        catch (error) {
            throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        const dimensions = await this.imageUtils.getImageDimensions(processedImages.original);
        const artwork = this.artworkRepository.create({
            title: createArtworkDto.title,
            description: createArtworkDto.description,
            imageUrl: processedImages.original,
            thumbnailUrl: processedImages.thumbnail,
            mediumUrl: processedImages.medium,
            artistId,
            tags: createArtworkDto.tags,
            category: createArtworkDto.category,
            medium: createArtworkDto.medium,
            width: dimensions?.width,
            height: dimensions?.height,
            price: createArtworkDto.price,
            currency: createArtworkDto.currency || 'CNY',
            isForSale: createArtworkDto.isForSale || false,
            isPublic: createArtworkDto.isPublic !== false,
        });
        const savedArtwork = await this.artworkRepository.save(artwork);
        await this.userRepository.increment({ id: artistId }, 'artworksCount', 1);
        return await this.artworkRepository.findOne({
            where: { id: savedArtwork.id },
            relations: ['artist'],
        });
    }
    async getArtworks(options = {}) {
        const { page = 1, limit = 20, artistId, tags, category, isForSale, sortBy = 'created_at', sortOrder = 'DESC', } = options;
        const queryBuilder = this.artworkRepository
            .createQueryBuilder('artwork')
            .leftJoinAndSelect('artwork.artist', 'artist')
            .where('artwork.isPublic = :isPublic', { isPublic: true });
        if (artistId) {
            queryBuilder.andWhere('artwork.artistId = :artistId', { artistId });
        }
        if (tags && tags.length > 0) {
            queryBuilder.andWhere('artwork.tags && :tags', { tags });
        }
        if (category) {
            queryBuilder.andWhere('artwork.category = :category', { category });
        }
        if (isForSale !== undefined) {
            queryBuilder.andWhere('artwork.isForSale = :isForSale', { isForSale });
        }
        queryBuilder.orderBy(`artwork.${sortBy}`, sortOrder);
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const [artworks, total] = await queryBuilder.getManyAndCount();
        return {
            artworks,
            total,
            page,
            limit,
        };
    }
    async getArtworkById(id, userId) {
        const artwork = await this.artworkRepository.findOne({
            where: { id },
            relations: ['artist'],
        });
        if (!artwork) {
            return null;
        }
        await this.artworkRepository.increment({ id }, 'viewsCount', 1);
        if (userId) {
            const like = await this.likeRepository.findOne({
                where: { userId, artworkId: id },
            });
            artwork.isLiked = !!like;
        }
        return artwork;
    }
    async updateArtwork(id, artistId, updateData) {
        const artwork = await this.artworkRepository.findOne({
            where: { id, artistId },
        });
        if (!artwork) {
            throw new Error('Artwork not found or unauthorized');
        }
        if (updateData.imageData) {
            try {
                const processedImages = await this.imageUtils.processArtworkImage(updateData.imageData);
                const dimensions = await this.imageUtils.getImageDimensions(processedImages.original);
                updateData.imageUrl = processedImages.original;
                updateData.thumbnailUrl = processedImages.thumbnail;
                updateData.mediumUrl = processedImages.medium;
                updateData.width = dimensions?.width;
                updateData.height = dimensions?.height;
                await this.imageUtils.deleteImage(artwork.imageUrl);
                if (artwork.thumbnailUrl)
                    await this.imageUtils.deleteImage(artwork.thumbnailUrl);
                if (artwork.mediumUrl)
                    await this.imageUtils.deleteImage(artwork.mediumUrl);
            }
            catch (error) {
                throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        const { imageData, ...dbUpdateData } = updateData;
        await this.artworkRepository.update(id, dbUpdateData);
        return await this.artworkRepository.findOne({
            where: { id },
            relations: ['artist'],
        });
    }
    async deleteArtwork(id, artistId) {
        const artwork = await this.artworkRepository.findOne({
            where: { id, artistId },
        });
        if (!artwork) {
            throw new Error('Artwork not found or unauthorized');
        }
        await this.imageUtils.deleteImage(artwork.imageUrl);
        if (artwork.thumbnailUrl)
            await this.imageUtils.deleteImage(artwork.thumbnailUrl);
        if (artwork.mediumUrl)
            await this.imageUtils.deleteImage(artwork.mediumUrl);
        await this.artworkRepository.remove(artwork);
        await this.userRepository.decrement({ id: artistId }, 'artworksCount', 1);
    }
    async toggleLike(artworkId, userId) {
        const artwork = await this.artworkRepository.findOne({ where: { id: artworkId } });
        if (!artwork) {
            throw new Error('Artwork not found');
        }
        const existingLike = await this.likeRepository.findOne({
            where: { userId, artworkId },
        });
        if (existingLike) {
            await this.likeRepository.remove(existingLike);
            await this.artworkRepository.decrement({ id: artworkId }, 'likesCount', 1);
            await this.userRepository.decrement({ id: artwork.artistId }, 'likesReceivedCount', 1);
            const updatedArtwork = await this.artworkRepository.findOne({ where: { id: artworkId } });
            return {
                isLiked: false,
                likesCount: updatedArtwork?.likesCount || 0,
            };
        }
        else {
            const like = this.likeRepository.create({ userId, artworkId });
            await this.likeRepository.save(like);
            await this.artworkRepository.increment({ id: artworkId }, 'likesCount', 1);
            await this.userRepository.increment({ id: artwork.artistId }, 'likesReceivedCount', 1);
            const updatedArtwork = await this.artworkRepository.findOne({ where: { id: artworkId } });
            return {
                isLiked: true,
                likesCount: updatedArtwork?.likesCount || 0,
            };
        }
    }
    async getFeaturedArtworks(limit = 10) {
        return await this.artworkRepository.find({
            where: { isFeatured: true, isPublic: true },
            relations: ['artist'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async searchArtworks(query, options = {}) {
        const { page = 1, limit = 20 } = options;
        const queryBuilder = this.artworkRepository
            .createQueryBuilder('artwork')
            .leftJoinAndSelect('artwork.artist', 'artist')
            .where('artwork.isPublic = :isPublic', { isPublic: true })
            .andWhere('(artwork.title ILIKE :query OR artwork.description ILIKE :query OR :query = ANY(artwork.tags))', { query: `%${query}%` });
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        queryBuilder.orderBy('artwork.likesCount + artwork.viewsCount', 'DESC');
        const [artworks, total] = await queryBuilder.getManyAndCount();
        return { artworks, total };
    }
}
exports.ArtworkService = ArtworkService;
//# sourceMappingURL=artwork.service.js.map