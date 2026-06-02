import { SlotStatus } from './dto/slot-status.enum';

export interface AvailabilityRule {
  userId: string;
  weekday: number; // 0-6, Sun=0
  startTime: string; // 'HH:MM'
  endTime: string;   // 'HH:MM'
  slotDurationMinutes: number;
}

export interface ExistingBooking {
  userId: string;
  startAt: Date;
}

export interface ComputeArgs {
  userId: string;
  rules: AvailabilityRule[];
  bookings: ExistingBooking[];   // confirmed bookings
  blackouts: ExistingBooking[];  // blackout slots
  from: Date;
  to: Date; // exclusive
}

export interface ComputedSlot {
  userId: string;
  start: Date;
  end: Date;
  status: SlotStatus;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseHHMM(value: string): { hours: number; minutes: number } {
  const [h, m] = value.split(':').map(Number);
  return { hours: h, minutes: m };
}

function* daysInRange(from: Date, to: Date): Generator<Date> {
  const start = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
  for (let t = start.getTime(); t < end.getTime(); t += MS_PER_DAY) {
    yield new Date(t);
  }
}

export function computeSlots(args: ComputeArgs): ComputedSlot[] {
  const { userId, rules, bookings, blackouts, from, to } = args;
  if (rules.length === 0) return [];

  const booked = new Set(bookings.filter(b => b.userId === userId).map(b => b.startAt.getTime()));
  const blocked = new Set(blackouts.filter(b => b.userId === userId).map(b => b.startAt.getTime()));

  const out: ComputedSlot[] = [];

  for (const day of daysInRange(from, to)) {
    const dayRules = rules.filter(r => r.userId === userId && r.weekday === day.getUTCDay());
    for (const r of dayRules) {
      const { hours: sH, minutes: sM } = parseHHMM(r.startTime);
      const { hours: eH, minutes: eM } = parseHHMM(r.endTime);
      const startMs = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), sH, sM);
      const endMs   = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), eH, eM);
      const step = r.slotDurationMinutes * 60 * 1000;
      for (let t = startMs; t + step <= endMs; t += step) {
        let status: SlotStatus = SlotStatus.AVAILABLE;
        if (booked.has(t)) status = SlotStatus.BOOKED;
        else if (blocked.has(t)) status = SlotStatus.BLOCKED;
        out.push({ userId, start: new Date(t), end: new Date(t + step), status });
      }
    }
  }

  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}
