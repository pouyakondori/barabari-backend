import { ObjectType, Field, ID, Float, InputType, registerEnumType } from "type-graphql";

@ObjectType()
export class LocalizedStringType {
  @Field()
  fa: string;

  @Field()
  en: string;
}

@ObjectType()
export class AuthorType {
  @Field()
  name: string;

  @Field()
  bio: string;

  @Field({ nullable: true })
  imageUrl?: string;
}

@ObjectType()
export class AmendmentType {
  @Field()
  year: number;

  @Field(() => LocalizedStringType)
  description: LocalizedStringType;
}

@ObjectType()
export class CoordinatesType {
  @Field()
  lat: number;

  @Field()
  lng: number;

  @Field({ nullable: true })
  zoom?: number;
}

@ObjectType()
export class ReligiousCompositionType {
  @Field()
  religion: string;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class CountryType {
  @Field(() => ID)
  id: string;

  @Field()
  slug: string;

  @Field(() => LocalizedStringType)
  name: LocalizedStringType;

  @Field()
  flag: string;

  @Field()
  population: number;

  @Field(() => CoordinatesType)
  coordinates: CoordinatesType;

  @Field(() => LocalizedStringType)
  abstract: LocalizedStringType;

  @Field(() => Float, { nullable: true })
  totalArea?: number;

  @Field({ nullable: true })
  landlocked?: boolean;

  @Field(() => [String], { nullable: true })
  borders?: string[];

  @Field(() => [String], { nullable: true })
  naturalResources?: string[];

  @Field(() => [AuthorType])
  authors: AuthorType[];

  @Field(() => [AmendmentType])
  amendments: AmendmentType[];

  @Field()
  countryCode: string;

  @Field({ nullable: true })
  systemOfGovernment?: string;

  @Field(() => Float, { nullable: true })
  hdi?: number;

  @Field({ nullable: true })
  independenceDate?: string;

  @Field(() => [String], { nullable: true })
  officialLanguages?: string[];

  @Field({ nullable: true })
  gdp?: string;

  @Field({ nullable: true })
  economicType?: string;

  @Field(() => [ReligiousCompositionType], { nullable: true })
  religiousComposition?: ReligiousCompositionType[];

  @Field(() => Float, { nullable: true })
  urbanizationRate?: number;

  @Field(() => Float, { nullable: true })
  corruptionIndex?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
