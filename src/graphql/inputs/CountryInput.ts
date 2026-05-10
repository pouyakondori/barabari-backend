import { InputType, Field, Float } from "type-graphql";
import { MinLength, IsOptional, Min, Max } from "class-validator";

@InputType()
export class LocalizedStringInput {
  @Field()
  fa: string;

  @Field()
  en: string;
}

@InputType()
export class CoordinatesInput {
  @Field()
  lat: number;

  @Field()
  lng: number;

  @Field({ nullable: true })
  @IsOptional()
  zoom?: number;
}

@InputType()
export class AuthorInput {
  @Field()
  @MinLength(1)
  name: string;

  @Field()
  bio: string;

  @Field({ nullable: true })
  imageUrl?: string;
}

@InputType()
export class AmendmentInput {
  @Field()
  year: number;

  @Field(() => LocalizedStringInput)
  description: LocalizedStringInput;
}

@InputType()
export class ReligiousCompositionInput {
  @Field()
  religion: string;

  @Field(() => Float)
  @Min(0)
  @Max(100)
  percentage: number;
}

@InputType()
export class CountryInput {
  @Field(() => LocalizedStringInput)
  name: LocalizedStringInput;

  @Field()
  @MinLength(1)
  slug: string;

  @Field()
  flag: string;

  @Field(() => LocalizedStringInput)
  abstract: LocalizedStringInput;

  @Field()
  population: number;

  @Field()
  countryCode: string;

  @Field(() => CoordinatesInput)
  coordinates: CoordinatesInput;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  totalArea?: number;

  @Field({ nullable: true })
  @IsOptional()
  landlocked?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  borders?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  naturalResources?: string[];

  @Field({ nullable: true })
  @IsOptional()
  podcastUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  videoUrl?: string;

  @Field(() => [AuthorInput], { nullable: true })
  @IsOptional()
  authors?: AuthorInput[];

  @Field(() => [AmendmentInput], { nullable: true })
  @IsOptional()
  amendments?: AmendmentInput[];

  @Field({ nullable: true })
  @IsOptional()
  systemOfGovernment?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  @Max(1)
  hdi?: number;

  @Field({ nullable: true })
  @IsOptional()
  independenceDate?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  officialLanguages?: string[];

  @Field({ nullable: true })
  @IsOptional()
  gdp?: string;

  @Field({ nullable: true })
  @IsOptional()
  economicType?: string;

  @Field(() => [ReligiousCompositionInput], { nullable: true })
  @IsOptional()
  religiousComposition?: ReligiousCompositionInput[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  @Max(100)
  urbanizationRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  @Max(100)
  corruptionIndex?: number;
}
