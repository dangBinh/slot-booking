export interface AlignmentRule {
  weekday: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

/**
 * Returns the slot duration (minutes) if `startAt` aligns to one of the rules' grids
 * for that UTC weekday, else null.
 */
export function isAligned(startAt: Date, rules: AlignmentRule[]): number | null {
  const weekday = startAt.getUTCDay();
  const dayRules = rules.filter(r => r.weekday === weekday);
  for (const r of dayRules) {
    const [sH, sM] = r.startTime.split(':').map(Number);
    const [eH, eM] = r.endTime.split(':').map(Number);
    const dayStart = Date.UTC(startAt.getUTCFullYear(), startAt.getUTCMonth(), startAt.getUTCDate(), sH, sM);
    const dayEnd   = Date.UTC(startAt.getUTCFullYear(), startAt.getUTCMonth(), startAt.getUTCDate(), eH, eM);
    const t = startAt.getTime();
    if (t < dayStart || t + r.slotDurationMinutes * 60_000 > dayEnd) continue;
    const offsetMin = (t - dayStart) / 60_000;
    if (offsetMin % r.slotDurationMinutes !== 0) continue;
    return r.slotDurationMinutes;
  }
  return null;
}
