import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

// Sends a standardized success response
export const sendSuccess = (
  res: Response,
  data: unknown,
  message: string = '',
  statusCode: number = StatusCodes.OK
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Sends a standardized error response
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  errors: unknown = null
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
