import mongoose, { Schema, Document } from "mongoose";
import { ILocalizedString } from "./Country";

export interface ITopic extends Document {
  slug: string;
  name: ILocalizedString;
  category: string;
  description: ILocalizedString;
  order: number;
}

const TopicSchema = new Schema<ITopic>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: {
      fa: { type: String, required: true },
      en: { type: String, required: true },
    },
    category: { type: String, required: true },
    description: {
      fa: { type: String, required: true },
      en: { type: String, required: true },
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TopicSchema.index({ slug: 1 });
TopicSchema.index({ category: 1, order: 1 });

export const Topic = mongoose.model<ITopic>("Topic", TopicSchema);
