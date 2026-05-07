import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27018/barabari",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || "15m",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  UPLOADS_DIR: process.env.UPLOADS_DIR || "./uploads",
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || "50", 10),
};
