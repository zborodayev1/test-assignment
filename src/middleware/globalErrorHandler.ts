import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError.js';
import {
  handleCastErrorDB,
  handleJWTError,
  handleJWTExpiredError,
  handleValidationErrorDB,
} from '../utils/errorHandlers.js';
import { logger } from '../utils/logger.js';

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message } as AppError;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

interface ErrorResponseDev {
  status: string;
  error: unknown;
  message: string;
  stack?: string;
}

const sendErrorDev = (err: AppError, res: Response): void => {
  const response: ErrorResponseDev = {
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  };
  res.status(err.statusCode).json(response);
};

interface ErrorResponseProd {
  status: string;
  message: string;
}

interface ErrorProd extends Error {
  statusCode: number;
  status: string;
  isOperational?: boolean;
  message: string;
}

const sendErrorProd = (err: ErrorProd, res: Response): void => {
  if (err.isOperational) {
    const response: ErrorResponseProd = {
      status: err.status,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
  } else {
    logger.error('ERROR 💥', err);

    const response: ErrorResponseProd = {
      status: 'error',
      message: 'Something went wrong!',
    };
    res.status(500).json(response);
  }
};
