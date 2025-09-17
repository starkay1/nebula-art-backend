import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nebula-art-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export interface LoggedRequest extends Request {
  startTime?: number;
  requestId?: string;
}

/**
 * Request logging middleware
 */
export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const loggedReq = req as LoggedRequest;
  
  // Generate unique request ID
  loggedReq.requestId = generateRequestId();
  loggedReq.startTime = Date.now();

  // Log request start
  logger.info('Request started', {
    requestId: loggedReq.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body: any) {
    const responseTime = Date.now() - (loggedReq.startTime || Date.now());
    
    // Log response
    logger.info('Request completed', {
      requestId: loggedReq.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString(),
    });

    // Log error responses with more detail
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

  // Override res.send to log response
  const originalSend = res.send;
  res.send = function(body: any) {
    const responseTime = Date.now() - (loggedReq.startTime || Date.now());
    
    // Log response
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

  // Handle response finish event
  res.on('finish', () => {
    const responseTime = Date.now() - (loggedReq.startTime || Date.now());
    
    // Log slow requests
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

  // Handle errors
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

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log database queries (for development)
 */
export function logDatabaseQuery(query: string, parameters?: any[], duration?: number): void {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Database query', {
      query,
      parameters,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Log authentication events
 */
export function logAuthEvent(event: string, userId?: string, details?: any): void {
  logger.info('Authentication event', {
    event,
    userId,
    details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log security events
 */
export function logSecurityEvent(event: string, ip: string, details?: any): void {
  logger.warn('Security event', {
    event,
    ip,
    details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log business events
 */
export function logBusinessEvent(event: string, userId?: string, details?: any): void {
  logger.info('Business event', {
    event,
    userId,
    details,
    timestamp: new Date().toISOString(),
  });
}

export { logger };
