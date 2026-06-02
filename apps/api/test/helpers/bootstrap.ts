import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request = require('supertest');
import { AppModule } from '../../src/app.module';
import { User } from '../../src/users/entities/user.entity';
import { Availability } from '../../src/availability/entities/availability.entity';
import { Booking } from '../../src/bookings/entities/booking.entity';
import { BookingStatus } from '../../src/bookings/dto/booking-status.enum';
import { GraphQLExceptionFilter } from '../../src/common/filters/graphql-exception.filter';

export interface TestStack {
  app: INestApplication;
  gql: (query: string, variables?: Record<string, unknown>) => request.Test;
  users: Repository<User>;
  rules: Repository<Availability>;
  bookings: Repository<Booking>;
  close: () => Promise<void>;
}

export async function bootstrapTestApp(): Promise<TestStack> {
  process.env.NODE_ENV = 'test';
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GraphQLExceptionFilter());
  await app.init();

  const http = app.getHttpServer();
  const gql = (query: string, variables: Record<string, unknown> = {}) =>
    request(http).post('/graphql').send({ query, variables });

  return {
    app,
    gql,
    users: moduleRef.get(getRepositoryToken(User)),
    rules: moduleRef.get(getRepositoryToken(Availability)),
    bookings: moduleRef.get(getRepositoryToken(Booking)),
    close: () => app.close(),
  };
}

export async function seedUserWithRule(stack: TestStack): Promise<{ userId: string; mondayAt: (h: number, m: number) => Date }> {
  const user = await stack.users.save(stack.users.create({ name: 'Alice', email: `alice-${Date.now()}@x.test` }));
  await stack.rules.save(stack.rules.create({
    userId: user.id, weekday: 1, startTime: '09:00', endTime: '11:00', slotDurationMinutes: 30,
  }));
  const mondayAt = (h: number, m: number) => new Date(Date.UTC(2026, 5, 1, h, m, 0)); // 2026-06-01 = Monday
  return { userId: user.id, mondayAt };
}

export { BookingStatus };
