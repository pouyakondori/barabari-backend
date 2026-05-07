import { InputType, Field } from "type-graphql";
import { IsEmail, MinLength } from "class-validator";

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(8)
  password: string;

  @Field()
  @MinLength(2)
  displayName: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;
}
