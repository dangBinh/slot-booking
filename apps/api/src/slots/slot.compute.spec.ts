import { computeSlots, type AvailabilityRule, type ExistingBooking } from './slot.compute';

const USER = 'user-1';

const rule = (
  weekday: number,
  startTime: string,
  endTime: string,
  slotDurationMinutes = 30,
): AvailabilityRule => ({ userId: USER, weekday, startTime, endTime, slotDurationMinutes });

const booking = (iso: string): ExistingBooking => ({ userId: USER, startAt: new Date(iso) });

describe('computeSlots', () => {
  // 2026-06-01 is a Monday (weekday 1)
  const MON = '2026-06-01';
  const TUE = '2026-06-02';

  it('returns empty when there are no rules', () => {
    const slots = computeSlots({
      userId: USER, rules: [], bookings: [], blackouts: [],
      from: new Date(`${MON}T00:00:00Z`), to: new Date(`${TUE}T00:00:00Z`),
    });
    expect(slots).toEqual([]);
  });

  it('expands a single rule into the slot grid (no bookings)', () => {
    const slots = computeSlots({
      userId: USER,
      rules: [rule(1, '09:00', '11:00', 30)],
      bookings: [],
      blackouts: [],
      from: new Date(`${MON}T00:00:00Z`),
      to: new Date(`${TUE}T00:00:00Z`),
    });
    expect(slots.map(s => s.start.toISOString())).toEqual([
      `${MON}T09:00:00.000Z`,
      `${MON}T09:30:00.000Z`,
      `${MON}T10:00:00.000Z`,
      `${MON}T10:30:00.000Z`,
    ]);
    expect(slots[0].end.toISOString()).toBe(`${MON}T09:30:00.000Z`);
  });

  it('marks the slot as BOOKED when an existing booking sits in the window', () => {
    const slots = computeSlots({
      userId: USER,
      rules: [rule(1, '09:00', '11:00', 30)],
      bookings: [booking(`${MON}T10:00:00.000Z`)],
      blackouts: [],
      from: new Date(`${MON}T00:00:00Z`),
      to: new Date(`${TUE}T00:00:00Z`),
    });
    expect(slots.map(s => ({ start: s.start.toISOString(), status: s.status }))).toEqual([
      { start: `${MON}T09:00:00.000Z`, status: 'AVAILABLE' },
      { start: `${MON}T09:30:00.000Z`, status: 'AVAILABLE' },
      { start: `${MON}T10:00:00.000Z`, status: 'BOOKED' },
      { start: `${MON}T10:30:00.000Z`, status: 'AVAILABLE' },
    ]);
  });

  it('marks the first slot as BOOKED when a booking sits at window start', () => {
    const slots = computeSlots({
      userId: USER,
      rules: [rule(1, '09:00', '10:00', 30)],
      bookings: [booking(`${MON}T09:00:00.000Z`)],
      blackouts: [],
      from: new Date(`${MON}T00:00:00Z`),
      to: new Date(`${TUE}T00:00:00Z`),
    });
    expect(slots.map(s => ({ start: s.start.toISOString(), status: s.status }))).toEqual([
      { start: `${MON}T09:00:00.000Z`, status: 'BOOKED' },
      { start: `${MON}T09:30:00.000Z`, status: 'AVAILABLE' },
    ]);
  });

  it('marks the slot as BLOCKED when a blackout sits in the window', () => {
    const slots = computeSlots({
      userId: USER,
      rules: [rule(1, '09:00', '10:00', 30)],
      bookings: [],
      blackouts: [booking(`${MON}T09:00:00.000Z`)],
      from: new Date(`${MON}T00:00:00Z`),
      to: new Date(`${TUE}T00:00:00Z`),
    });
    expect(slots.map(s => ({ start: s.start.toISOString(), status: s.status }))).toEqual([
      { start: `${MON}T09:00:00.000Z`, status: 'BLOCKED' },
      { start: `${MON}T09:30:00.000Z`, status: 'AVAILABLE' },
    ]);
  });

  it('handles a multi-day range with different rules per weekday', () => {
    const WED = '2026-06-03';
    const slots = computeSlots({
      userId: USER,
      rules: [
        rule(1, '09:00', '10:00', 30), // Mon
        rule(2, '14:00', '15:00', 30), // Tue
      ],
      bookings: [],
      blackouts: [],
      from: new Date(`${MON}T00:00:00Z`),
      to: new Date(`${WED}T00:00:00Z`),
    });
    expect(slots.map(s => s.start.toISOString())).toEqual([
      `${MON}T09:00:00.000Z`,
      `${MON}T09:30:00.000Z`,
      `${TUE}T14:00:00.000Z`,
      `${TUE}T14:30:00.000Z`,
    ]);
  });

  it('merges two non-overlapping rules on the same weekday', () => {
    const slots = computeSlots({
      userId: USER,
      rules: [
        rule(1, '09:00', '10:00', 30),
        rule(1, '13:00', '14:00', 30),
      ],
      bookings: [],
      blackouts: [],
      from: new Date(`${MON}T00:00:00Z`),
      to: new Date(`${TUE}T00:00:00Z`),
    });
    expect(slots.map(s => s.start.toISOString())).toEqual([
      `${MON}T09:00:00.000Z`,
      `${MON}T09:30:00.000Z`,
      `${MON}T13:00:00.000Z`,
      `${MON}T13:30:00.000Z`,
    ]);
  });

  it('returns empty when the range falls entirely outside any rule weekday', () => {
    const SAT = '2026-06-06';
    const SUN = '2026-06-07';
    const slots = computeSlots({
      userId: USER,
      rules: [rule(1, '09:00', '11:00', 30)], // Monday only
      bookings: [],
      blackouts: [],
      from: new Date(`${SAT}T00:00:00Z`),
      to: new Date(`${SUN}T00:00:00Z`),
    });
    expect(slots).toEqual([]);
  });
});
