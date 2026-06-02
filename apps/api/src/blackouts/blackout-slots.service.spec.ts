import { BlackoutSlotsService } from './blackout-slots.service';
import { UserNotFoundError } from '../common/errors/user-not-found.error';
import { SlotNotInAvailabilityError } from '../common/errors/slot-not-in-availability.error';
import { SlotTakenError } from '../common/errors/slot-taken.error';

const USER = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const MON_9 = new Date('2026-06-01T09:00:00.000Z'); // Monday 09:00
const rule = (weekday: number, startTime: string, endTime: string, slotDurationMinutes = 30) =>
  ({ userId: USER, weekday, startTime, endTime, slotDurationMinutes });

function build(opts: {
  userExists?: boolean;
  rules?: any[];
  bookingAtStart?: boolean;
  insert?: jest.Mock;
} = {}) {
  const users = { findOneOrThrow: jest.fn().mockImplementation(async (id: string) => {
    if (opts.userExists === false) throw new UserNotFoundError(id);
    return { id, name: 'A', email: 'a@x' };
  }) };
  const availability = { findForUser: jest.fn().mockResolvedValue(opts.rules ?? []) };
  const bookingsRepo: any = {
    findOne: jest.fn().mockResolvedValue(opts.bookingAtStart ? { id: 'b1' } : null),
  };
  const blackoutsRepo: any = {
    create: jest.fn().mockImplementation(r => r),
    save: opts.insert ?? jest.fn().mockImplementation(async r => ({ id: 'new-blackout', ...r })),
    findOne: jest.fn().mockResolvedValue({ id: 'bk1' }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  // @ts-ignore duck-typing for unit test
  return { svc: new BlackoutSlotsService(users, availability, bookingsRepo, blackoutsRepo), users, availability, bookingsRepo, blackoutsRepo };
}

describe('BlackoutSlotsService.create', () => {
  it('throws USER_NOT_FOUND when the provider does not exist', async () => {
    const { svc } = build({ userExists: false });
    await expect(svc.create({ userId: USER, startAt: MON_9 })).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('throws SLOT_NOT_IN_AVAILABILITY when startAt is off-grid', async () => {
    const { svc } = build({ rules: [rule(1, '09:00', '10:00', 30)] });
    const off = new Date('2026-06-01T09:15:00.000Z');
    await expect(svc.create({ userId: USER, startAt: off })).rejects.toBeInstanceOf(SlotNotInAvailabilityError);
  });

  it('throws SLOT_TAKEN when a confirmed booking already occupies the slot', async () => {
    const { svc } = build({ rules: [rule(1, '09:00', '10:00', 30)], bookingAtStart: true });
    await expect(svc.create({ userId: USER, startAt: MON_9 })).rejects.toBeInstanceOf(SlotTakenError);
  });

  it('inserts when valid; endAt = startAt + duration', async () => {
    const save = jest.fn().mockImplementation(async r => ({ id: 'new-blackout', ...r }));
    const { svc, blackoutsRepo } = build({ rules: [rule(1, '09:00', '10:00', 30)], insert: save });
    const result = await svc.create({ userId: USER, startAt: MON_9 });
    expect(save).toHaveBeenCalledTimes(1);
    const arg = save.mock.calls[0][0];
    expect(arg.userId).toBe(USER);
    expect(arg.startAt.toISOString()).toBe('2026-06-01T09:00:00.000Z');
    expect(arg.endAt.toISOString()).toBe('2026-06-01T09:30:00.000Z');
    expect(result.id).toBe('new-blackout');
    expect(blackoutsRepo.findOne).not.toHaveBeenCalled();
  });
});

describe('BlackoutSlotsService.delete', () => {
  it('returns the id when the blackout existed', async () => {
    const { svc, blackoutsRepo } = build();
    const result = await svc.delete('bk1');
    expect(blackoutsRepo.delete).toHaveBeenCalledWith('bk1');
    expect(result).toEqual({ id: 'bk1' });
  });
});
