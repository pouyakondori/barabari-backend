import mongoose, { Schema, Document, Types } from "mongoose";
import { ILocalizedString } from "./Country";

export interface IClause extends Document {
  articleId: Types.ObjectId;
  countryId: Types.ObjectId;
  number: number;
  text: ILocalizedString;
  topicSlugs: string[];
  agreeCount: number;
  disagreeCount: number;
  order: number;
}

const ClauseSchema = new Schema<IClause>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true },
    countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true },
    number: { type: Number, required: true },
    text: {
      fa: { type: String, required: true },
      en: { type: String, required: true },
    },
    topicSlugs: { type: [String], default: [] },
    agreeCount: { type: Number, default: 0 },
    disagreeCount: { type: Number, default: 0 },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

ClauseSchema.index({ articleId: 1, order: 1 });
ClauseSchema.index({ countryId: 1, topicSlugs: 1 });
ClauseSchema.index({ topicSlugs: 1 });

export const Clause = mongoose.model<IClause>("Clause", ClauseSchema);
