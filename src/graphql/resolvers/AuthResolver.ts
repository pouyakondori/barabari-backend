import { Resolver, Query, Mutation, Arg, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserType, AuthPayload } from "../types/UserType";
import { RegisterInput, LoginInput } from "../inputs/AuthInput";
import { User } from "../../models/User";
import { authConfig } from "../../config/auth";
import { Context } from "../middleware/authChecker";

function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { userId, role },
    authConfig.accessSecret,
    { expiresIn: authConfig.accessExpiry }
  );
  const refreshToken = jwt.sign(
    { userId, role },
    authConfig.refreshSecret,
    { expiresIn: authConfig.refreshExpiry }
  );
  return { accessToken, refreshToken };
}

@Resolver()
export class AuthResolver {
  @Mutation(() => AuthPayload)
  async register(@Arg("input") input: RegisterInput): Promise<AuthPayload> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({
      email: input.email.toLowerCase(),
      passwordHash,
      displayName: input.displayName,
    });

    const tokens = generateTokens(user.id, user.role);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    };
  }

  @Mutation(() => AuthPayload)
  async login(@Arg("input") input: LoginInput): Promise<AuthPayload> {
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const tokens = generateTokens(user.id, user.role);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    };
  }

  @Mutation(() => AuthPayload)
  async refreshToken(@Arg("token") token: string): Promise<AuthPayload> {
    let payload: { userId: string; role: string };
    try {
      payload = jwt.verify(token, authConfig.refreshSecret) as typeof payload;
    } catch {
      throw new Error("Invalid refresh token");
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.refreshTokens.includes(token)) {
      throw new Error("Invalid refresh token");
    }

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const tokens = generateTokens(user.id, user.role);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    };
  }

  @Query(() => UserType, { nullable: true })
  async me(@Ctx() ctx: Context): Promise<UserType | null> {
    if (!ctx.userId) return null;
    const user = await User.findById(ctx.userId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}
