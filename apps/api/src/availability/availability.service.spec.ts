import { AvailabilityService } from './availability.service';
import { AvailabilityInvalidError } from '../common/errors/availability-invalid.error';
import { AvailabilityOverlapError } from '../common/errors/availability-overlap.error';

const USER = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const existing = (startTime: string, endTime: string) =>
  ({ id: 'r1', userId: USER, weekday: 1, startTime, endTime, slotDurationMinutes: 30 });

function build(opts: { existing?: any[] } = {}) {
  const repo: any = {
    find: jest.fn().mockResolvedValue(opts.existing ?? []),
    save: jest.fn().mockImplementation(async (r) => ({ id: 'new-id', ...r })),
    create: jest.fn().mockImplementation((r) => r),
    findOne: jest.fn().mockResolvedValue({ id: 'r1' }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  // @ts-ignore duck-typing for unit test
  return { svc: new AvailabilityService(repo), repo };
}

const validInput = {
  userId: USER, weekday: 1, startTime: '09:00', endTime: '10:00', slotDurationMinutes: 30,
};

describe('AvailabilityService.create', () => {
  it('throws AvailabilityInvalidError when weekday > 6', async () => {
    const { svc } = build();
    await expect(svc.create({ ...validInput, weekday: 7 })).rejects.toBeInstanceOf(AvailabilityInvalidError);
  });

  it('throws AvailabilityInvalidError when endTime <= startTime', async () => {
    const { svc } = build();
    await expect(svc.create({ ...validInput, startTime: '10:00', endTime: '10:00' })).rejects.toBeInstanceOf(AvailabilityInvalidError);
  });

  it('throws AvailabilityInvalidError when duration does not evenly divide the window', async () => {
    const { svc } = build();
    await expect(svc.create({ ...validInput, startTime: '09:00', endTime: '09:45', slotDurationMinutes: 30 })).rejects.toBeInstanceOf(AvailabilityInvalidError);
  });

  it('throws AvailabilityOverlapError when an existing rule overlaps', async () => {
    const { svc } = build({ existing: [existing('09:30', '11:00')] });
    await expect(svc.create(validInput)).rejects.toBeInstanceOf(AvailabilityOverlapError);
  });

  it('inserts when valid + non-overlapping', async () => {
    const { svc, repo } = build({ existing: [existing('13:00', '14:00')] });
    const result = await svc.create(validInput);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('new-id');
  });
});

describe('AvailabilityService.delete', () => {
  it('returns the id when the rule existed', async () => {
    const { svc, repo } = build();
    const result = await svc.delete('r1');
    expect(repo.delete).toHaveBeenCalledWith('r1');
    expect(result).toEqual({ id: 'r1' });
  });
});
