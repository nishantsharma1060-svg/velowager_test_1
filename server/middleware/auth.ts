import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  let token = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication token is required' });
    return;
  }

  try {
    const user = await authService.validateSession(token);
    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid or expired session' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Admin users are designated by user.id starts with 'admin-' or user.mobile === '9999999999'
  const isAdmin = req.user.id.startsWith('admin-') || req.user.mobile === '9999999999';
  if (!isAdmin) {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }

  next();
}
