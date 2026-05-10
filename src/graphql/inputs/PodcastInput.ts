import { InputType, Field, ID } from "type-graphql";
import { LocalizedStringInput } from "./CountryInput";

@InputType()
export class CreatePodcastInput {
  @Field(() => LocalizedStringInput)
  title: LocalizedStringInput;

  @Field(() => LocalizedStringInput)
  description: LocalizedStringInput;

  @Field()
  audioUrl: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => ID, { nullable: true })
  countryId?: string;

  @Field(() => ID, { nullable: true })
  topicId?: string;

  @Field()
  duration: number;

  @Field()
  publishedAt: string;
}

@InputType()
export class UpdatePodcastInput {
  @Field(() => LocalizedStringInput, { nullable: true })
  title?: LocalizedStringInput;

  @Field(() => LocalizedStringInput, { nullable: true })
  description?: LocalizedStringInput;

  @Field({ nullable: true })
  audioUrl?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => ID, { nullable: true })
  countryId?: string;

  @Field(() => ID, { nullable: true })
  topicId?: string;

  @Field({ nullable: true })
  duration?: number;

  @Field({ nullable: true })
  publishedAt?: string;
}
