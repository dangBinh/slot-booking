export interface Slot {
  userId: string;
  start: string; // ISO
  end: string;   // ISO
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
}

/** Group slots by their UTC date (YYYY-MM-DD). Returns a Map preserving insertion order. */
export function groupSlotsByDay(slots: Slot[]): Map<string, Slot[]> {
  const out = new Map<string, Slot[]>();
  for (const s of slots) {
    const day = s.start.slice(0, 10);
    const bucket = out.get(day);
    if (bucket) bucket.push(s);
    else out.set(day, [s]);
  }
  return out;
}
