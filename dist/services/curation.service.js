"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurationService = void 0;
const typeorm_1 = require("typeorm");
const main_1 = require("../main");
const Curation_entity_1 = require("../entities/Curation.entity");
const User_entity_1 = require("../entities/User.entity");
const Artwork_entity_1 = require("../entities/Artwork.entity");
class CurationService {
    constructor() {
        this.curationRepository = main_1.AppDataSource.getRepository(Curation_entity_1.Curation);
        this.userRepository = main_1.AppDataSource.getRepository(User_entity_1.User);
        this.artworkRepository = main_1.AppDataSource.getRepository(Artwork_entity_1.Artwork);
    }
    async createCuration(curatorId, createCurationDto) {
        const curator = await this.userRepository.findOne({ where: { id: curatorId } });
        if (!curator) {
            throw new Error('Curator not found');
        }
        const artworks = await this.artworkRepository.find({
            where: {
                id: (0, typeorm_1.In)(createCurationDto.artworkIds),
                isPublic: true
            },
        });
        if (artworks.length !== createCurationDto.artworkIds.length) {
            throw new Error('One or more artworks not found or not public');
        }
        const curation = this.curationRepository.create({
            title: createCurationDto.title,
            description: createCurationDto.description,
            curatorId,
            artworkIds: createCurationDto.artworkIds,
            coverImageUrl: createCurationDto.coverImageUrl,
            tags: createCurationDto.tags,
            theme: createCurationDto.theme,
            category: createCurationDto.category,
            isPublic: createCurationDto.isPublic !== false,
            isFeatured: createCurationDto.isFeatured || false,
            artworksCount: createCurationDto.artworkIds.length,
        });
        const savedCuration = await this.curationRepository.save(curation);
        return await this.curationRepository.findOne({
            where: { id: savedCuration.id },
            relations: ['curator'],
        });
    }
    async getCurations(options = {}) {
        const { page = 1, limit = 20, curatorId, category, theme, sortBy = 'created_at', sortOrder = 'DESC', } = options;
        const queryBuilder = this.curationRepository
            .createQueryBuilder('curation')
            .leftJoinAndSelect('curation.curator', 'curator')
            .where('curation.isPublic = :isPublic', { isPublic: true });
        if (curatorId) {
            queryBuilder.andWhere('curation.curatorId = :curatorId', { curatorId });
        }
        if (category) {
            queryBuilder.andWhere('curation.category = :category', { category });
        }
        if (theme) {
            queryBuilder.andWhere('curation.theme = :theme', { theme });
        }
        queryBuilder.orderBy(`curation.${sortBy}`, sortOrder);
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const [curations, total] = await queryBuilder.getManyAndCount();
        return {
            curations,
            total,
            page,
            limit,
        };
    }
    async getCurationById(id) {
        const curation = await this.curationRepository.findOne({
            where: { id },
            relations: ['curator'],
        });
        if (!curation) {
            return null;
        }
        await this.curationRepository.increment({ id }, 'viewsCount', 1);
        return curation;
    }
    async updateCuration(id, curatorId, updateData) {
        const curation = await this.curationRepository.findOne({
            where: { id, curatorId },
        });
        if (!curation) {
            throw new Error('Curation not found or unauthorized');
        }
        if (updateData.artworkIds) {
            const artworks = await this.artworkRepository.find({
                where: {
                    id: (0, typeorm_1.In)(updateData.artworkIds),
                    isPublic: true
                },
            });
            if (artworks.length !== updateData.artworkIds.length) {
                throw new Error('One or more artworks not found or not public');
            }
            updateData.artworksCount = updateData.artworkIds.length;
        }
        await this.curationRepository.update(id, updateData);
        return await this.curationRepository.findOne({
            where: { id },
            relations: ['curator'],
        });
    }
    async deleteCuration(id, curatorId) {
        const curation = await this.curationRepository.findOne({
            where: { id, curatorId },
        });
        if (!curation) {
            throw new Error('Curation not found or unauthorized');
        }
        await this.curationRepository.remove(curation);
    }
    async addArtworkToCuration(curationId, curatorId, artworkId) {
        const curation = await this.curationRepository.findOne({
            where: { id: curationId, curatorId },
        });
        if (!curation) {
            throw new Error('Curation not found or unauthorized');
        }
        const artwork = await this.artworkRepository.findOne({
            where: { id: artworkId, isPublic: true },
        });
        if (!artwork) {
            throw new Error('Artwork not found or not public');
        }
        if (curation.artworkIds.includes(artworkId)) {
            throw new Error('Artwork already exists in curation');
        }
        curation.addArtwork(artworkId);
        await this.curationRepository.save(curation);
        return await this.curationRepository.findOne({
            where: { id: curationId },
            relations: ['curator'],
        });
    }
    async removeArtworkFromCuration(curationId, curatorId, artworkId) {
        const curation = await this.curationRepository.findOne({
            where: { id: curationId, curatorId },
        });
        if (!curation) {
            throw new Error('Curation not found or unauthorized');
        }
        if (!curation.artworkIds.includes(artworkId)) {
            throw new Error('Artwork not found in curation');
        }
        curation.removeArtwork(artworkId);
        await this.curationRepository.save(curation);
        return await this.curationRepository.findOne({
            where: { id: curationId },
            relations: ['curator'],
        });
    }
    async reorderArtworks(curationId, curatorId, newOrder) {
        const curation = await this.curationRepository.findOne({
            where: { id: curationId, curatorId },
        });
        if (!curation) {
            throw new Error('Curation not found or unauthorized');
        }
        try {
            curation.reorderArtworks(newOrder);
        }
        catch (error) {
            throw new Error(`Failed to reorder artworks: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        await this.curationRepository.save(curation);
        return await this.curationRepository.findOne({
            where: { id: curationId },
            relations: ['curator'],
        });
    }
    async getFeaturedCurations(limit = 10) {
        return await this.curationRepository.find({
            where: { isFeatured: true, isPublic: true },
            relations: ['curator'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getCurationArtworks(curationId, page = 1, limit = 20) {
        const curation = await this.curationRepository.findOne({
            where: { id: curationId, isPublic: true },
        });
        if (!curation) {
            throw new Error('Curation not found');
        }
        const skip = (page - 1) * limit;
        const paginatedArtworkIds = curation.artworkIds.slice(skip, skip + limit);
        const artworks = [];
        for (const artworkId of paginatedArtworkIds) {
            const artwork = await this.artworkRepository.findOne({
                where: { id: artworkId, isPublic: true },
                relations: ['artist'],
            });
            if (artwork) {
                artworks.push(artwork);
            }
        }
        return {
            artworks,
            total: curation.artworkIds.length,
            page,
            limit,
        };
    }
    async searchCurations(query, options = {}) {
        const { page = 1, limit = 20 } = options;
        const queryBuilder = this.curationRepository
            .createQueryBuilder('curation')
            .leftJoinAndSelect('curation.curator', 'curator')
            .where('curation.isPublic = :isPublic', { isPublic: true })
            .andWhere('(curation.title ILIKE :query OR curation.description ILIKE :query OR :query = ANY(curation.tags))', { query: `%${query}%` });
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        queryBuilder.orderBy('curation.likesCount + curation.viewsCount', 'DESC');
        const [curations, total] = await queryBuilder.getManyAndCount();
        return { curations, total };
    }
}
exports.CurationService = CurationService;
//# sourceMappingURL=curation.service.js.map