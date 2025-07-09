import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.ts';

interface DecodedToken {
  userId: string;
}

export class AuthMiddleware {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  private extractToken(req: Request): string | null {
    const cookieToken = req.cookies?.accessToken;
    if (cookieToken) {
      return cookieToken;
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  private clearTokens(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = this.extractToken(req);

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
        this.clearTokens(res);
        if (user.blocked?.by === 'admin') {
          throw new AppError('Account is blocked', 403, 'ACCOUNT_BLOCKED');
        }
      }

      req.user = user;
      next();
    } catch (err) {
      logger.error(err);

      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          error: err.message,
          code: err.code,
        });
      }

      if (err instanceof Error) {
        if (err.name === 'TokenExpiredError') {
          this.clearTokens(res);
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
      }

      return res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}
