import { ObjectType, Field, ID } from '@nestjs/graphql';
import { SlotStatus } from './slot-status.enum';

@ObjectType()
export class Slot {
  @Field(() => ID)
  userId: string;

  @Field()
  start: Date;

  @Field()
  end: Date;

  @Field(() => SlotStatus)
  status: SlotStatus;
}
