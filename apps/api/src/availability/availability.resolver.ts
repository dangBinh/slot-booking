import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Availability } from './entities/availability.entity';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityInput } from './dto/create-availability.input';
import { DeletedId } from './dto/deleted-id.model';

@Resolver(() => Availability)
export class AvailabilityResolver {
  constructor(private readonly service: AvailabilityService) {}

  @Query(() => [Availability])
  availabilityRules(@Args('userId', { type: () => ID }) userId: string): Promise<Availability[]> {
    return this.service.findForUser(userId);
  }

  @Mutation(() => Availability)
  createAvailability(@Args('input') input: CreateAvailabilityInput): Promise<Availability> {
    return this.service.create(input);
  }

  @Mutation(() => DeletedId)
  deleteAvailability(@Args('id', { type: () => ID }) id: string): Promise<DeletedId> {
    return this.service.delete(id);
  }
}
