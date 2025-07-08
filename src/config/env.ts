import dotenv from 'dotenv-safe';

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3000;
export const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/issuehub';

if (!process.env.MONGO_URI && NODE_ENV === 'production') {
  throw new Error('MONGO_URI environment variable is required');
}

export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '10m';

export const JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN || '6d';

export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '12');

export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
export const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const CACHE_TTL = process.env.CACHE_TTL || '600';

export const APP_NAME = process.env.APP_NAME || 'TestProject';
export const APP_VERSION = process.env.APP_VERSION || '1.0.0';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

export const CLIENT_SUCCESS_URL =
  process.env.CLIENT_SUCCESS_URL || 'http://localhost:5173/';
export const CLIENT_BASE_URL =
  process.env.CLIENT_BASE_URL || 'http://localhost:5173/';
export const CLIENT_ERROR_URL =
  process.env.CLIENT_ERROR_URL || 'http://localhost:5173/sign-up';

export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
export const COOKIE_SECRET = process.env.COOKIE_SECRET || 'secret';
