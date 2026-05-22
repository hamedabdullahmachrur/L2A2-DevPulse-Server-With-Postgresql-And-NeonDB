import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/responseHelper';

// Must be used AFTER authenticate middleware
export const requireMaintainer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'maintainer') {
    sendError(
      res,
      'Access denied. Maintainer role required.',
      StatusCodes.FORBIDDEN
    );
    return;
  }
  next();
};
