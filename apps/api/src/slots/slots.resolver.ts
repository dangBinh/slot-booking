import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Slot } from './dto/slot.model';
import { SlotsService } from './slots.service';

@Resolver(() => Slot)
export class SlotsResolver {
  constructor(private readonly slotsService: SlotsService) {}

  @Query(() => [Slot])
  async slots(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('from', { type: () => GraphQLISODateTime }) from: Date,
    @Args('to', { type: () => GraphQLISODateTime }) to: Date,
  ): Promise<Slot[]> {
    const computed = await this.slotsService.slots(userId, from, to);
    return computed.map(s => Object.assign(new Slot(), s));
  }
}
