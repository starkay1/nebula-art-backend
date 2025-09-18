"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const main_1 = require("../main");
const User_entity_1 = require("../entities/User.entity");
const login_dto_1 = require("../dto/login.dto");
const register_dto_1 = require("../dto/register.dto");
class AuthController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userRepository = main_1.AppDataSource.getRepository(User_entity_1.User);
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/register', this.register.bind(this));
        this.router.post('/login', this.login.bind(this));
        this.router.post('/refresh', this.refreshToken.bind(this));
        this.router.post('/logout', this.logout.bind(this));
    }
    async register(req, res) {
        try {
            const registerDto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, req.body);
            const errors = await (0, class_validator_1.validate)(registerDto);
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
            const existingUser = await this.userRepository.findOne({
                where: [
                    { email: registerDto.email },
                    { username: registerDto.username },
                ],
            });
            if (existingUser) {
                res.status(409).json({
                    message: existingUser.email === registerDto.email
                        ? 'Email already exists'
                        : 'Username already exists',
                });
                return;
            }
            const saltRounds = 12;
            const passwordHash = await bcrypt_1.default.hash(registerDto.password, saltRounds);
            const user = this.userRepository.create({
                email: registerDto.email,
                name: registerDto.name,
                username: registerDto.username,
                passwordHash,
                isArtist: registerDto.isArtist || false,
                bio: registerDto.bio,
                location: registerDto.location,
            });
            const savedUser = await this.userRepository.save(user);
            const token = this.generateToken(savedUser.id);
            await this.userRepository.update(savedUser.id, { lastLoginAt: new Date() });
            res.status(201).json({
                message: 'User registered successfully',
                user: savedUser.toJSON(),
                token,
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async login(req, res) {
        try {
            const loginDto = (0, class_transformer_1.plainToClass)(login_dto_1.LoginDto, req.body);
            const errors = await (0, class_validator_1.validate)(loginDto);
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
            const user = await this.userRepository.findOne({
                where: [
                    { email: loginDto.emailOrUsername },
                    { username: loginDto.emailOrUsername },
                ],
            });
            if (!user) {
                res.status(401).json({
                    message: 'Invalid credentials',
                });
                return;
            }
            const isPasswordValid = await bcrypt_1.default.compare(loginDto.password, user.passwordHash);
            if (!isPasswordValid) {
                res.status(401).json({
                    message: 'Invalid credentials',
                });
                return;
            }
            const token = this.generateToken(user.id);
            await this.userRepository.update(user.id, { lastLoginAt: new Date() });
            res.status(200).json({
                message: 'Login successful',
                user: user.toJSON(),
                token,
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async refreshToken(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                res.status(400).json({
                    message: 'Token is required',
                });
                return;
            }
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
            const newToken = this.generateToken(user.id);
            res.status(200).json({
                message: 'Token refreshed successfully',
                token: newToken,
            });
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({
                    message: 'Invalid token',
                });
                return;
            }
            console.error('Token refresh error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
    async logout(req, res) {
        res.status(200).json({
            message: 'Logout successful',
        });
    }
    generateToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map