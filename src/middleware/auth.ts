import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/common';

export interface AuthRequest extends Request {
  user?: any;
}

// Add a middleware to attach user to the request object
export const attachUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  req.user = { id: 1, role: 'admin' }; // Mock user for now
  next();
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any): void => {
    if (err) {
      res.status(403).json({ success: false, message: 'Invalid token' });
      return;
    }
    req.user = user;
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }
    
    next();
  };
};

export { requireRole as authorizeRoles };