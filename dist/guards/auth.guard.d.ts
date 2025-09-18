import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User.entity';
export interface AuthenticatedRequest extends Request {
    user: User;
    userId: string;
}
export declare class AuthGuard {
    private userRepository;
    constructor();
    authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
    requireArtist(req: Request, res: Response, next: NextFunction): Promise<void>;
    optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkOwnership(userIdField?: string): (req: Request, res: Response, next: NextFunction) => void;
    userRateLimit(maxRequests?: number, windowMs?: number): (req: Request, res: Response, next: NextFunction) => void;
}
export declare const authGuard: AuthGuard;
//# sourceMappingURL=auth.guard.d.ts.map