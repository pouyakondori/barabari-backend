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
}
