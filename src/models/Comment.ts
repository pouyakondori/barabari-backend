import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  clauseId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  parentId?: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    clauseId: { type: Schema.Types.ObjectId, ref: "Clause", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ clauseId: 1, status: 1 });
CommentSchema.index({ userId: 1 });

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
