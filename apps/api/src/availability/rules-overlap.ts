export interface TimeWindow {
  startTime: string; // 'HH:MM'
  endTime: string;   // 'HH:MM'
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** True when two windows overlap. Touching at boundary (a.end === b.start) is NOT overlap. */
export function rulesOverlap(a: TimeWindow, b: TimeWindow): boolean {
  const aStart = toMinutes(a.startTime);
  const aEnd = toMinutes(a.endTime);
  const bStart = toMinutes(b.startTime);
  const bEnd = toMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}
