import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingInput } from './dto/create-booking.input';
import { BookingStatus } from './dto/booking-status.enum';
import { UsersService } from '../users/users.service';
import { AvailabilityService } from '../availability/availability.service';
import { SlotNotInAvailabilityError } from '../common/errors/slot-not-in-availability.error';
import { SlotTakenError } from '../common/errors/slot-taken.error';
import { SlotBlackedOutError } from '../common/errors/slot-blacked-out.error';
import { isAligned } from '../slots/is-aligned';
import { BlackoutSlot } from '../blackouts/entities/blackout-slot.entity';

@Injectable()
export class BookingsService {
  constructor(
    private readonly users: UsersService,
    private readonly availability: AvailabilityService,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(BlackoutSlot) private readonly blackouts: Repository<BlackoutSlot>,
  ) {}

  async create(input: CreateBookingInput): Promise<Booking> {
    await this.users.findOneOrThrow(input.userId);
    const rules = await this.availability.findForUser(input.userId);
    const durationMin = isAligned(input.startAt, rules);
    if (durationMin === null) throw new SlotNotInAvailabilityError();

    const existingBlackout = await this.blackouts.findOne({
      where: { userId: input.userId, startAt: input.startAt },
    });
    if (existingBlackout) throw new SlotBlackedOutError();

    const endAt = new Date(input.startAt.getTime() + durationMin * 60_000);

    try {
      const result = await this.dataSource.transaction(async (manager) => {
        return manager.getRepository(Booking).insert({
          userId: input.userId,
          startAt: input.startAt,
          endAt,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          status: BookingStatus.CONFIRMED,
        });
      });
      const id = result.identifiers[0].id as string;
      return (await this.bookings.findOne({ where: { id } }))!;
    } catch (err) {
      if (err instanceof QueryFailedError && /UNIQUE constraint failed/i.test(err.message)) {
        throw new SlotTakenError();
      }
      throw err;
    }
  }
}
