import dotenv from "dotenv";
import status from "http-status";
import AppError from "../errorHelpers/AppError";

dotenv.config();

export interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;

  // Authentication & Security (PRD Section 10 & 15)
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  BCRYPT_SALT_ROUNDS: string;

  // Frontend / Client (PRD Section 15)
  CLIENT_URL: string;
  FRONTEND_URL: string;
  SERVER_URL: string;

  // Cloudinary Image Storage (PRD Section 15)
  CLOUDINARY: {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };

  // Payment Gateway (SSLCommerz / ShurjoPay sandbox / live - PRD Section 15)
  PAYMENT: {
    PAYMENT_GATEWAY_URL: string;
    STORE_ID: string;
    STORE_PASSWORD: string;
    PAYMENT_STORE_ID: string;
    PAYMENT_STORE_PASSWORD: string;
    IS_LIVE: boolean;
  };

  // Stripe Payment Option (PRD Architecture Section 2)
  STRIPE: {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
  };

  // Seed Admin Credentials (PRD Section 2 & 15)
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;

  // Gemini AI / RAG Configuration
  GEMINI_API_KEY: string;
}

const loadEnvVariables = (): EnvConfig => {
  // Required variables that must be present for the app to function
  const requireEnvVariable = [
    "DATABASE_URL",
  ];

  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${variable} is required but not set in .env file.`
      );
    }
  });

  // JWT Secret resolution (PRD uses JWT_SECRET, dual-support ACCESS_TOKEN_SECRET)
  const jwtSecret =
    process.env.JWT_SECRET ||
    process.env.ACCESS_TOKEN_SECRET ||
    "ecospark-hub-super-secret-jwt-key-2026";

  const jwtExpiresIn =
    process.env.JWT_EXPIRES_IN ||
    process.env.ACCESS_TOKEN_EXPIRES_IN ||
    "7d";

  // Client URL resolution (PRD uses CLIENT_URL)
  const clientUrl =
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000";

  // Payment store credentials (PRD uses STORE_ID, STORE_PASSWORD)
  const storeId =
    process.env.STORE_ID ||
    process.env.PAYMENT_STORE_ID ||
    "";

  const storePassword =
    process.env.STORE_PASSWORD ||
    process.env.PAYMENT_STORE_PASSWORD ||
    "";

  // Admin seed credentials (PRD uses ADMIN_EMAIL, ADMIN_PASSWORD)
  const adminEmail =
    process.env.ADMIN_EMAIL ||
    process.env.SUPER_ADMIN_EMAIL ||
    "admin@ecospark.com";

  const adminPassword =
    process.env.ADMIN_PASSWORD ||
    process.env.SUPER_ADMIN_PASSWORD ||
    "admin123";

  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "5000",
    DATABASE_URL: process.env.DATABASE_URL as string,

    // Auth & JWT
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: jwtExpiresIn,
    ACCESS_TOKEN_SECRET: jwtSecret,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || jwtSecret,
    ACCESS_TOKEN_EXPIRES_IN: jwtExpiresIn,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || "12",

    // Client & Server
    CLIENT_URL: clientUrl,
    FRONTEND_URL: clientUrl,
    SERVER_URL: process.env.SERVER_URL || `http://localhost:${process.env.PORT || "5000"}`,

    // Cloudinary
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
    },

    // Payment Gateway
    PAYMENT: {
      PAYMENT_GATEWAY_URL: process.env.PAYMENT_GATEWAY_URL || "",
      STORE_ID: storeId,
      STORE_PASSWORD: storePassword,
      PAYMENT_STORE_ID: storeId,
      PAYMENT_STORE_PASSWORD: storePassword,
      IS_LIVE: process.env.SSL_IS_LIVE === "true",
    },

    // Stripe
    STRIPE: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
    },

    // Admin Credentials
    ADMIN_EMAIL: adminEmail,
    ADMIN_PASSWORD: adminPassword,
    SUPER_ADMIN_EMAIL: adminEmail,
    SUPER_ADMIN_PASSWORD: adminPassword,

    // Gemini AI / RAG
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  };
};

export const envVars = loadEnvVariables();

export default envVars;
