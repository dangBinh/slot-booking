import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityModule } from '../availability/availability.module';
import { BlackoutSlotsModule } from '../blackouts/blackout-slots.module';
import { Booking } from '../bookings/entities/booking.entity';
import { SlotsService } from './slots.service';
import { SlotsResolver } from './slots.resolver';

@Module({
  imports: [AvailabilityModule, TypeOrmModule.forFeature([Booking]), BlackoutSlotsModule],
  providers: [SlotsService, SlotsResolver],
  exports: [SlotsService],
})
export class SlotsModule {}
