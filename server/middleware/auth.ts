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
  const isAdmin = !!req.user.adminRole || req.user.id === 'admin-1';
  if (!isAdmin) {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }

  if (req.user.adminRole !== 'master' && req.user.id !== 'admin-1') {
    const permissions: string[] = req.user.adminPermissions || [];
    const path = req.path;
    let required = 'users';
    if (/\/admin\/(transactions|gateway-orders|agent-payouts|coupons|vault-transfers)/.test(path) || /\/admin\/users\/[^/]+\/(wallet|wagering)/.test(path)) required = 'finance';
    else if (/\/admin\/tickets/.test(path)) required = 'support';
    else if (/\/admin\/(games|rounds)/.test(path)) required = 'games';
    else if (/\/admin\/(settings|2fa)/.test(path)) required = 'security';

    const readOnlyAllowed = permissions.includes('read') && req.method === 'GET';
    if (!permissions.includes(required) && !readOnlyAllowed && !(required === 'security' && path.includes('/2fa/'))) {
      res.status(403).json({ error: `Your admin role does not include the ${required} permission` });
      return;
    }
  }

  next();
}

export function requireMasterAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (req.user.adminRole !== 'master' && req.user.id !== 'admin-1') {
    res.status(403).json({ error: 'Only the master administrator can manage sub-admins' });
    return;
  }
  next();
}
