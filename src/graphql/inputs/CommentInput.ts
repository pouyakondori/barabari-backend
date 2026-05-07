import { InputType, Field, ID } from "type-graphql";
import { MinLength } from "class-validator";

@InputType()
export class CreateCommentInput {
  @Field(() => ID)
  clauseId: string;

  @Field()
  @MinLength(1)
  content: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;
}
