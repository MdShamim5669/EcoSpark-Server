import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { signToken, verifyToken } from "./jwt";

export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Create an Access Token (short-lived, e.g. 7d or configurable)
 */
export const createAccessToken = (payload: ITokenPayload | object): string => {
  return signToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET || envVars.JWT_SECRET,
    envVars.ACCESS_TOKEN_EXPIRES_IN || envVars.JWT_EXPIRES_IN || "7d"
  );
};

/**
 * Create a Refresh Token (longer-lived, e.g. 30d)
 */
export const createRefreshToken = (payload: ITokenPayload | object): string => {
  return signToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET || envVars.JWT_SECRET,
    envVars.REFRESH_TOKEN_EXPIRES_IN || "30d"
  );
};

/**
 * Verify an Access Token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return verifyToken(token, envVars.ACCESS_TOKEN_SECRET || envVars.JWT_SECRET);
};

/**
 * Verify a Refresh Token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return verifyToken(token, envVars.REFRESH_TOKEN_SECRET || envVars.JWT_SECRET);
};

export default {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
