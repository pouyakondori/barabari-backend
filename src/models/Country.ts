import mongoose, { Schema, Document } from "mongoose";

export interface ILocalizedString {
  fa: string;
  en: string;
}

export interface IAuthor {
  name: ILocalizedString;
  bio: ILocalizedString;
  imageUrl?: string;
}

export interface IAmendment {
  year: number;
  description: ILocalizedString;
}

export interface IReligiousComposition {
  religion: string;
  percentage: number;
}

export interface ICountry extends Document {
  slug: string;
  name: ILocalizedString;
  flag: string;
  population: number;
  coordinates: { lat: number; lng: number; zoom?: number };
  abstract: ILocalizedString;
  totalArea?: number;
  landlocked?: boolean;
  borders?: string[];
  naturalResources?: string[];
  authors: IAuthor[];
  amendments: IAmendment[];
  countryCode: string;
  systemOfGovernment?: string;
  hdi?: number;
  independenceDate?: string;
  officialLanguages?: string[];
  gdp?: string;
  economicType?: string;
  religiousComposition?: IReligiousComposition[];
  urbanizationRate?: number;
  corruptionIndex?: number;
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
    name: { type: LocalizedStringSchema, required: true },
    bio: { type: LocalizedStringSchema, required: true },
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

const ReligiousCompositionSchema = new Schema<IReligiousComposition>(
  {
    religion: { type: String, required: true },
    percentage: { type: Number, required: true },
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
      zoom: { type: Number },
    },
    abstract: { type: LocalizedStringSchema, required: true },
    totalArea: { type: Number },
    landlocked: { type: Boolean, default: false },
    borders: { type: [String], default: [] },
    naturalResources: { type: [String], default: [] },
    authors: { type: [AuthorSchema], default: [] },
    amendments: { type: [AmendmentSchema], default: [] },
    countryCode: { type: String, required: true, uppercase: true },
    systemOfGovernment: { type: String },
    hdi: { type: Number },
    independenceDate: { type: String },
    officialLanguages: { type: [String], default: [] },
    gdp: { type: String },
    economicType: { type: String },
    religiousComposition: { type: [ReligiousCompositionSchema], default: [] },
    urbanizationRate: { type: Number },
    corruptionIndex: { type: Number },
  },
  { timestamps: true }
);

CountrySchema.index({ slug: 1 });
CountrySchema.index({ "name.fa": "text", "name.en": "text" });

export const Country = mongoose.model<ICountry>("Country", CountrySchema);
