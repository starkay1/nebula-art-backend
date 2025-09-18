"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const winston_1 = __importDefault(require("winston"));
const User_entity_1 = require("./entities/User.entity");
const Artwork_entity_1 = require("./entities/Artwork.entity");
const Curation_entity_1 = require("./entities/Curation.entity");
const Comment_entity_1 = require("./entities/Comment.entity");
const Like_entity_1 = require("./entities/Like.entity");
const Follow_entity_1 = require("./entities/Follow.entity");
const auth_controller_1 = require("./controllers/auth.controller");
const user_controller_1 = require("./controllers/user.controller");
const artwork_controller_1 = require("./controllers/artwork.controller");
const curation_controller_1 = require("./controllers/curation.controller");
const logger_middleware_1 = require("./middleware/logger.middleware");
dotenv_1.default.config();
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    defaultMeta: { service: 'nebula-art-backend' },
    transports: [
        new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple()
    }));
}
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'nebula_art',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: [User_entity_1.User, Artwork_entity_1.Artwork, Curation_entity_1.Curation, Comment_entity_1.Comment, Like_entity_1.Like, Follow_entity_1.Follow],
    migrations: ['src/migrations/**/*.ts'],
    subscribers: ['src/subscribers/**/*.ts'],
});
exports.AppDataSource = AppDataSource;
async function bootstrap() {
    try {
        await AppDataSource.initialize();
        logger.info('Database connection established successfully');
        const app = (0, express_1.default)();
        app.use((0, helmet_1.default)());
        app.use((0, cors_1.default)({
            origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
            credentials: true,
        }));
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
            message: 'Too many requests from this IP, please try again later.',
        });
        app.use(limiter);
        app.use(express_1.default.json({ limit: '10mb' }));
        app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        app.use(logger_middleware_1.loggerMiddleware);
        app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            });
        });
        const authController = new auth_controller_1.AuthController();
        const userController = new user_controller_1.UserController();
        const artworkController = new artwork_controller_1.ArtworkController();
        const curationController = new curation_controller_1.CurationController();
        app.use('/auth', authController.router);
        app.use('/users', userController.router);
        app.use('/artworks', artworkController.router);
        app.use('/curations', curationController.router);
        app.use((error, req, res, next) => {
            logger.error('Unhandled error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        });
        app.use('*', (req, res) => {
            res.status(404).json({
                message: 'Route not found',
                path: req.originalUrl,
            });
        });
        const port = parseInt(process.env.PORT || '3000');
        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await AppDataSource.destroy();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await AppDataSource.destroy();
    process.exit(0);
});
bootstrap().catch((error) => {
    logger.error('Bootstrap failed:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map