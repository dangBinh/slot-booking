import { BookingsService } from './bookings.service';
import { SlotNotInAvailabilityError } from '../common/errors/slot-not-in-availability.error';
import { UserNotFoundError } from '../common/errors/user-not-found.error';
import { BookingStatus } from './dto/booking-status.enum';

const USER = 'user-1';

const rule = (weekday: number, startTime: string, endTime: string, slotDurationMinutes = 30) =>
  ({ userId: USER, weekday, startTime, endTime, slotDurationMinutes });

function build(opts: {
  rules?: any[];
  userExists?: boolean;
  insert?: jest.Mock;
}) {
  const users = { findOneOrThrow: jest.fn().mockImplementation(async (id: string) => {
    if (opts.userExists === false) throw new UserNotFoundError(id);
    return { id, name: 'Alice', email: 'a@x' };
  }) };
  const availability = { findForUser: jest.fn().mockResolvedValue(opts.rules ?? []) };
  const dataSource = {
    transaction: jest.fn().mockImplementation(async (cb: any) => cb({
      getRepository: () => ({ insert: opts.insert ?? jest.fn() }),
    })),
  };
  const repo = { findOne: jest.fn().mockResolvedValue({ id: 'b-1' }) };
  const blackouts = { findOne: jest.fn().mockResolvedValue(null) };
  // @ts-expect-error duck-typing for unit test
  return new BookingsService(users, availability, dataSource, repo, blackouts);
}

describe('BookingsService.create', () => {
  // 2026-06-01 is a Monday
  it('throws USER_NOT_FOUND when the provider is missing', async () => {
    const svc = build({ userExists: false });
    await expect(svc.create({
      userId: USER, startAt: new Date('2026-06-01T09:00:00.000Z'),
      customerName: 'Bob', customerEmail: 'bob@x',
    })).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('throws SLOT_NOT_IN_AVAILABILITY when startAt is off the grid', async () => {
    const svc = build({ rules: [rule(1, '09:00', '10:00', 30)] });
    await expect(svc.create({
      userId: USER, startAt: new Date('2026-06-01T09:15:00.000Z'),
      customerName: 'Bob', customerEmail: 'bob@x',
    })).rejects.toBeInstanceOf(SlotNotInAvailabilityError);
  });

  it('throws SLOT_NOT_IN_AVAILABILITY when the weekday has no rule', async () => {
    const svc = build({ rules: [rule(2, '09:00', '10:00', 30)] }); // Tuesday rule only
    await expect(svc.create({
      userId: USER, startAt: new Date('2026-06-01T09:00:00.000Z'), // Monday
      customerName: 'Bob', customerEmail: 'bob@x',
    })).rejects.toBeInstanceOf(SlotNotInAvailabilityError);
  });

  it('inserts a booking with status CONFIRMED when the slot is valid', async () => {
    const insert = jest.fn().mockResolvedValue({ identifiers: [{ id: 'b-1' }] });
    const svc = build({ rules: [rule(1, '09:00', '10:00', 30)], insert });
    await svc.create({
      userId: USER, startAt: new Date('2026-06-01T09:00:00.000Z'),
      customerName: 'Bob', customerEmail: 'bob@x',
    });
    expect(insert).toHaveBeenCalledTimes(1);
    const arg = insert.mock.calls[0][0];
    expect(arg.userId).toBe(USER);
    expect(arg.startAt.toISOString()).toBe('2026-06-01T09:00:00.000Z');
    expect(arg.endAt.toISOString()).toBe('2026-06-01T09:30:00.000Z');
    expect(arg.status).toBe(BookingStatus.CONFIRMED);
  });
});
