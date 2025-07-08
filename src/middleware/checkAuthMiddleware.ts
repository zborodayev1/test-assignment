import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/appError.js';

interface DecodedToken {
  userId: string;
}

export class AuthMiddleware {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        throw new AppError('No token provided', 401, 'NO_TOKEN');
      }

      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      req.userId = decoded.userId;

      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new AppError('User not found', 401, 'USER_NOT_FOUND');
      }

      if (!user.isActive) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new AppError('Account is blocked', 403, 'ACCOUNT_BLOCKED');
      }

      req.user = user;
      next();
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          error: err.message,
          code: err.code,
        });
      }

      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
        });
      }

      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };

  requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: 'User not authenticated',
        code: 'UNAUTHORIZED',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin role required',
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}
