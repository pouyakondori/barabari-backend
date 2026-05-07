import { Resolver, Query, Mutation, Arg, Ctx, Authorized, Int } from "type-graphql";
import { CommentType } from "../types/CommentType";
import { CreateCommentInput } from "../inputs/CommentInput";
import { Comment } from "../../models/Comment";
import { User } from "../../models/User";
import { Context } from "../middleware/authChecker";

@Resolver()
export class CommentResolver {
  @Query(() => [CommentType])
  async comments(
    @Arg("clauseId") clauseId: string,
    @Arg("limit", () => Int, { defaultValue: 50 }) limit: number,
    @Arg("offset", () => Int, { defaultValue: 0 }) offset: number,
    @Ctx() ctx: Context
  ): Promise<CommentType[]> {
    const cappedLimit = Math.min(limit, 100);

    // Build query: approved + non-deleted, plus the current user's pending comments
    const orConditions: any[] = [
      { clauseId, status: "approved", isDeleted: false },
    ];
    if (ctx.userId) {
      orConditions.push({
        clauseId,
        userId: ctx.userId,
        status: "pending",
        isDeleted: false,
      });
    }

    const docs = await Comment.find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(cappedLimit)
      .lean();

    const userIds = [...new Set(docs.map((d) => d.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } })
      .select("displayName")
      .lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u.displayName]));

    return docs.map((d) => ({
      id: d._id.toString(),
      clauseId: d.clauseId.toString(),
      userId: d.userId.toString(),
      userName: userMap.get(d.userId.toString()) || "Unknown",
      content: d.isDeleted ? "[removed]" : d.content,
      parentId: d.parentId?.toString(),
      status: d.status,
      isDeleted: d.isDeleted,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  }

  @Authorized()
  @Mutation(() => CommentType)
  async createComment(
    @Arg("input") input: CreateCommentInput,
    @Ctx() ctx: Context
  ): Promise<CommentType> {
    const user = await User.findById(ctx.userId).lean();
    if (!user) throw new Error("User not found");

    const comment = await Comment.create({
      clauseId: input.clauseId,
      userId: ctx.userId,
      content: input.content,
      parentId: input.parentId,
      status: "pending",
    });

    return {
      id: comment.id,
      clauseId: comment.clauseId.toString(),
      userId: comment.userId.toString(),
      userName: user.displayName,
      content: comment.content,
      parentId: comment.parentId?.toString(),
      status: comment.status,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  @Authorized()
  @Mutation(() => CommentType)
  async updateComment(
    @Arg("id") id: string,
    @Arg("content") content: string,
    @Ctx() ctx: Context
  ): Promise<CommentType> {
    const comment = await Comment.findById(id);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId.toString() !== ctx.userId) {
      throw new Error("Not authorized to edit this comment");
    }

    comment.content = content;
    comment.status = "pending"; // Reset to pending for re-approval
    await comment.save();

    const user = await User.findById(ctx.userId).lean();

    return {
      id: comment.id,
      clauseId: comment.clauseId.toString(),
      userId: comment.userId.toString(),
      userName: user?.displayName || "Unknown",
      content: comment.content,
      parentId: comment.parentId?.toString(),
      status: comment.status,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteComment(
    @Arg("id") id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const comment = await Comment.findById(id);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId.toString() !== ctx.userId) {
      throw new Error("Not authorized to delete this comment");
    }

    comment.isDeleted = true;
    await comment.save();
    return true;
  }
}
