import { InputType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { IsDate, IsEmail, IsUUID, IsString, MinLength, MaxLength } from 'class-validator';

@InputType()
export class CreateBookingInput {
  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  startAt: Date;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  customerName: string;

  @Field()
  @IsEmail()
  customerEmail: string;
}
