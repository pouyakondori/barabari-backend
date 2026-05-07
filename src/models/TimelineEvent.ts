import mongoose, { Schema, Document, Types } from "mongoose";
import { ILocalizedString } from "./Country";

export interface ITimelineEvent extends Document {
  countryId: Types.ObjectId;
  date: string;
  title: ILocalizedString;
  description: ILocalizedString;
  order: number;
}

const TimelineEventSchema = new Schema<ITimelineEvent>(
  {
    countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true },
    date: { type: String, required: true },
    title: {
      fa: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      fa: { type: String, required: true },
      en: { type: String, required: true },
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TimelineEventSchema.index({ countryId: 1, order: 1 });

export const TimelineEvent = mongoose.model<ITimelineEvent>("TimelineEvent", TimelineEventSchema);
