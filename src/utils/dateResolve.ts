import { parseISO, addDays, setHours, setMinutes } from 'date-fns';
import type { DayOfWeek } from '../types/schedule';

const DAY_OFFSET: Record<DayOfWeek, number> = {
  wednesday: 0,
  thursday: 1,
  friday: 2,
  saturday: 3,
  sunday: 4,
};

/**
 * Convert a DayOfWeek + HH:mm time into an absolute Date
 * based on the weekend's start date (which should be the Wednesday).
 */
export function resolveActivityDate(
  weekendStartDate: string,
  day: DayOfWeek,
  time: string
): Date {
  const base = parseISO(weekendStartDate);
  const dayDate = addDays(base, DAY_OFFSET[day]);
  const [h, m] = time.split(':').map(Number);
  return setMinutes(setHours(dayDate, h), m);
}
