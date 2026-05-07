import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVote extends Document {
  clauseId: Types.ObjectId;
  userId: Types.ObjectId;
  type: "agree" | "disagree";
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    clauseId: { type: Schema.Types.ObjectId, ref: "Clause", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["agree", "disagree"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VoteSchema.index({ clauseId: 1, userId: 1 }, { unique: true });
VoteSchema.index({ clauseId: 1 });

export const Vote = mongoose.model<IVote>("Vote", VoteSchema);
