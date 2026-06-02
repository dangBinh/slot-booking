import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Availability } from '../availability/entities/availability.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BlackoutSlot } from '../blackouts/entities/blackout-slot.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isTest = process.env.NODE_ENV === 'test';
        return {
          type: 'better-sqlite3',
          database: isTest ? ':memory:' : config.get<string>('DATABASE_PATH') ?? 'dev.sqlite',
          entities: [User, Availability, Booking, BlackoutSlot],
          synchronize: true,
          dropSchema: isTest,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
