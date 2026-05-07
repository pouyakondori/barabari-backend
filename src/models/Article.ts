import mongoose, { Schema, Document, Types } from "mongoose";
import { ILocalizedString } from "./Country";

export interface IArticle extends Document {
  chapterId: Types.ObjectId;
  number: number;
  title?: ILocalizedString;
  order: number;
}

const ArticleSchema = new Schema<IArticle>(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    number: { type: Number, required: true },
    title: {
      fa: { type: String },
      en: { type: String },
    },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

ArticleSchema.index({ chapterId: 1, order: 1 });

export const Article = mongoose.model<IArticle>("Article", ArticleSchema);
