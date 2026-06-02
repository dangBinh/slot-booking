import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AvailabilityService } from '../availability/availability.service';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingStatus } from '../bookings/dto/booking-status.enum';
import { BlackoutSlotsService } from '../blackouts/blackout-slots.service';
import { computeSlots, type ComputedSlot } from './slot.compute';

@Injectable()
export class SlotsService {
  constructor(
    private readonly availability: AvailabilityService,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    private readonly blackouts: BlackoutSlotsService,
  ) {}

  async slots(userId: string, from: Date, to: Date): Promise<ComputedSlot[]> {
    const rules = await this.availability.findForUser(userId);
    const confirmedBookings = await this.bookings.find({
      where: { userId, status: BookingStatus.CONFIRMED, startAt: Between(from, to) },
    });
    const blackouts = await this.blackouts.findInRange(userId, from, to);
    return computeSlots({
      userId,
      rules,
      bookings: confirmedBookings.map(b => ({ userId: b.userId, startAt: b.startAt })),
      blackouts: blackouts.map(b => ({ userId: b.userId, startAt: b.startAt })),
      from,
      to,
    });
  }
}
