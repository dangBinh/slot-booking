import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { BlackoutSlot } from './entities/blackout-slot.entity';
import { CreateBlackoutInput } from './dto/create-blackout.input';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingStatus } from '../bookings/dto/booking-status.enum';
import { UsersService } from '../users/users.service';
import { AvailabilityService } from '../availability/availability.service';
import { isAligned } from '../slots/is-aligned';
import { SlotNotInAvailabilityError } from '../common/errors/slot-not-in-availability.error';
import { SlotTakenError } from '../common/errors/slot-taken.error';

@Injectable()
export class BlackoutSlotsService {
  constructor(
    private readonly users: UsersService,
    private readonly availability: AvailabilityService,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(BlackoutSlot) private readonly repo: Repository<BlackoutSlot>,
  ) {}

  findInRange(userId: string, from: Date, to: Date): Promise<BlackoutSlot[]> {
    return this.repo
      .createQueryBuilder('b')
      .where('b.userId = :userId', { userId })
      .andWhere('b.startAt >= :from', { from })
      .andWhere('b.startAt < :to', { to })
      .orderBy('b.startAt', 'ASC')
      .getMany();
  }

  async create(input: CreateBlackoutInput): Promise<BlackoutSlot> {
    await this.users.findOneOrThrow(input.userId);
    const rules = await this.availability.findForUser(input.userId);
    const durationMin = isAligned(input.startAt, rules);
    if (durationMin === null) throw new SlotNotInAvailabilityError();

    const existingBooking = await this.bookings.findOne({
      where: { userId: input.userId, startAt: input.startAt, status: BookingStatus.CONFIRMED },
    });
    if (existingBooking) throw new SlotTakenError();

    const endAt = new Date(input.startAt.getTime() + durationMin * 60_000);

    try {
      const entity = this.repo.create({ userId: input.userId, startAt: input.startAt, endAt });
      return await this.repo.save(entity);
    } catch (err) {
      if (err instanceof QueryFailedError && /UNIQUE constraint failed/i.test(err.message)) {
        throw new SlotTakenError();
      }
      throw err;
    }
  }

  async delete(id: string): Promise<{ id: string }> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Blackout ${id} not found`);
    await this.repo.delete(id);
    return { id };
  }
}
