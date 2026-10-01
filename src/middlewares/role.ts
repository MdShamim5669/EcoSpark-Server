import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

export const role = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ApiError(401, "You are not authorized.");
      }

      if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
        throw new ApiError(403, "You do not have permission to access this resource.");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
