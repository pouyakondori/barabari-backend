import { ObjectType, Field, ID, registerEnumType } from "type-graphql";

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

  @Field(() => [AuthorType])
  authors: AuthorType[];

  @Field(() => [AmendmentType])
  amendments: AmendmentType[];

  @Field({ nullable: true })
  podcastUrl?: string;

  @Field({ nullable: true })
  videoUrl?: string;

  @Field()
  countryCode: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
