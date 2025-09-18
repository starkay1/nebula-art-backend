"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurationController = void 0;
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const auth_guard_1 = require("../guards/auth.guard");
const curation_service_1 = require("../services/curation.service");
const create_curation_dto_1 = require("../dto/create-curation.dto");
class CurationController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.curationService = new curation_service_1.CurationService();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.createCuration.bind(this));
        this.router.put('/:id', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.updateCuration.bind(this));
        this.router.delete('/:id', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.deleteCuration.bind(this));
        this.router.post('/:id/artworks', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.addArtworkToCuration.bind(this));
        this.router.delete('/:id/artworks/:artworkId', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.removeArtworkFromCuration.bind(this));
        this.router.put('/:id/reorder', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.reorderArtworks.bind(this));
        this.router.get('/', auth_guard_1.authGuard.optionalAuth.bind(auth_guard_1.authGuard), this.getCurations.bind(this));
        this.router.get('/featured', this.getFeaturedCurations.bind(this));
        this.router.get('/:id', auth_guard_1.authGuard.optionalAuth.bind(auth_guard_1.authGuard), this.getCurationById.bind(this));
        this.router.get('/:id/artworks', auth_guard_1.authGuard.optionalAuth.bind(auth_guard_1.authGuard), this.getCurationArtworks.bind(this));
    }
    async createCuration(req, res) {
        try {
            const authenticatedReq = req;
            const curatorId = authenticatedReq.user.id;
            const createCurationDto = (0, class_transformer_1.plainToClass)(create_curation_dto_1.CreateCurationDto, req.body);
            const errors = await (0, class_validator_1.validate)(createCurationDto);
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
            const curation = await this.curationService.createCuration(curatorId, createCurationDto);
            res.status(201).json({
                message: 'Curation created successfully',
                curation,
            });
        }
        catch (error) {
            console.error('Create curation error:', error);
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
    async getCurations(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const curatorId = req.query.curatorId;
            const category = req.query.category;
            const theme = req.query.theme;
            const sortBy = req.query.sortBy || 'created_at';
            const sortOrder = req.query.sortOrder || 'DESC';
            const result = await this.curationService.getCurations({
                page,
                limit,
                curatorId,
                category,
                theme,
                sortBy,
                sortOrder,
            });
            res.status(200).json({
                message: 'Curations retrieved successfully',
                ...result,
            });
        }
        catch (error) {
            console.error('Get curations error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async getCurationById(req, res) {
        try {
            const curationId = req.params.id;
            const curation = await this.curationService.getCurationById(curationId);
            if (!curation) {
                res.status(404).json({
                    message: 'Curation not found',
                });
                return;
            }
            res.status(200).json({
                message: 'Curation retrieved successfully',
                curation,
            });
        }
        catch (error) {
            console.error('Get curation by ID error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async updateCuration(req, res) {
        try {
            const authenticatedReq = req;
            const curatorId = authenticatedReq.user.id;
            const curationId = req.params.id;
            const updateCurationDto = (0, class_transformer_1.plainToClass)(create_curation_dto_1.CreateCurationDto, req.body);
            const errors = await (0, class_validator_1.validate)(updateCurationDto, { skipMissingProperties: true });
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
            const curation = await this.curationService.updateCuration(curationId, curatorId, updateCurationDto);
            res.status(200).json({
                message: 'Curation updated successfully',
                curation,
            });
        }
        catch (error) {
            console.error('Update curation error:', error);
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
    async deleteCuration(req, res) {
        try {
            const authenticatedReq = req;
            const curatorId = authenticatedReq.user.id;
            const curationId = req.params.id;
            await this.curationService.deleteCuration(curationId, curatorId);
            res.status(200).json({
                message: 'Curation deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete curation error:', error);
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
    async addArtworkToCuration(req, res) {
        try {
            const authenticatedReq = req;
            const curatorId = authenticatedReq.user.id;
            const curationId = req.params.id;
            const { artworkId } = req.body;
            if (!artworkId) {
                res.status(400).json({
                    message: 'Artwork ID is required',
                });
                return;
            }
            const curation = await this.curationService.addArtworkToCuration(curationId, curatorId, artworkId);
            res.status(200).json({
                message: 'Artwork added to curation successfully',
                curation,
            });
        }
        catch (error) {
            console.error('Add artwork to curation error:', error);
            if (error instanceof Error && (error.message.includes('not found') ||
                error.message.includes('unauthorized') ||
                error.message.includes('already exists'))) {
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
    async removeArtworkFromCuration(req, res) {
        try {
            const authenticatedReq = req;
            const curatorId = authenticatedReq.user.id;
            const curationId = req.params.id;
            const artworkId = req.params.artworkId;
            const curation = await this.curationService.removeArtworkFromCuration(curationId, curatorId, artworkId);
            res.status(200).json({
                message: 'Artwork removed from curation successfully',
                curation,
            });
        }
        catch (error) {
            console.error('Remove artwork from curation error:', error);
            if (error instanceof Error && (error.message.includes('not found') ||
                error.message.includes('unauthorized'))) {
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
    async reorderArtworks(req, res) {
        try {
            const authenticatedReq = req;
            const curatorId = authenticatedReq.user.id;
            const curationId = req.params.id;
            const { artworkIds } = req.body;
            if (!Array.isArray(artworkIds)) {
                res.status(400).json({
                    message: 'Artwork IDs must be an array',
                });
                return;
            }
            const curation = await this.curationService.reorderArtworks(curationId, curatorId, artworkIds);
            res.status(200).json({
                message: 'Artworks reordered successfully',
                curation,
            });
        }
        catch (error) {
            console.error('Reorder artworks error:', error);
            if (error instanceof Error && (error.message.includes('not found') ||
                error.message.includes('unauthorized') ||
                error.message.includes('Invalid'))) {
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
    async getFeaturedCurations(req, res) {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);
            const curations = await this.curationService.getFeaturedCurations(limit);
            res.status(200).json({
                message: 'Featured curations retrieved successfully',
                curations,
            });
        }
        catch (error) {
            console.error('Get featured curations error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async getCurationArtworks(req, res) {
        try {
            const curationId = req.params.id;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const result = await this.curationService.getCurationArtworks(curationId, page, limit);
            res.status(200).json({
                message: 'Curation artworks retrieved successfully',
                ...result,
            });
        }
        catch (error) {
            console.error('Get curation artworks error:', error);
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
}
exports.CurationController = CurationController;
//# sourceMappingURL=curation.controller.js.map