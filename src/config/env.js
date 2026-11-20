import dotenv from "dotenv";

dotenv.config();

// Environment
const NODE_ENV = (process.env.NODE_ENV || "dev").trim().split(/\s+/)[0];

const isProd = NODE_ENV === "prod";
const isDev = NODE_ENV === "dev";
const isTest = NODE_ENV === "test";

// Configuration
const env = {
  NODE_ENV,
  APP_NAME: process.env.APP_NAME || "CBSG",
  PORT: Number(process.env.PORT) || 7080,

  // Database
  MONGO_URI: isDev
    ? process.env.DEV_MONGO_URI
    : process.env.PROD_MONGO_URI,

  // admin credentials
  ADMIN_NAME: process.env.ADMIN_NAME || "Super Admin",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@cbsg.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "ChangeThisPassword123!",
  ADMIN_MOBILE: process.env.ADMIN_MOBILE || "9999999999",


  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "7d",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

  // OTP
  FIXED_OTP: isDev || isTest ? "123456" : null,
  USE_FIXED_OTP: isDev || isTest,

  // SMS
  USE_SMS: !isDev,
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_API_SECRET: process.env.SMS_API_SECRET,

  // CORS
  CLIENT_URL: (process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim()),

  // Email
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  // AWS S3
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
};

export default env;
