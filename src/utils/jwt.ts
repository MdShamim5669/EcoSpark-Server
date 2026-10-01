import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { envVars } from "../config/env";

export interface IJwtOptions {
  expiresIn?: string | number;
}

/**
 * Sign a new JWT token
 */
export const signToken = (
  payload: object,
  secret: Secret = envVars.JWT_SECRET,
  expiresIn: string | number = envVars.JWT_EXPIRES_IN
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
};

export const generateToken = signToken;

/**
 * Verify a JWT token
 */
export const verifyToken = (
  token: string,
  secret: Secret = envVars.JWT_SECRET
): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

/**
 * Decode a JWT token without verifying
 */
export const decodeToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null;
};

export default {
  signToken,
  generateToken,
  verifyToken,
  decodeToken,
};
