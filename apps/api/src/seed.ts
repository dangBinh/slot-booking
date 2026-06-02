import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { User } from './users/entities/user.entity';
import { Availability } from './availability/entities/availability.entity';
import { Booking } from './bookings/entities/booking.entity';
import { BookingStatus } from './bookings/dto/booking-status.enum';
import { BlackoutSlot } from './blackouts/entities/blackout-slot.entity';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  const users = app.get<Repository<User>>(getRepositoryToken(User));
  const rules = app.get<Repository<Availability>>(getRepositoryToken(Availability));
  const bookings = app.get<Repository<Booking>>(getRepositoryToken(Booking));
  const blackouts = app.get<Repository<BlackoutSlot>>(getRepositoryToken(BlackoutSlot));

  await blackouts.clear();
  await bookings.clear();
  await rules.clear();
  await users.clear();

  const alice = await users.save(users.create({ name: 'Alice (Demo Coach)', email: 'alice@example.com' }));

  // Mon-Fri, 09:00-12:00 and 13:00-17:00, 30-minute slots
  const weekdays = [1, 2, 3, 4, 5];
  const windows: Array<[string, string]> = [['09:00', '12:00'], ['13:00', '17:00']];
  for (const w of weekdays) {
    for (const [start, end] of windows) {
      await rules.save(rules.create({ userId: alice.id, weekday: w, startTime: start, endTime: end, slotDurationMinutes: 30 }));
    }
  }

  // Pre-book a couple of slots on the next upcoming Monday at 10:00 and 14:00
  const next = nextWeekday(1);
  const at = (h: number, m: number) => {
    const d = new Date(next);
    d.setUTCHours(h, m, 0, 0);
    return d;
  };
  for (const slot of [at(10, 0), at(14, 0)]) {
    await bookings.save(bookings.create({
      userId: alice.id,
      startAt: slot,
      endAt: new Date(slot.getTime() + 30 * 60_000),
      customerName: 'Pre-Seeded',
      customerEmail: 'seed@example.com',
      status: BookingStatus.CONFIRMED,
    }));
  }

  console.log(`Seeded user ${alice.id} (${alice.email}) with rules + 2 pre-bookings on ${next.toISOString().slice(0, 10)}.`);
  await app.close();
}

function nextWeekday(target: number): Date {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  while (d.getUTCDay() !== target) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

run().catch(err => { console.error(err); process.exit(1); });
