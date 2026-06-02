import { isAligned } from './is-aligned';

const rule = (weekday: number, startTime: string, endTime: string, slotDurationMinutes = 30) =>
  ({ weekday, startTime, endTime, slotDurationMinutes });

describe('isAligned', () => {
  // 2026-06-01 is a Monday (weekday 1)
  const MON = '2026-06-01';

  it('returns the duration when startAt aligns to a rule grid', () => {
    expect(isAligned(new Date(`${MON}T09:00:00.000Z`), [rule(1, '09:00', '11:00', 30)])).toBe(30);
    expect(isAligned(new Date(`${MON}T10:30:00.000Z`), [rule(1, '09:00', '11:00', 30)])).toBe(30);
  });

  it('returns null when weekday has no rule', () => {
    expect(isAligned(new Date(`${MON}T09:00:00.000Z`), [rule(2, '09:00', '11:00', 30)])).toBeNull();
  });

  it('returns null when startAt is between grid points', () => {
    expect(isAligned(new Date(`${MON}T09:15:00.000Z`), [rule(1, '09:00', '11:00', 30)])).toBeNull();
  });

  it('returns null when startAt is before the rule window', () => {
    expect(isAligned(new Date(`${MON}T08:00:00.000Z`), [rule(1, '09:00', '11:00', 30)])).toBeNull();
  });

  it('returns null when slot would extend past the rule end', () => {
    expect(isAligned(new Date(`${MON}T10:30:00.000Z`), [rule(1, '09:00', '11:00', 30)])).toBe(30);
    expect(isAligned(new Date(`${MON}T09:30:00.000Z`), [rule(1, '09:00', '09:30', 30)])).toBeNull();
  });

  it('returns the matching duration when multiple non-overlapping rules exist', () => {
    expect(isAligned(new Date(`${MON}T13:30:00.000Z`), [
      rule(1, '09:00', '10:00', 30),
      rule(1, '13:00', '14:00', 30),
    ])).toBe(30);
  });
});
