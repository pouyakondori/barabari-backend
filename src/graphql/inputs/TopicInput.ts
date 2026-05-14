import { InputType, Field } from "type-graphql";
import { LocalizedStringInput } from "./CountryInput";

@InputType()
export class CreateTopicInput {
  @Field(() => LocalizedStringInput)
  name: LocalizedStringInput;

  @Field()
  slug: string;

  @Field(() => LocalizedStringInput)
  description: LocalizedStringInput;

  @Field()
  category: string;

  @Field()
  order: number;
}

@InputType()
export class UpdateTopicInput {
  @Field(() => LocalizedStringInput, { nullable: true })
  name?: LocalizedStringInput;

  @Field({ nullable: true })
  slug?: string;

  @Field(() => LocalizedStringInput, { nullable: true })
  description?: LocalizedStringInput;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  order?: number;
}
