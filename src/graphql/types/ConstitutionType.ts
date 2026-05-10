import { ObjectType, Field, ID } from "type-graphql";
import { LocalizedStringType } from "./CountryType";

@ObjectType()
export class ConstitutionCountryType {
  @Field(() => ID)
  id: string;

  @Field(() => LocalizedStringType)
  name: LocalizedStringType;

  @Field()
  slug: string;
}

@ObjectType()
export class ConstitutionType {
  @Field(() => ID)
  id: string;

  @Field()
  countryId: string;

  @Field(() => ConstitutionCountryType, { nullable: true })
  country?: ConstitutionCountryType;

  @Field({ nullable: true })
  pdfUrl?: string;

  @Field()
  fullTextUrl: string;

  @Field(() => [ChapterType])
  chapters: ChapterType[];

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ChapterType {
  @Field(() => ID)
  id: string;

  @Field()
  number: number;

  @Field(() => LocalizedStringType)
  title: LocalizedStringType;

  @Field()
  order: number;

  @Field(() => [ArticleType])
  articles: ArticleType[];
}

@ObjectType()
export class ArticleType {
  @Field(() => ID)
  id: string;

  @Field()
  number: number;

  @Field(() => LocalizedStringType, { nullable: true })
  title?: LocalizedStringType;

  @Field()
  order: number;

  @Field(() => [ClauseType])
  clauses: ClauseType[];
}

@ObjectType()
export class ClauseType {
  @Field(() => ID)
  id: string;

  @Field()
  number: number;

  @Field(() => LocalizedStringType)
  text: LocalizedStringType;

  @Field(() => [String])
  topicSlugs: string[];

  @Field()
  agreeCount: number;

  @Field()
  disagreeCount: number;

  @Field()
  order: number;

  @Field()
  countryId: string;

  @Field()
  articleId: string;
}
