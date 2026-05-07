import { ObjectType, Field, ID } from "type-graphql";

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

  @Field()
  createdAt: Date;
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
