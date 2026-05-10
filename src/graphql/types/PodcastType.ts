import { ObjectType, Field, ID, Float } from "type-graphql";
import { LocalizedStringType } from "./CountryType";

@ObjectType()
export class PodcastCountryType {
  @Field(() => ID)
  id: string;

  @Field(() => LocalizedStringType)
  name: LocalizedStringType;
}

@ObjectType()
export class PodcastTopicType {
  @Field(() => ID)
  id: string;

  @Field(() => LocalizedStringType)
  name: LocalizedStringType;
}

@ObjectType()
export class PodcastType {
  @Field(() => ID)
  id: string;

  @Field(() => LocalizedStringType)
  title: LocalizedStringType;

  @Field(() => LocalizedStringType)
  description: LocalizedStringType;

  @Field()
  audioUrl: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => PodcastCountryType, { nullable: true })
  country?: PodcastCountryType;

  @Field(() => PodcastTopicType, { nullable: true })
  topic?: PodcastTopicType;

  @Field()
  duration: number;

  @Field()
  publishedAt: string;
}

@ObjectType()
export class PaginatedPodcastResult {
  @Field(() => [PodcastType])
  items: PodcastType[];

  @Field()
  total: number;

  @Field()
  limit: number;

  @Field()
  offset: number;
}
