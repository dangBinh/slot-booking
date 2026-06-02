import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlackoutSlot } from './entities/blackout-slot.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BlackoutSlotsService } from './blackout-slots.service';
import { BlackoutSlotsResolver } from './blackout-slots.resolver';
import { UsersModule } from '../users/users.module';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlackoutSlot, Booking]),
    UsersModule,
    AvailabilityModule,
  ],
  providers: [BlackoutSlotsService, BlackoutSlotsResolver],
  exports: [BlackoutSlotsService],
})
export class BlackoutSlotsModule {}
