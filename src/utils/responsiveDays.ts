import { DAYS } from './constants';
import type { DayOfWeek } from '../types/schedule';

/**
 * Returns 3 days centered on the active day for tablet (768-1024px) layouts.
 * Wed → Wed/Thu/Fri, Thu → Wed/Thu/Fri, Fri → Thu/Fri/Sat,
 * Sat → Fri/Sat/Sun, Sun → Fri/Sat/Sun
 */
export function getVisibleDaysForTablet(activeDay: DayOfWeek) {
  const idx = DAYS.findIndex((d) => d.id === activeDay);
  const start = Math.max(0, Math.min(idx - 1, DAYS.length - 3));
  return DAYS.slice(start, start + 3);
}
