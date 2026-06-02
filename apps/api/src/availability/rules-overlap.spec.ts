import { rulesOverlap } from './rules-overlap';

const w = (startTime: string, endTime: string) => ({ startTime, endTime });

describe('rulesOverlap', () => {
  it('returns false for disjoint windows', () => {
    expect(rulesOverlap(w('09:00', '10:00'), w('13:00', '14:00'))).toBe(false);
  });

  it('returns true when b starts inside a', () => {
    expect(rulesOverlap(w('09:00', '11:00'), w('10:00', '12:00'))).toBe(true);
  });

  it('returns true when b ends inside a', () => {
    expect(rulesOverlap(w('10:00', '12:00'), w('09:00', '11:00'))).toBe(true);
  });

  it('returns true when a is fully inside b', () => {
    expect(rulesOverlap(w('09:30', '10:30'), w('09:00', '11:00'))).toBe(true);
  });

  it('returns true when b is fully inside a', () => {
    expect(rulesOverlap(w('09:00', '11:00'), w('09:30', '10:30'))).toBe(true);
  });

  it('returns false when windows touch at boundary', () => {
    expect(rulesOverlap(w('09:00', '10:00'), w('10:00', '11:00'))).toBe(false);
    expect(rulesOverlap(w('10:00', '11:00'), w('09:00', '10:00'))).toBe(false);
  });

  it('returns true for identical windows', () => {
    expect(rulesOverlap(w('09:00', '10:00'), w('09:00', '10:00'))).toBe(true);
  });
});
