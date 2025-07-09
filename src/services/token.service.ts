import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import {
  APP_NAME,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from '../config/env.js';
import { ITokenPayload } from '../interfaces/token/token.interface.js';
import { IUser } from '../models/user.model.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

export class TokenService {
  private accessTokenSecret: Secret = JWT_SECRET;
  private refreshTokenSecret: Secret = JWT_REFRESH_SECRET;
  private accessTokenExpiry: string = JWT_EXPIRES_IN || '10m';
  private refreshTokenExpiry: string = JWT_REFRESH_EXPIRES_IN || '6d';

  generateAccessToken(payload: ITokenPayload): string {
    try {
      const signOptions: SignOptions = {
        expiresIn: this
          .accessTokenExpiry as unknown as SignOptions['expiresIn'],
        issuer: APP_NAME,
        audience: APP_NAME,
      };
      return jwt.sign(payload, this.accessTokenSecret, signOptions);
    } catch (error) {
      logger.error(`Failed to generate access token: ${error}`);
      throw new AppError(
        'Token generation failed',
        500,
        'TOKEN_GENERATION_ERROR'
      );
    }
  }

  generateRefreshToken(payload: ITokenPayload): string {
    try {
      const signOptions: SignOptions = {
        expiresIn: this
          .refreshTokenExpiry as unknown as SignOptions['expiresIn'],
        issuer: APP_NAME,
        audience: APP_NAME,
      };
      return jwt.sign(payload, this.refreshTokenSecret, signOptions);
    } catch (error) {
      logger.error(`Failed to generate refresh token: ${error}`);
      throw new AppError(
        'Token generation failed',
        500,
        'TOKEN_GENERATION_ERROR'
      );
    }
  }

  async generateTokenPair(user: IUser): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  }> {
    const payload: ITokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiry,
    };
  }

  verifyAccessToken(token: string): JwtPayload | string {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: APP_NAME,
        audience: APP_NAME,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
        }
        if (error.name === 'JsonWebTokenError') {
          throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
        }
      }
      throw new AppError(
        'Token verification failed',
        401,
        'TOKEN_VERIFICATION_FAILED'
      );
    }
  }

  verifyRefreshToken(token: string): JwtPayload | string {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: APP_NAME,
        audience: APP_NAME,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
        }
        if (error.name === 'JsonWebTokenError') {
          throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
        }
      }
      throw new AppError(
        'Token verification failed',
        401,
        'TOKEN_VERIFICATION_FAILED'
      );
    }
  }

  decodeToken(token: string): null | JwtPayload | string {
    try {
      return jwt.decode(token);
    } catch {
      throw new AppError('Failed to decode token', 400, 'TOKEN_DECODE_ERROR');
    }
  }
}
