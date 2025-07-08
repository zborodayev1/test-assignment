import { AppError } from './appError.js';

export const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

export const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors)
    .map((el: any) => el.message)
    .join('. ');
  const message = `Invalid input data. ${errors}`;
  return new AppError(message, 400);
};

export const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', 401);

export const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);
