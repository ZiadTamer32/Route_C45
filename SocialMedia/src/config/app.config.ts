import { config } from "dotenv";
import path from "path";

config({
  path: path.resolve(`./.env.${process.env.NODE_ENV}`),
});

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || "dev";

// Database
export const DB_URL = process.env.DB_URL || "";
export const DB_NAME = process.env.DB_NAME || "";

// Security
export const SALT_ROUND = +process.env.SALT_ROUND! || 10;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";

// JWT
export const JWT_SECRET_USER = process.env.JWT_SECRET_USER || "";
export const JWT_SECRET_ADMIN = process.env.JWT_SECRET_ADMIN || "";
export const JWT_SECRET_USER_REFRESH =
  process.env.JWT_SECRET_USER_REFRESH || "";
export const JWT_SECRET_ADMIN_REFRESH =
  process.env.JWT_SECRET_ADMIN_REFRESH || "";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "";

// EMAIL
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "";
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME || "";
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "";

// Google
export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID || "";

// Redis
export const REDIS_URL = process.env.REDIS_URL || "";
