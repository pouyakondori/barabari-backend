import { Resolver, Query, Mutation, Arg, Authorized, ID, Int } from "type-graphql";
import {
  AdminCommentType,
  PaginatedAdminCommentResult,
  BulkResult,
} from "../types/AdminCommentType";
import { Comment } from "../../models/Comment";
import { User } from "../../models/User";
import { Clause } from "../../models/Clause";

async function mapAdminComment(doc: any): Promise<AdminCommentType> {
  const user = await User.findById(doc.userId).select("displayName email").lean();
  const clause = await Clause.findById(doc.clauseId).select("number text").lean();

  return {
    id: doc._id.toString(),
    text: doc.content,
    user: user
      ? { id: user._id.toString(), displayName: user.displayName, email: user.email }
      : { id: doc.userId.toString(), displayName: "Unknown", email: "" },
    clauseId: doc.clauseId.toString(),
    clause: clause
      ? { id: clause._id.toString(), number: clause.number, text: clause.text }
      : undefined,
    parentId: doc.parentId?.toString(),
    status: doc.isDeleted ? "deleted" : doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

@Resolver()
export class AdminCommentResolver {
  @Authorized("admin")
  @Query(() => PaginatedAdminCommentResult)
  async adminComments(
    @Arg("clauseId", () => ID, { nullable: true }) clauseId?: string,
    @Arg("userId", () => ID, { nullable: true }) userId?: string,
    @Arg("status", { nullable: true }) status?: string,
    @Arg("search", { nullable: true }) search?: string,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 }) limit?: number,
    @Arg("offset", () => Int, { nullable: true, defaultValue: 0 }) offset?: number
  ): Promise<PaginatedAdminCommentResult> {
    const filter: any = {};

    if (clauseId) filter.clauseId = clauseId;
    if (userId) filter.userId = userId;
    if (status === "deleted") {
      filter.isDeleted = true;
    } else if (status) {
      filter.status = status;
      filter.isDeleted = false;
    }
    if (search) {
      filter.content = { $regex: search, $options: "i" };
    }

    const [docs, total] = await Promise.all([
      Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset ?? 0)
        .limit(limit ?? 20)
        .lean(),
      Comment.countDocuments(filter),
    ]);

    const items = await Promise.all(docs.map(mapAdminComment));

    return {
      items,
      total,
      limit: limit ?? 20,
      offset: offset ?? 0,
    };
  }

  @Authorized("admin")
  @Query(() => Int)
  async adminPendingCommentCount(): Promise<number> {
    return Comment.countDocuments({ status: "pending", isDeleted: false });
  }

  @Authorized("admin")
  @Mutation(() => AdminCommentType)
  async adminApproveComment(@Arg("id", () => ID) id: string): Promise<AdminCommentType> {
    const doc = await Comment.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    ).lean();
    if (!doc) throw new Error("Comment not found");
    return mapAdminComment(doc);
  }

  @Authorized("admin")
  @Mutation(() => AdminCommentType)
  async adminRejectComment(@Arg("id", () => ID) id: string): Promise<AdminCommentType> {
    const doc = await Comment.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    ).lean();
    if (!doc) throw new Error("Comment not found");
    return mapAdminComment(doc);
  }

  @Authorized("admin")
  @Mutation(() => AdminCommentType)
  async adminDeleteComment(@Arg("id", () => ID) id: string): Promise<AdminCommentType> {
    const doc = await Comment.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).lean();
    if (!doc) throw new Error("Comment not found");
    return mapAdminComment(doc);
  }

  @Authorized("admin")
  @Mutation(() => AdminCommentType)
  async adminRestoreComment(@Arg("id", () => ID) id: string): Promise<AdminCommentType> {
    const doc = await Comment.findByIdAndUpdate(
      id,
      { isDeleted: false, status: "approved" },
      { new: true }
    ).lean();
    if (!doc) throw new Error("Comment not found");
    return mapAdminComment(doc);
  }

  @Authorized("admin")
  @Mutation(() => BulkResult)
  async adminBulkApproveComments(
    @Arg("ids", () => [ID]) ids: string[]
  ): Promise<BulkResult> {
    const result = await Comment.updateMany(
      { _id: { $in: ids } },
      { status: "approved" }
    );
    return { count: result.modifiedCount };
  }

  @Authorized("admin")
  @Mutation(() => BulkResult)
  async adminBulkRejectComments(
    @Arg("ids", () => [ID]) ids: string[]
  ): Promise<BulkResult> {
    const result = await Comment.updateMany(
      { _id: { $in: ids } },
      { status: "rejected" }
    );
    return { count: result.modifiedCount };
  }

  @Authorized("admin")
  @Mutation(() => BulkResult)
  async adminBulkDeleteComments(
    @Arg("ids", () => [ID]) ids: string[]
  ): Promise<BulkResult> {
    const result = await Comment.updateMany(
      { _id: { $in: ids } },
      { isDeleted: true }
    );
    return { count: result.modifiedCount };
  }
}
