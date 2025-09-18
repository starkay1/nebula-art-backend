"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULTS = exports.REGEX = exports.ENV_VARS = exports.JWT_CONFIG = exports.SORT_OPTIONS = exports.CURRENCIES = exports.CURATION_CATEGORIES = exports.CURATION_THEMES = exports.ARTWORK_CATEGORIES = exports.RATE_LIMITS = exports.CACHE_TTL = exports.PAGINATION = exports.UPLOAD_CONSTRAINTS = exports.DB_CONSTRAINTS = exports.HTTP_STATUS = exports.MESSAGES = void 0;
exports.MESSAGES = {
    SUCCESS: {
        USER_CREATED: 'User created successfully',
        USER_UPDATED: 'User updated successfully',
        USER_DELETED: 'User deleted successfully',
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'Logout successful',
        ARTWORK_CREATED: 'Artwork created successfully',
        ARTWORK_UPDATED: 'Artwork updated successfully',
        ARTWORK_DELETED: 'Artwork deleted successfully',
        CURATION_CREATED: 'Curation created successfully',
        CURATION_UPDATED: 'Curation updated successfully',
        CURATION_DELETED: 'Curation deleted successfully',
        FOLLOW_SUCCESS: 'User followed successfully',
        UNFOLLOW_SUCCESS: 'User unfollowed successfully',
        LIKE_SUCCESS: 'Artwork liked successfully',
        UNLIKE_SUCCESS: 'Artwork unliked successfully',
    },
    ERROR: {
        VALIDATION_FAILED: 'Validation failed',
        UNAUTHORIZED: 'Unauthorized access',
        FORBIDDEN: 'Access forbidden',
        NOT_FOUND: 'Resource not found',
        CONFLICT: 'Resource already exists',
        INTERNAL_ERROR: 'Internal server error',
        INVALID_CREDENTIALS: 'Invalid credentials',
        TOKEN_EXPIRED: 'Token has expired',
        TOKEN_INVALID: 'Invalid token',
        USER_NOT_FOUND: 'User not found',
        ARTWORK_NOT_FOUND: 'Artwork not found',
        CURATION_NOT_FOUND: 'Curation not found',
        INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
        IMAGE_PROCESSING_FAILED: 'Image processing failed',
        FILE_TOO_LARGE: 'File size exceeds maximum allowed',
        INVALID_FILE_TYPE: 'Invalid file type',
        RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    },
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};
exports.DB_CONSTRAINTS = {
    USER: {
        NAME_MIN_LENGTH: 2,
        NAME_MAX_LENGTH: 50,
        USERNAME_MIN_LENGTH: 3,
        USERNAME_MAX_LENGTH: 30,
        EMAIL_MAX_LENGTH: 100,
        PASSWORD_MIN_LENGTH: 6,
        PASSWORD_MAX_LENGTH: 128,
        BIO_MAX_LENGTH: 500,
        LOCATION_MAX_LENGTH: 100,
    },
    ARTWORK: {
        TITLE_MAX_LENGTH: 200,
        DESCRIPTION_MAX_LENGTH: 2000,
        TAG_MAX_LENGTH: 50,
        CATEGORY_MAX_LENGTH: 50,
        MEDIUM_MAX_LENGTH: 100,
        MIN_DIMENSION: 1,
        MAX_PRICE: 999999.99,
    },
    CURATION: {
        TITLE_MAX_LENGTH: 200,
        DESCRIPTION_MAX_LENGTH: 2000,
        TAG_MAX_LENGTH: 50,
        THEME_MAX_LENGTH: 50,
        CATEGORY_MAX_LENGTH: 50,
        MIN_ARTWORKS: 1,
        MAX_ARTWORKS: 100,
    },
    COMMENT: {
        CONTENT_MAX_LENGTH: 1000,
        MAX_NESTING_LEVEL: 3,
    },
};
exports.UPLOAD_CONSTRAINTS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    ALLOWED_MIME_TYPES: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ],
    IMAGE_SIZES: {
        THUMBNAIL: { width: 200, height: 200 },
        MEDIUM: { width: 800, height: 600 },
        LARGE: { width: 1200, height: 900 },
    },
    QUALITY: {
        THUMBNAIL: 80,
        MEDIUM: 85,
        ORIGINAL: 90,
    },
};
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
};
exports.CACHE_TTL = {
    USER_PROFILE: 300,
    ARTWORK_LIST: 180,
    CURATION_LIST: 300,
    FEATURED_CONTENT: 600,
    SEARCH_RESULTS: 120,
};
exports.RATE_LIMITS = {
    GENERAL: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 100,
    },
    AUTH: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 5,
    },
    UPLOAD: {
        WINDOW_MS: 60 * 60 * 1000,
        MAX_REQUESTS: 20,
    },
    SEARCH: {
        WINDOW_MS: 60 * 1000,
        MAX_REQUESTS: 30,
    },
};
exports.ARTWORK_CATEGORIES = [
    'painting',
    'sculpture',
    'photography',
    'digital',
    'mixed-media',
    'drawing',
    'printmaking',
    'installation',
    'performance',
    'video',
    'other',
];
exports.CURATION_THEMES = [
    'contemporary',
    'classical',
    'modern',
    'abstract',
    'landscape',
    'portrait',
    'still-life',
    'conceptual',
    'experimental',
    'traditional',
    'mixed',
];
exports.CURATION_CATEGORIES = [
    'exhibition',
    'collection',
    'showcase',
    'competition',
    'educational',
    'seasonal',
    'featured',
    'community',
    'artist-spotlight',
];
exports.CURRENCIES = [
    'CNY',
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'KRW',
    'HKD',
    'SGD',
];
exports.SORT_OPTIONS = {
    ARTWORKS: ['created_at', 'likes_count', 'views_count', 'title'],
    CURATIONS: ['created_at', 'likes_count', 'views_count', 'title'],
    USERS: ['created_at', 'followers_count', 'artworks_count', 'name'],
};
exports.JWT_CONFIG = {
    DEFAULT_SECRET: 'nebula-art-jwt-secret-change-in-production',
    DEFAULT_EXPIRES_IN: '7d',
    ALGORITHM: 'HS256',
};
exports.ENV_VARS = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000'),
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432'),
    DB_USERNAME: process.env.DB_USERNAME || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'password',
    DB_DATABASE: process.env.DB_DATABASE || 'nebula_art',
    JWT_SECRET: process.env.JWT_SECRET || exports.JWT_CONFIG.DEFAULT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || exports.JWT_CONFIG.DEFAULT_EXPIRES_IN,
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || exports.UPLOAD_CONSTRAINTS.MAX_FILE_SIZE.toString()),
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
exports.REGEX = {
    USERNAME: /^[a-zA-Z0-9_]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
};
exports.DEFAULTS = {
    USER: {
        AVATAR_URL: '/images/default-avatar.png',
        COVER_URL: '/images/default-cover.png',
        IS_ARTIST: false,
        IS_VERIFIED: false,
    },
    ARTWORK: {
        CURRENCY: 'CNY',
        IS_FOR_SALE: false,
        IS_PUBLIC: true,
        IS_FEATURED: false,
    },
    CURATION: {
        IS_PUBLIC: true,
        IS_FEATURED: false,
        CATEGORY: 'collection',
    },
};
//# sourceMappingURL=constants.js.map