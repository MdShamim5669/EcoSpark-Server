import { envVars } from "./env";

export { envVars };

export const config = {
  env: envVars.NODE_ENV,
  port: parseInt(envVars.PORT, 10) || 5000,
  databaseUrl: envVars.DATABASE_URL,
  clientUrl: envVars.CLIENT_URL,
  jwt: {
    secret: envVars.ACCESS_TOKEN_SECRET,
    expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN,
  },
  bcrypt: {
    saltRounds: parseInt(envVars.BCRYPT_SALT_ROUNDS, 10) || 12,
  },
  payment: {
    gatewayUrl: envVars.PAYMENT.PAYMENT_GATEWAY_URL,
    storeId: envVars.PAYMENT.STORE_ID || envVars.PAYMENT.PAYMENT_STORE_ID,
    storePassword: envVars.PAYMENT.STORE_PASSWORD || envVars.PAYMENT.PAYMENT_STORE_PASSWORD,
    isLive: envVars.PAYMENT.IS_LIVE,
    serverUrl: envVars.SERVER_URL,
  },
  cloudinary: {
    cloudName: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
  },
  stripe: {
    secretKey: envVars.STRIPE.STRIPE_SECRET_KEY,
    webhookSecret: envVars.STRIPE.STRIPE_WEBHOOK_SECRET,
  },
  gemini: {
    apiKey: envVars.GEMINI_API_KEY,
  },
};

export default config;
