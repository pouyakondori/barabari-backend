import { ObjectType, Field, ID } from "type-graphql";
import { LocalizedStringType } from "./CountryType";

@ObjectType()
export class AdminCommentUserType {
  @Field(() => ID)
  id: string;

  @Field()
  displayName: string;

  @Field()
  email: string;
}

@ObjectType()
export class AdminCommentClauseType {
  @Field(() => ID)
  id: string;

  @Field()
  number: number;

  @Field(() => LocalizedStringType)
  text: LocalizedStringType;
}

@ObjectType()
export class AdminCommentType {
  @Field(() => ID)
  id: string;

  @Field()
  text: string;

  @Field(() => AdminCommentUserType)
  user: AdminCommentUserType;

  @Field()
  clauseId: string;

  @Field(() => AdminCommentClauseType, { nullable: true })
  clause?: AdminCommentClauseType;

  @Field({ nullable: true })
  parentId?: string;

  @Field()
  status: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedAdminCommentResult {
  @Field(() => [AdminCommentType])
  items: AdminCommentType[];

  @Field()
  total: number;

  @Field()
  limit: number;

  @Field()
  offset: number;
}

@ObjectType()
export class BulkResult {
  @Field()
  count: number;
}
