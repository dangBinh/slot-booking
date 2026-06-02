import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { CreateBookingInput } from './dto/create-booking.input';

@Resolver(() => Booking)
export class BookingsResolver {
  constructor(private readonly bookings: BookingsService) {}

  @Mutation(() => Booking)
  createBooking(@Args('input') input: CreateBookingInput): Promise<Booking> {
    return this.bookings.create(input);
  }
}
