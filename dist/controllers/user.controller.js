"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const main_1 = require("../main");
const User_entity_1 = require("../entities/User.entity");
const Follow_entity_1 = require("../entities/Follow.entity");
const auth_guard_1 = require("../guards/auth.guard");
const update_user_dto_1 = require("../dto/update-user.dto");
class UserController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userRepository = main_1.AppDataSource.getRepository(User_entity_1.User);
        this.followRepository = main_1.AppDataSource.getRepository(Follow_entity_1.Follow);
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/me', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.getCurrentUser.bind(this));
        this.router.put('/me', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.updateCurrentUser.bind(this));
        this.router.post('/follow/:userId', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.followUser.bind(this));
        this.router.delete('/follow/:userId', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.unfollowUser.bind(this));
        this.router.get('/following', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.getFollowing.bind(this));
        this.router.get('/followers', auth_guard_1.authGuard.authenticate.bind(auth_guard_1.authGuard), this.getFollowers.bind(this));
        this.router.get('/artists', this.getArtists.bind(this));
        this.router.get('/:userId', this.getUserById.bind(this));
        this.router.get('/:userId/followers', this.getUserFollowers.bind(this));
        this.router.get('/:userId/following', this.getUserFollowing.bind(this));
    }
    async getCurrentUser(req, res) {
        try {
            const authenticatedReq = req;
            const user = authenticatedReq.user;
            res.status(200).json({
                message: 'User retrieved successfully',
                user: user.toJSON(),
            });
        }
        catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async updateCurrentUser(req, res) {
        try {
            const authenticatedReq = req;
            const userId = authenticatedReq.user.id;
            const updateUserDto = (0, class_transformer_1.plainToClass)(update_user_dto_1.UpdateUserDto, req.body);
            const errors = await (0, class_validator_1.validate)(updateUserDto);
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
            if (updateUserDto.username) {
                const existingUser = await this.userRepository.findOne({
                    where: { username: updateUserDto.username },
                });
                if (existingUser && existingUser.id !== userId) {
                    res.status(409).json({
                        message: 'Username already exists',
                    });
                    return;
                }
            }
            await this.userRepository.update(userId, updateUserDto);
            const updatedUser = await this.userRepository.findOne({
                where: { id: userId },
            });
            res.status(200).json({
                message: 'User updated successfully',
                user: updatedUser?.toJSON(),
            });
        }
        catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async followUser(req, res) {
        try {
            const authenticatedReq = req;
            const followerId = authenticatedReq.user.id;
            const followingId = req.params.userId;
            if (followerId === followingId) {
                res.status(400).json({
                    message: 'Cannot follow yourself',
                });
                return;
            }
            const targetUser = await this.userRepository.findOne({
                where: { id: followingId },
            });
            if (!targetUser) {
                res.status(404).json({
                    message: 'User not found',
                });
                return;
            }
            const existingFollow = await this.followRepository.findOne({
                where: { followerId, followingId },
            });
            if (existingFollow) {
                res.status(409).json({
                    message: 'Already following this user',
                });
                return;
            }
            const follow = this.followRepository.create({
                followerId,
                followingId,
            });
            await this.followRepository.save(follow);
            await Promise.all([
                this.userRepository.increment({ id: followerId }, 'followingCount', 1),
                this.userRepository.increment({ id: followingId }, 'followersCount', 1),
            ]);
            res.status(201).json({
                message: 'User followed successfully',
                isFollowing: true,
            });
        }
        catch (error) {
            console.error('Follow user error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async unfollowUser(req, res) {
        try {
            const authenticatedReq = req;
            const followerId = authenticatedReq.user.id;
            const followingId = req.params.userId;
            const follow = await this.followRepository.findOne({
                where: { followerId, followingId },
            });
            if (!follow) {
                res.status(404).json({
                    message: 'Not following this user',
                });
                return;
            }
            await this.followRepository.remove(follow);
            await Promise.all([
                this.userRepository.decrement({ id: followerId }, 'followingCount', 1),
                this.userRepository.decrement({ id: followingId }, 'followersCount', 1),
            ]);
            res.status(200).json({
                message: 'User unfollowed successfully',
                isFollowing: false,
            });
        }
        catch (error) {
            console.error('Unfollow user error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async getFollowing(req, res) {
        try {
            const authenticatedReq = req;
            const userId = authenticatedReq.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const follows = await this.followRepository.find({
                where: { followerId: userId },
                relations: ['following'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const following = follows.map(follow => follow.following.toJSON());
            res.status(200).json({
                message: 'Following list retrieved successfully',
                following,
                page,
                limit,
                total: follows.length,
            });
        }
        catch (error) {
            console.error('Get following error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async getFollowers(req, res) {
        try {
            const authenticatedReq = req;
            const userId = authenticatedReq.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const follows = await this.followRepository.find({
                where: { followingId: userId },
                relations: ['follower'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const followers = follows.map(follow => follow.follower.toJSON());
            res.status(200).json({
                message: 'Followers list retrieved successfully',
                followers,
                page,
                limit,
                total: follows.length,
            });
        }
        catch (error) {
            console.error('Get followers error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async getArtists(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const search = req.query.search;
            const queryBuilder = this.userRepository
                .createQueryBuilder('user')
                .where('user.isArtist = :isArtist', { isArtist: true });
            if (search) {
                queryBuilder.andWhere('(user.name ILIKE :search OR user.username ILIKE :search OR user.location ILIKE :search)', { search: `%${search}%` });
            }
            queryBuilder.orderBy('user.followersCount', 'DESC')
                .addOrderBy('user.createdAt', 'DESC');
            const skip = (page - 1) * limit;
            queryBuilder.skip(skip).take(limit);
            const [artists, total] = await queryBuilder.getManyAndCount();
            res.status(200).json({
                message: 'Artists retrieved successfully',
                artists: artists.map(artist => artist.toJSON()),
                page,
                limit,
                total,
            });
        }
        catch (error) {
            console.error('Get artists error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async getUserById(req, res) {
        try {
            const userId = req.params.userId;
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                res.status(404).json({
                    message: 'User not found',
                });
                return;
            }
            res.status(200).json({
                message: 'User retrieved successfully',
                user: user.toJSON(),
            });
        }
        catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async getUserFollowers(req, res) {
        try {
            const userId = req.params.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                res.status(404).json({
                    message: 'User not found',
                });
                return;
            }
            const follows = await this.followRepository.find({
                where: { followingId: userId },
                relations: ['follower'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const followers = follows.map(follow => follow.follower.toJSON());
            res.status(200).json({
                message: 'User followers retrieved successfully',
                followers,
                page,
                limit,
                total: follows.length,
            });
        }
        catch (error) {
            console.error('Get user followers error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async getUserFollowing(req, res) {
        try {
            const userId = req.params.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                res.status(404).json({
                    message: 'User not found',
                });
                return;
            }
            const follows = await this.followRepository.find({
                where: { followerId: userId },
                relations: ['following'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' },
            });
            const following = follows.map(follow => follow.following.toJSON());
            res.status(200).json({
                message: 'User following retrieved successfully',
                following,
                page,
                limit,
                total: follows.length,
            });
        }
        catch (error) {
            console.error('Get user following error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map