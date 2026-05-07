import mongoose, { Schema, Document, Types } from "mongoose";
import { ILocalizedString } from "./Country";

export interface IPodcast extends Document {
  title: ILocalizedString;
  description: ILocalizedString;
  audioUrl: string;
  coverImageUrl?: string;
  countryId?: Types.ObjectId;
  topicSlug?: string;
  duration: number;
  publishedAt: Date;
  createdAt: Date;
}

const PodcastSchema = new Schema<IPodcast>(
  {
    title: {
      fa: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      fa: { type: String, required: true },
      en: { type: String, required: true },
    },
    audioUrl: { type: String, required: true },
    coverImageUrl: { type: String },
    countryId: { type: Schema.Types.ObjectId, ref: "Country" },
    topicSlug: { type: String },
    duration: { type: Number, required: true },
    publishedAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PodcastSchema.index({ countryId: 1 });
PodcastSchema.index({ topicSlug: 1 });

export const Podcast = mongoose.model<IPodcast>("Podcast", PodcastSchema);
