// services/token.service.js
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
  private accessTokenSecret: Secret;
  private refreshTokenSecret: Secret;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = JWT_SECRET;
    this.refreshTokenSecret = JWT_REFRESH_SECRET;
    this.accessTokenExpiry = JWT_EXPIRES_IN || '10m';
    this.refreshTokenExpiry = JWT_REFRESH_EXPIRES_IN || '6d';
  }

  generateAccessToken(payload: ITokenPayload): string {
    try {
      const signOptions: SignOptions = {
        expiresIn: this.getExpiryTime(this.refreshTokenExpiry),
        issuer: APP_NAME,
        audience: APP_NAME,
      };
      return jwt.sign(payload, this.refreshTokenSecret, signOptions);
    } catch (error) {
      logger.error(`Failed to generate access token ${error}`);
      throw new AppError(
        'Token generation failed',
        500,
        'TOKEN_GENERATION_ERROR'
      );
    }
  }

  generateRefreshToken(payload: ITokenPayload): string {
    try {
      return jwt.sign({ ...payload }, this.refreshTokenSecret, {
        expiresIn: this.getExpiryTime(this.refreshTokenExpiry),
        issuer: APP_NAME,
        audience: APP_NAME,
      });
    } catch (error) {
      logger.error(`Failed to generate refresh token ${error}`);
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
    expiresIn: number;
  }> {
    const payload: ITokenPayload = {
      userId: user.id.toString(),
      email: user.email,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpiryTime(this.accessTokenExpiry),
    };
  }

  verifyAccessToken(token: string): JwtPayload | string {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: APP_NAME,
        audience: APP_NAME,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid access token', 401, 'INVALID_TOKEN');
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
      if (error.name === 'TokenExpiredError') {
        throw new AppError(
          'Refresh token expired',
          401,
          'REFRESH_TOKEN_EXPIRED'
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError(
          'Invalid refresh token',
          401,
          'INVALID_REFRESH_TOKEN'
        );
      }
      throw new AppError(
        'Refresh token verification failed',
        401,
        'REFRESH_TOKEN_VERIFICATION_FAILED'
      );
    }
  }

  getExpiryTime(expiry: string): number {
    const timeUnits = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    return value * (timeUnits[unit] || timeUnits.m);
  }

  decodeToken(token: string): null | JwtPayload | string {
    try {
      return jwt.decode(token);
    } catch {
      throw new AppError('Failed to decode token', 400, 'TOKEN_DECODE_ERROR');
    }
  }
}
