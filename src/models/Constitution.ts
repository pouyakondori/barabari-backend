import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConstitution extends Document {
  countryId: Types.ObjectId;
  fullTextUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConstitutionSchema = new Schema<IConstitution>(
  {
    countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true },
    fullTextUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

ConstitutionSchema.index({ countryId: 1 });

export const Constitution = mongoose.model<IConstitution>("Constitution", ConstitutionSchema);
