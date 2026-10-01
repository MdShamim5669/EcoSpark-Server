import bcrypt from "bcryptjs";
import { Request } from "express";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { IRequestUser } from "../interfaces/requestUser.interface";

/**
 * Hash a plain text password with bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, config.bcrypt.saltRounds);
};

/**
 * Compare plain text password with hashed password
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generate a signed JWT token
 */
export const generateToken = (
  payload: object,
  secret: Secret = config.jwt.secret,
  expiresIn: string | number = config.jwt.expiresIn
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string, secret: Secret = config.jwt.secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

/**
 * Extract JWT token from Authorization header or cookie
 */
export const extractToken = (req: Request): string | undefined => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return undefined;
};

export const AuthLib = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractToken,
};

export default AuthLib;
