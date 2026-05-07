import { ObjectType, Field, ID } from "type-graphql";
import { LocalizedStringType } from "./CountryType";

@ObjectType()
export class TimelineEventType {
  @Field(() => ID)
  id: string;

  @Field()
  countryId: string;

  @Field()
  date: string;

  @Field(() => LocalizedStringType)
  title: LocalizedStringType;

  @Field(() => LocalizedStringType)
  description: LocalizedStringType;

  @Field()
  order: number;
}
