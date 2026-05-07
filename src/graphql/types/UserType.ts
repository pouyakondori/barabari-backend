import { ObjectType, Field, ID, Int } from "type-graphql";

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  displayName: string;

  @Field()
  role: string;

  @Field()
  isVerified: boolean;

  @Field({ defaultValue: false })
  isBanned: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class PaginatedUsers {
  @Field(() => [UserType])
  items: UserType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  offset: number;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserType)
  user: UserType;
}
