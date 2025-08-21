import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/common';
export interface AuthRequest extends Request {
    user?: any;
}
export declare const attachUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireRole: (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export { requireRole as authorizeRoles };
//# sourceMappingURL=auth.d.ts.map