import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class VoteResponseType {
  @Field(() => ID)
  id: string;

  @Field()
  clauseId: string;

  @Field()
  userId: string;

  @Field()
  type: string;

  @Field()
  createdAt: Date;
}
