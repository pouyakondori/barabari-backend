import mongoose, { Schema, Document } from "mongoose";

export interface ILocalizedString {
  fa: string;
  en: string;
}

export interface IAuthor {
  name: string;
  bio: string;
  imageUrl?: string;
}

export interface IAmendment {
  year: number;
  description: ILocalizedString;
}

export interface ICountry extends Document {
  slug: string;
  name: ILocalizedString;
  flag: string;
  population: number;
  coordinates: { lat: number; lng: number };
  abstract: ILocalizedString;
  authors: IAuthor[];
  amendments: IAmendment[];
  podcastUrl?: string;
  videoUrl?: string;
  countryCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocalizedStringSchema = new Schema<ILocalizedString>(
  {
    fa: { type: String, required: true },
    en: { type: String, required: true },
  },
  { _id: false }
);

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true },
    bio: { type: String, required: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const AmendmentSchema = new Schema<IAmendment>(
  {
    year: { type: Number, required: true },
    description: { type: LocalizedStringSchema, required: true },
  },
  { _id: false }
);

const CountrySchema = new Schema<ICountry>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: LocalizedStringSchema, required: true },
    flag: { type: String, required: true },
    population: { type: Number, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    abstract: { type: LocalizedStringSchema, required: true },
    authors: { type: [AuthorSchema], default: [] },
    amendments: { type: [AmendmentSchema], default: [] },
    podcastUrl: { type: String },
    videoUrl: { type: String },
    countryCode: { type: String, required: true, uppercase: true },
  },
  { timestamps: true }
);

CountrySchema.index({ slug: 1 });
CountrySchema.index({ "name.fa": "text", "name.en": "text" });

export const Country = mongoose.model<ICountry>("Country", CountrySchema);
