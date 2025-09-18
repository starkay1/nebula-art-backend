"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = exports.AuthGuard = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const main_1 = require("../main");
const User_entity_1 = require("../entities/User.entity");
class AuthGuard {
    constructor() {
        this.userRepository = main_1.AppDataSource.getRepository(User_entity_1.User);
    }
    async authenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    message: 'Access token is required',
                });
                return;
            }
            const token = authHeader.substring(7);
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
            const user = await this.userRepository.findOne({
                where: { id: decoded.userId },
            });
            if (!user) {
                res.status(401).json({
                    message: 'User not found',
                });
                return;
            }
            req.user = user;
            req.userId = user.id;
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({
                    message: 'Invalid or expired token',
                });
                return;
            }
            console.error('Authentication error:', error);
            res.status(500).json({
                message: 'Internal server error',
            });
        }
    }
    async requireArtist(req, res, next) {
        const authenticatedReq = req;
        if (!authenticatedReq.user) {
            res.status(401).json({
                message: 'Authentication required',
            });
            return;
        }
        if (!authenticatedReq.user.isArtist) {
            res.status(403).json({
                message: 'Artist privileges required',
            });
            return;
        }
        next();
    }
    async optionalAuth(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                next();
                return;
            }
            const token = authHeader.substring(7);
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
            const user = await this.userRepository.findOne({
                where: { id: decoded.userId },
            });
            if (user) {
                req.user = user;
                req.userId = user.id;
            }
            next();
        }
        catch (error) {
            next();
        }
    }
    checkOwnership(userIdField = 'userId') {
        return (req, res, next) => {
            const authenticatedReq = req;
            const resourceUserId = req.params[userIdField] || req.body[userIdField];
            if (!authenticatedReq.user) {
                res.status(401).json({
                    message: 'Authentication required',
                });
                return;
            }
            if (authenticatedReq.user.id !== resourceUserId) {
                res.status(403).json({
                    message: 'Access denied: You can only access your own resources',
                });
                return;
            }
            next();
        };
    }
    userRateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
        const userRequestCounts = new Map();
        return (req, res, next) => {
            const authenticatedReq = req;
            if (!authenticatedReq.user) {
                res.status(401).json({
                    message: 'Authentication required',
                });
                return;
            }
            const userId = authenticatedReq.user.id;
            const now = Date.now();
            const userLimit = userRequestCounts.get(userId);
            if (!userLimit || now > userLimit.resetTime) {
                userRequestCounts.set(userId, {
                    count: 1,
                    resetTime: now + windowMs,
                });
                next();
                return;
            }
            if (userLimit.count >= maxRequests) {
                res.status(429).json({
                    message: 'Too many requests, please try again later',
                    retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
                });
                return;
            }
            userLimit.count++;
            userRequestCounts.set(userId, userLimit);
            next();
        };
    }
}
exports.AuthGuard = AuthGuard;
exports.authGuard = new AuthGuard();
//# sourceMappingURL=auth.guard.js.map