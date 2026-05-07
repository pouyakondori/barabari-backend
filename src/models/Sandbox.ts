import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISandbox extends Document {
  userId: Types.ObjectId;
  title: string;
  clauseIds: Types.ObjectId[];
  shareSlug: string;
  createdAt: Date;
  updatedAt: Date;
}

const SandboxSchema = new Schema<ISandbox>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    clauseIds: [{ type: Schema.Types.ObjectId, ref: "Clause" }],
    shareSlug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

SandboxSchema.index({ userId: 1 });
SandboxSchema.index({ shareSlug: 1 });

export const Sandbox = mongoose.model<ISandbox>("Sandbox", SandboxSchema);
