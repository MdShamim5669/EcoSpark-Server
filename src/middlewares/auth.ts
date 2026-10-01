import { NextFunction, Request, Response } from "express";
import { config } from "../config";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new ApiError(401, "You are not authorized. Please log in.");
    }

    // Verify token
    const decoded = verifyToken(token, config.jwt.secret) as { id: string; role: any };
    if (!decoded || !decoded.id) {
      throw new ApiError(401, "Invalid or expired token.");
    }

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      throw new ApiError(401, "User not found.");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Your account has been deactivated. Please contact support.");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyToken(token, config.jwt.secret) as { id: string; role: any };
      if (decoded && decoded.id) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, role: true, isActive: true },
        });

        if (user && user.isActive) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        }
      }
    } catch {
      // Invalid/expired token: continue as guest
    }

    next();
  } catch (error) {
    next(error);
  }
};
