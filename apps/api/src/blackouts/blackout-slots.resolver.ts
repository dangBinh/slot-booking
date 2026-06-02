import { Resolver, Query, Mutation, Args, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { BlackoutSlot } from './entities/blackout-slot.entity';
import { BlackoutSlotsService } from './blackout-slots.service';
import { CreateBlackoutInput } from './dto/create-blackout.input';
import { DeletedId } from '../availability/dto/deleted-id.model';

@Resolver(() => BlackoutSlot)
export class BlackoutSlotsResolver {
  constructor(private readonly service: BlackoutSlotsService) {}

  @Query(() => [BlackoutSlot])
  blackoutSlots(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('from', { type: () => GraphQLISODateTime }) from: Date,
    @Args('to', { type: () => GraphQLISODateTime }) to: Date,
  ): Promise<BlackoutSlot[]> {
    return this.service.findInRange(userId, from, to);
  }

  @Mutation(() => BlackoutSlot)
  createBlackout(@Args('input') input: CreateBlackoutInput): Promise<BlackoutSlot> {
    return this.service.create(input);
  }

  @Mutation(() => DeletedId)
  deleteBlackout(@Args('id', { type: () => ID }) id: string): Promise<DeletedId> {
    return this.service.delete(id);
  }
}
