import { Request, Response, NextFunction } from 'express';
import { Session, SessionData } from 'express-session';

export interface AuthRequest extends Request {
  session: Session & Partial<SessionData> & {
    userId?: string;
    userEmail?: string;
    userRole?: string;
  };
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}
