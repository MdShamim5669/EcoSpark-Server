import { CookieOptions, Response } from "express";
import { envVars } from "../config/env";

export interface IAuthCookieOptions {
  cookieName?: string;
  maxAgeMs?: number;
  sameSite?: boolean | "lax" | "strict" | "none";
}

const isProduction = envVars.NODE_ENV === "production";

/**
 * Standard default cookie options
 */
export const getDefaultCookieOptions = (maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  maxAge: maxAgeMs,
});

/**
 * Set authentication token cookie in HTTP response
 */
export const setAuthCookie = (
  res: Response,
  token: string,
  cookieName: string = "token",
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000
): void => {
  res.cookie(cookieName, token, getDefaultCookieOptions(maxAgeMs));
};

/**
 * Set refresh token cookie in HTTP response
 */
export const setRefreshTokenCookie = (
  res: Response,
  token: string,
  cookieName: string = "refreshToken",
  maxAgeMs: number = 30 * 24 * 60 * 60 * 1000
): void => {
  res.cookie(cookieName, token, getDefaultCookieOptions(maxAgeMs));
};

/**
 * Clear authentication cookie
 */
export const clearAuthCookie = (res: Response, cookieName: string = "token"): void => {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
  });
};

export default {
  getDefaultCookieOptions,
  setAuthCookie,
  setRefreshTokenCookie,
  clearAuthCookie,
};
