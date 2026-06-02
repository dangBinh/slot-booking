import { InputType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { IsUUID, IsDate } from 'class-validator';

@InputType()
export class CreateBlackoutInput {
  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  startAt: Date;
}
