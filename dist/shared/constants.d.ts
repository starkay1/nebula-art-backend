export declare const MESSAGES: {
    readonly SUCCESS: {
        readonly USER_CREATED: "User created successfully";
        readonly USER_UPDATED: "User updated successfully";
        readonly USER_DELETED: "User deleted successfully";
        readonly LOGIN_SUCCESS: "Login successful";
        readonly LOGOUT_SUCCESS: "Logout successful";
        readonly ARTWORK_CREATED: "Artwork created successfully";
        readonly ARTWORK_UPDATED: "Artwork updated successfully";
        readonly ARTWORK_DELETED: "Artwork deleted successfully";
        readonly CURATION_CREATED: "Curation created successfully";
        readonly CURATION_UPDATED: "Curation updated successfully";
        readonly CURATION_DELETED: "Curation deleted successfully";
        readonly FOLLOW_SUCCESS: "User followed successfully";
        readonly UNFOLLOW_SUCCESS: "User unfollowed successfully";
        readonly LIKE_SUCCESS: "Artwork liked successfully";
        readonly UNLIKE_SUCCESS: "Artwork unliked successfully";
    };
    readonly ERROR: {
        readonly VALIDATION_FAILED: "Validation failed";
        readonly UNAUTHORIZED: "Unauthorized access";
        readonly FORBIDDEN: "Access forbidden";
        readonly NOT_FOUND: "Resource not found";
        readonly CONFLICT: "Resource already exists";
        readonly INTERNAL_ERROR: "Internal server error";
        readonly INVALID_CREDENTIALS: "Invalid credentials";
        readonly TOKEN_EXPIRED: "Token has expired";
        readonly TOKEN_INVALID: "Invalid token";
        readonly USER_NOT_FOUND: "User not found";
        readonly ARTWORK_NOT_FOUND: "Artwork not found";
        readonly CURATION_NOT_FOUND: "Curation not found";
        readonly INSUFFICIENT_PERMISSIONS: "Insufficient permissions";
        readonly IMAGE_PROCESSING_FAILED: "Image processing failed";
        readonly FILE_TOO_LARGE: "File size exceeds maximum allowed";
        readonly INVALID_FILE_TYPE: "Invalid file type";
        readonly RATE_LIMIT_EXCEEDED: "Rate limit exceeded";
    };
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const DB_CONSTRAINTS: {
    readonly USER: {
        readonly NAME_MIN_LENGTH: 2;
        readonly NAME_MAX_LENGTH: 50;
        readonly USERNAME_MIN_LENGTH: 3;
        readonly USERNAME_MAX_LENGTH: 30;
        readonly EMAIL_MAX_LENGTH: 100;
        readonly PASSWORD_MIN_LENGTH: 6;
        readonly PASSWORD_MAX_LENGTH: 128;
        readonly BIO_MAX_LENGTH: 500;
        readonly LOCATION_MAX_LENGTH: 100;
    };
    readonly ARTWORK: {
        readonly TITLE_MAX_LENGTH: 200;
        readonly DESCRIPTION_MAX_LENGTH: 2000;
        readonly TAG_MAX_LENGTH: 50;
        readonly CATEGORY_MAX_LENGTH: 50;
        readonly MEDIUM_MAX_LENGTH: 100;
        readonly MIN_DIMENSION: 1;
        readonly MAX_PRICE: 999999.99;
    };
    readonly CURATION: {
        readonly TITLE_MAX_LENGTH: 200;
        readonly DESCRIPTION_MAX_LENGTH: 2000;
        readonly TAG_MAX_LENGTH: 50;
        readonly THEME_MAX_LENGTH: 50;
        readonly CATEGORY_MAX_LENGTH: 50;
        readonly MIN_ARTWORKS: 1;
        readonly MAX_ARTWORKS: 100;
    };
    readonly COMMENT: {
        readonly CONTENT_MAX_LENGTH: 1000;
        readonly MAX_NESTING_LEVEL: 3;
    };
};
export declare const UPLOAD_CONSTRAINTS: {
    readonly MAX_FILE_SIZE: number;
    readonly ALLOWED_MIME_TYPES: readonly ["image/jpeg", "image/png", "image/webp", "image/gif"];
    readonly IMAGE_SIZES: {
        readonly THUMBNAIL: {
            readonly width: 200;
            readonly height: 200;
        };
        readonly MEDIUM: {
            readonly width: 800;
            readonly height: 600;
        };
        readonly LARGE: {
            readonly width: 1200;
            readonly height: 900;
        };
    };
    readonly QUALITY: {
        readonly THUMBNAIL: 80;
        readonly MEDIUM: 85;
        readonly ORIGINAL: 90;
    };
};
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
    readonly MIN_LIMIT: 1;
};
export declare const CACHE_TTL: {
    readonly USER_PROFILE: 300;
    readonly ARTWORK_LIST: 180;
    readonly CURATION_LIST: 300;
    readonly FEATURED_CONTENT: 600;
    readonly SEARCH_RESULTS: 120;
};
export declare const RATE_LIMITS: {
    readonly GENERAL: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 100;
    };
    readonly AUTH: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 5;
    };
    readonly UPLOAD: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 20;
    };
    readonly SEARCH: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 30;
    };
};
export declare const ARTWORK_CATEGORIES: readonly ["painting", "sculpture", "photography", "digital", "mixed-media", "drawing", "printmaking", "installation", "performance", "video", "other"];
export declare const CURATION_THEMES: readonly ["contemporary", "classical", "modern", "abstract", "landscape", "portrait", "still-life", "conceptual", "experimental", "traditional", "mixed"];
export declare const CURATION_CATEGORIES: readonly ["exhibition", "collection", "showcase", "competition", "educational", "seasonal", "featured", "community", "artist-spotlight"];
export declare const CURRENCIES: readonly ["CNY", "USD", "EUR", "GBP", "JPY", "KRW", "HKD", "SGD"];
export declare const SORT_OPTIONS: {
    readonly ARTWORKS: readonly ["created_at", "likes_count", "views_count", "title"];
    readonly CURATIONS: readonly ["created_at", "likes_count", "views_count", "title"];
    readonly USERS: readonly ["created_at", "followers_count", "artworks_count", "name"];
};
export declare const JWT_CONFIG: {
    readonly DEFAULT_SECRET: "nebula-art-jwt-secret-change-in-production";
    readonly DEFAULT_EXPIRES_IN: "7d";
    readonly ALGORITHM: "HS256";
};
export declare const ENV_VARS: {
    readonly NODE_ENV: string;
    readonly PORT: number;
    readonly DB_HOST: string;
    readonly DB_PORT: number;
    readonly DB_USERNAME: string;
    readonly DB_PASSWORD: string;
    readonly DB_DATABASE: string;
    readonly JWT_SECRET: string;
    readonly JWT_EXPIRES_IN: string;
    readonly UPLOAD_PATH: string;
    readonly MAX_FILE_SIZE: number;
    readonly CORS_ORIGIN: string;
};
export declare const REGEX: {
    readonly USERNAME: RegExp;
    readonly PASSWORD: RegExp;
    readonly EMAIL: RegExp;
    readonly UUID: RegExp;
    readonly HEX_COLOR: RegExp;
};
export declare const DEFAULTS: {
    readonly USER: {
        readonly AVATAR_URL: "/images/default-avatar.png";
        readonly COVER_URL: "/images/default-cover.png";
        readonly IS_ARTIST: false;
        readonly IS_VERIFIED: false;
    };
    readonly ARTWORK: {
        readonly CURRENCY: "CNY";
        readonly IS_FOR_SALE: false;
        readonly IS_PUBLIC: true;
        readonly IS_FEATURED: false;
    };
    readonly CURATION: {
        readonly IS_PUBLIC: true;
        readonly IS_FEATURED: false;
        readonly CATEGORY: "collection";
    };
};
export type ArtworkCategory = typeof ARTWORK_CATEGORIES[number];
export type CurationTheme = typeof CURATION_THEMES[number];
export type CurationCategory = typeof CURATION_CATEGORIES[number];
export type Currency = typeof CURRENCIES[number];
export type SortOption = typeof SORT_OPTIONS.ARTWORKS[number] | typeof SORT_OPTIONS.CURATIONS[number] | typeof SORT_OPTIONS.USERS[number];
//# sourceMappingURL=constants.d.ts.map