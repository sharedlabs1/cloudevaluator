import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ERROR_MESSAGES } from '../utils/errorMessages';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  const statusCode = (err as any).status || 500;
  const message = err.message || ERROR_MESSAGES.SERVER_ERROR;

  res.status(statusCode).json({
    error: true,
    message,
  });
};