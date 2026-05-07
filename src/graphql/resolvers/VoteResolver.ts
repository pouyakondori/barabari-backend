import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from "type-graphql";
import { VoteResponseType } from "../types/VoteType";
import { VoteInput } from "../inputs/VoteInput";
import { Vote } from "../../models/Vote";
import { Clause } from "../../models/Clause";
import { Context } from "../middleware/authChecker";

@Resolver()
export class VoteResolver {
  @Authorized()
  @Mutation(() => VoteResponseType)
  async castVote(
    @Arg("input") input: VoteInput,
    @Ctx() ctx: Context
  ): Promise<VoteResponseType> {
    if (!["agree", "disagree"].includes(input.type)) {
      throw new Error('Vote type must be "agree" or "disagree"');
    }

    const existing = await Vote.findOne({
      clauseId: input.clauseId,
      userId: ctx.userId,
    });

    if (existing) {
      if (existing.type === input.type) {
        throw new Error("You already voted this way");
      }
      // Change vote: decrement old, increment new
      const oldField = existing.type === "agree" ? "agreeCount" : "disagreeCount";
      const newField = input.type === "agree" ? "agreeCount" : "disagreeCount";
      await Clause.findByIdAndUpdate(input.clauseId, {
        $inc: { [oldField]: -1, [newField]: 1 },
      });
      existing.type = input.type as "agree" | "disagree";
      await existing.save();

      return {
        id: existing.id,
        clauseId: existing.clauseId.toString(),
        userId: existing.userId.toString(),
        type: existing.type,
        createdAt: existing.createdAt,
      };
    }

    // New vote
    const vote = await Vote.create({
      clauseId: input.clauseId,
      userId: ctx.userId,
      type: input.type,
    });

    const field = input.type === "agree" ? "agreeCount" : "disagreeCount";
    await Clause.findByIdAndUpdate(input.clauseId, { $inc: { [field]: 1 } });

    return {
      id: vote.id,
      clauseId: vote.clauseId.toString(),
      userId: vote.userId.toString(),
      type: vote.type,
      createdAt: vote.createdAt,
    };
  }

  @Authorized()
  @Mutation(() => Boolean)
  async removeVote(
    @Arg("clauseId") clauseId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const vote = await Vote.findOneAndDelete({
      clauseId,
      userId: ctx.userId,
    });

    if (!vote) {
      throw new Error("Vote not found");
    }

    const field = vote.type === "agree" ? "agreeCount" : "disagreeCount";
    await Clause.findByIdAndUpdate(clauseId, { $inc: { [field]: -1 } });

    return true;
  }

  @Authorized()
  @Query(() => [VoteResponseType])
  async myVotes(
    @Arg("clauseIds", () => [String]) clauseIds: string[],
    @Ctx() ctx: Context
  ): Promise<VoteResponseType[]> {
    const votes = await Vote.find({
      clauseId: { $in: clauseIds },
      userId: ctx.userId,
    }).lean();

    return votes.map((v) => ({
      id: v._id.toString(),
      clauseId: v.clauseId.toString(),
      userId: v.userId.toString(),
      type: v.type,
      createdAt: v.createdAt,
    }));
  }
}
