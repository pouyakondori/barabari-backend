import mongoose, { Schema, Document, Types } from "mongoose";
import { ILocalizedString } from "./Country";

export interface IChapter extends Document {
  constitutionId: Types.ObjectId;
  number: number;
  title: ILocalizedString;
  order: number;
}

const ChapterSchema = new Schema<IChapter>(
  {
    constitutionId: { type: Schema.Types.ObjectId, ref: "Constitution", required: true },
    number: { type: Number, required: true },
    title: {
      fa: { type: String, required: true },
      en: { type: String, required: true },
    },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

ChapterSchema.index({ constitutionId: 1, order: 1 });

export const Chapter = mongoose.model<IChapter>("Chapter", ChapterSchema);
