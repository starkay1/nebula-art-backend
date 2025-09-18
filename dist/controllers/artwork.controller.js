"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtworkController = void 0;
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const auth_guard_1 = require("../guards/auth.guard");
const artwork_service_1 = require("../services/artwork.service");
const create_artwork_dto_1 = require("../dto/create-artwork.dto");
class ArtworkController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.artworkService = new artwork_service_1.ArtworkService();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.createArtwork.bind(this));
        this.router.put('/:id', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.updateArtwork.bind(this));
        this.router.delete('/:id', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.deleteArtwork.bind(this));
        this.router.post('/:id/like', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.toggleLike.bind(this));
        this.router.get('/', auth_guard_1.authGuard.optionalAuth.bind(auth_guard_1.authGuard), this.getArtworks.bind(this));
        this.router.get('/featured', this.getFeaturedArtworks.bind(this));
        this.router.get('/search', auth_guard_1.authGuard.optionalAuth.bind(auth_guard_1.authGuard), this.searchArtworks.bind(this));
        this.router.get('/:id', auth_guard_1.authGuard.optionalAuth.bind(auth_guard_1.authGuard), this.getArtworkById.bind(this));
    }
    async createArtwork(req, res) {
        try {
            const authenticatedReq = req;
            const artistId = authenticatedReq.user.id;
            if (!authenticatedReq.user.isArtist) {
                res.status(403).json({
                    message: 'Only artists can create artworks',
                });
                return;
            }
            const createArtworkDto = (0, class_transformer_1.plainToClass)(create_artwork_dto_1.CreateArtworkDto, req.body);
            const errors = await (0, class_validator_1.validate)(createArtworkDto);
            if (errors.length > 0) {
                res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.map(error => ({
                        field: error.property,
                        constraints: error.constraints,
                    })),
                });
                return;
            }
            const artwork = await this.artworkService.createArtwork(artistId, createArtworkDto);
            res.status(201).json({
                message: 'Artwork created successfully',
                artwork,
            });
        }
        catch (error) {
            console.error('Create artwork error:', error);
            if (error instanceof Error && error.message.includes('Image processing failed')) {
                res.status(400).json({
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async getArtworks(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const artistId = req.query.artistId;
            const category = req.query.category;
            const isForSale = req.query.isForSale === 'true' ? true : req.query.isForSale === 'false' ? false : undefined;
            const sortBy = req.query.sortBy || 'created_at';
            const sortOrder = req.query.sortOrder || 'DESC';
            const tags = req.query.tags ? req.query.tags.split(',') : undefined;
            const result = await this.artworkService.getArtworks({
                page,
                limit,
                artistId,
                category,
                isForSale,
                sortBy,
                sortOrder,
                tags,
            });
            res.status(200).json({
                message: 'Artworks retrieved successfully',
                ...result,
            });
        }
        catch (error) {
            console.error('Get artworks error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async getArtworkById(req, res) {
        try {
            const artworkId = req.params.id;
            const authenticatedReq = req;
            const userId = authenticatedReq.user?.id;
            const artwork = await this.artworkService.getArtworkById(artworkId, userId);
            if (!artwork) {
                res.status(404).json({
                    message: 'Artwork not found',
                });
                return;
            }
            res.status(200).json({
                message: 'Artwork retrieved successfully',
                artwork,
            });
        }
        catch (error) {
            console.error('Get artwork by ID error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async updateArtwork(req, res) {
        try {
            const authenticatedReq = req;
            const artistId = authenticatedReq.user.id;
            const artworkId = req.params.id;
            const updateArtworkDto = (0, class_transformer_1.plainToClass)(create_artwork_dto_1.CreateArtworkDto, req.body);
            const errors = await (0, class_validator_1.validate)(updateArtworkDto, { skipMissingProperties: true });
            if (errors.length > 0) {
                res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.map(error => ({
                        field: error.property,
                        constraints: error.constraints,
                    })),
                });
                return;
            }
            const artwork = await this.artworkService.updateArtwork(artworkId, artistId, updateArtworkDto);
            res.status(200).json({
                message: 'Artwork updated successfully',
                artwork,
            });
        }
        catch (error) {
            console.error('Update artwork error:', error);
            if (error instanceof Error && (error.message.includes('not found') ||
                error.message.includes('unauthorized'))) {
                res.status(404).json({
                    message: error.message,
                });
                return;
            }
            if (error instanceof Error && error.message.includes('Image processing failed')) {
                res.status(400).json({
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async deleteArtwork(req, res) {
        try {
            const authenticatedReq = req;
            const artistId = authenticatedReq.user.id;
            const artworkId = req.params.id;
            await this.artworkService.deleteArtwork(artworkId, artistId);
            res.status(200).json({
                message: 'Artwork deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete artwork error:', error);
            if (error instanceof Error && (error.message.includes('not found') ||
                error.message.includes('unauthorized'))) {
                res.status(404).json({
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async toggleLike(req, res) {
        try {
            const authenticatedReq = req;
            const userId = authenticatedReq.user.id;
            const artworkId = req.params.id;
            const result = await this.artworkService.toggleLike(artworkId, userId);
            res.status(200).json({
                message: result.isLiked ? 'Artwork liked successfully' : 'Artwork unliked successfully',
                ...result,
            });
        }
        catch (error) {
            console.error('Toggle like error:', error);
            if (error instanceof Error && error.message.includes('not found')) {
                res.status(404).json({
                    message: error.message,
                });
                return;
            }
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async getFeaturedArtworks(req, res) {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);
            const artworks = await this.artworkService.getFeaturedArtworks(limit);
            res.status(200).json({
                message: 'Featured artworks retrieved successfully',
                artworks,
            });
        }
        catch (error) {
            console.error('Get featured artworks error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async searchArtworks(req, res) {
        try {
            const query = req.query.q;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            if (!query || query.trim().length === 0) {
                res.status(400).json({
                    message: 'Search query is required',
                });
                return;
            }
            const result = await this.artworkService.searchArtworks(query.trim(), {
                page,
                limit,
            });
            res.status(200).json({
                message: 'Search results retrieved successfully',
                query: query.trim(),
                page,
                limit,
                ...result,
            });
        }
        catch (error) {
            console.error('Search artworks error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
}
exports.ArtworkController = ArtworkController;
//# sourceMappingURL=artwork.controller.js.map