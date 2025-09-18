"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.loggerMiddleware = loggerMiddleware;
exports.logDatabaseQuery = logDatabaseQuery;
exports.logAuthEvent = logAuthEvent;
exports.logSecurityEvent = logSecurityEvent;
exports.logBusinessEvent = logBusinessEvent;
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    defaultMeta: { service: 'nebula-art-api' },
    transports: [
        new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
    ],
});
exports.logger = logger;
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple()
    }));
}
function loggerMiddleware(req, res, next) {
    const loggedReq = req;
    loggedReq.requestId = generateRequestId();
    loggedReq.startTime = Date.now();
    logger.info('Request started', {
        requestId: loggedReq.requestId,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
    });
    const originalJson = res.json;
    res.json = function (body) {
        const responseTime = Date.now() - (loggedReq.startTime || Date.now());
        logger.info('Request completed', {
            requestId: loggedReq.requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            contentLength: res.get('Content-Length'),
            timestamp: new Date().toISOString(),
        });
        if (res.statusCode >= 400) {
            logger.error('Error response', {
                requestId: loggedReq.requestId,
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                responseTime: `${responseTime}ms`,
                responseBody: body,
                timestamp: new Date().toISOString(),
            });
        }
        return originalJson.call(this, body);
    };
    const originalSend = res.send;
    res.send = function (body) {
        const responseTime = Date.now() - (loggedReq.startTime || Date.now());
        logger.info('Request completed', {
            requestId: loggedReq.requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            contentLength: res.get('Content-Length'),
            timestamp: new Date().toISOString(),
        });
        return originalSend.call(this, body);
    };
    res.on('finish', () => {
        const responseTime = Date.now() - (loggedReq.startTime || Date.now());
        if (responseTime > 1000) {
            logger.warn('Slow request detected', {
                requestId: loggedReq.requestId,
                method: req.method,
                url: req.url,
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString(),
            });
        }
    });
    res.on('error', (error) => {
        logger.error('Response error', {
            requestId: loggedReq.requestId,
            method: req.method,
            url: req.url,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
        });
    });
    next();
}
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function logDatabaseQuery(query, parameters, duration) {
    if (process.env.NODE_ENV === 'development') {
        logger.debug('Database query', {
            query,
            parameters,
            duration: duration ? `${duration}ms` : undefined,
            timestamp: new Date().toISOString(),
        });
    }
}
function logAuthEvent(event, userId, details) {
    logger.info('Authentication event', {
        event,
        userId,
        details,
        timestamp: new Date().toISOString(),
    });
}
function logSecurityEvent(event, ip, details) {
    logger.warn('Security event', {
        event,
        ip,
        details,
        timestamp: new Date().toISOString(),
    });
}
function logBusinessEvent(event, userId, details) {
    logger.info('Business event', {
        event,
        userId,
        details,
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=logger.middleware.js.map