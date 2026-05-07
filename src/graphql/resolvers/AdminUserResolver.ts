import { Resolver, Query, Mutation, Arg, Authorized, Int, ID } from "type-graphql";
import { UserType, PaginatedUsers } from "../types/UserType";
import { User } from "../../models/User";

@Resolver()
export class AdminUserResolver {
  @Authorized("admin")
  @Query(() => PaginatedUsers)
  async adminUsers(
    @Arg("search", { nullable: true }) search: string,
    @Arg("role", { nullable: true }) role: string,
    @Arg("status", { nullable: true }) status: string,
    @Arg("limit", () => Int, { defaultValue: 20 }) limit: number,
    @Arg("offset", () => Int, { defaultValue: 0 }) offset: number
  ): Promise<PaginatedUsers> {
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
      ];
    }
    if (role && role !== "all") {
      filter.role = role;
    }
    if (status === "banned") {
      filter.isBanned = true;
    } else if (status === "active") {
      filter.isBanned = { $ne: true };
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      items: users.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        isVerified: u.isVerified,
        isBanned: u.isBanned ?? false,
        createdAt: u.createdAt,
      })),
      total,
      limit,
      offset,
    };
  }

  @Authorized("admin")
  @Query(() => UserType, { nullable: true })
  async adminUser(@Arg("id", () => ID) id: string): Promise<UserType | null> {
    const user = await User.findById(id);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      isVerified: user.isVerified,
      isBanned: user.isBanned ?? false,
      createdAt: user.createdAt,
    };
  }

  @Authorized("admin")
  @Mutation(() => Boolean)
  async adminBanUser(@Arg("id", () => ID) id: string): Promise<boolean> {
    await User.findByIdAndUpdate(id, { isBanned: true });
    return true;
  }

  @Authorized("admin")
  @Mutation(() => Boolean)
  async adminUnbanUser(@Arg("id", () => ID) id: string): Promise<boolean> {
    await User.findByIdAndUpdate(id, { isBanned: false });
    return true;
  }

  @Authorized("admin")
  @Mutation(() => Boolean)
  async adminDeleteUser(@Arg("id", () => ID) id: string): Promise<boolean> {
    await User.findByIdAndDelete(id);
    return true;
  }

  @Authorized("admin")
  @Mutation(() => Boolean)
  async adminUpdateUser(
    @Arg("id", () => ID) id: string,
    @Arg("role", { nullable: true }) role: string,
    @Arg("isVerified", { nullable: true }) isVerified: boolean
  ): Promise<boolean> {
    const update: Record<string, unknown> = {};
    if (role) update.role = role;
    if (isVerified !== undefined && isVerified !== null) update.isVerified = isVerified;
    await User.findByIdAndUpdate(id, update);
    return true;
  }
}
