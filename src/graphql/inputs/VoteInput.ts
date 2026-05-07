import { InputType, Field, ID } from "type-graphql";

@InputType()
export class VoteInput {
  @Field(() => ID)
  clauseId: string;

  @Field()
  type: string; // "agree" | "disagree"
}
