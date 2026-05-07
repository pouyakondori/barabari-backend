import { env } from "./env";

export const authConfig = {
  accessSecret: env.JWT_ACCESS_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  accessExpiry: env.JWT_ACCESS_EXPIRY,
  refreshExpiry: env.JWT_REFRESH_EXPIRY,
};
