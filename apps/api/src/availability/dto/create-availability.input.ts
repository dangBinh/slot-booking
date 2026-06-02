import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsUUID, IsInt, Min, Max, Matches } from 'class-validator';

@InputType()
export class CreateAvailabilityInput {
  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number;

  @Field()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be HH:MM' })
  startTime: string;

  @Field()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be HH:MM' })
  endTime: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  slotDurationMinutes: number;
}
