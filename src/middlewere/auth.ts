import type { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/responseHelper";
import jwt from 'jsonwebtoken'
import { StatusCodes } from "http-status-codes";
import config from "../config";
import type { JwtPayload } from "../types";


export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization;

  if (!token) {
    sendError(res, 'Access denied. No token provided.', StatusCodes.UNAUTHORIZED);
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    sendError(res, 'Invalid or expired token.', StatusCodes.UNAUTHORIZED);
  }
};