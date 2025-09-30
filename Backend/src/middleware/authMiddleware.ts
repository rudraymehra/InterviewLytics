import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface AuthRequest extends Request {
  user: IUser;
  params: any;
  query: any;
  body: any;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as { userId: string };
    
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Access denied. Please authenticate first.' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
      return;
    }

    next();
  };
};
