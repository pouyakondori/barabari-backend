import { ObjectType, Field, ID } from "type-graphql";
import { LocalizedStringType } from "./CountryType";

@ObjectType()
export class TopicType {
  @Field(() => ID)
  id: string;

  @Field()
  slug: string;

  @Field(() => LocalizedStringType)
  name: LocalizedStringType;

  @Field()
  category: string;

  @Field(() => LocalizedStringType)
  description: LocalizedStringType;

  @Field()
  order: number;

  @Field({ nullable: true })
  clauseCount?: number;
}

@ObjectType()
export class PaginatedTopicResult {
  @Field(() => [TopicType])
  items: TopicType[];

  @Field()
  total: number;

  @Field()
  limit: number;

  @Field()
  offset: number;
}
