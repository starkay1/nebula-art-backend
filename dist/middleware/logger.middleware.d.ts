import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
declare const logger: winston.Logger;
export interface LoggedRequest extends Request {
    startTime?: number;
    requestId?: string;
}
export declare function loggerMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function logDatabaseQuery(query: string, parameters?: any[], duration?: number): void;
export declare function logAuthEvent(event: string, userId?: string, details?: any): void;
export declare function logSecurityEvent(event: string, ip: string, details?: any): void;
export declare function logBusinessEvent(event: string, userId?: string, details?: any): void;
export { logger };
//# sourceMappingURL=logger.middleware.d.ts.map