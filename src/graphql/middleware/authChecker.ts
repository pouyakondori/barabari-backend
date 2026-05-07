import { AuthChecker } from "type-graphql";
import jwt from "jsonwebtoken";
import { authConfig } from "../../config/auth";

export interface Context {
  userId?: string;
  userRole?: string;
}

export const authChecker: AuthChecker<Context> = ({ context }, roles) => {
  if (!context.userId) {
    return false;
  }
  if (roles.length > 0 && !roles.includes(context.userRole || "")) {
    return false;
  }
  return true;
};

export function extractUserFromToken(authHeader?: string): Partial<Context> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {};
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, authConfig.accessSecret) as {
      userId: string;
      role: string;
    };
    return { userId: payload.userId, userRole: payload.role };
  } catch {
    return {};
  }
}
