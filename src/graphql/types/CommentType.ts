import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class CommentType {
  @Field(() => ID)
  id: string;

  @Field()
  clauseId: string;

  @Field()
  userId: string;

  @Field()
  userName: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field()
  status: string;

  @Field()
  isDeleted: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
