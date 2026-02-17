import { parseISO, addDays, setHours, setMinutes } from 'date-fns';
import type { DayOfWeek } from '../types/schedule';

const DAY_OFFSET: Record<DayOfWeek, number> = {
  thursday: 0,
  friday: 1,
  saturday: 2,
  sunday: 3,
};

/**
 * Convert a DayOfWeek + HH:mm time into an absolute Date
 * based on the weekend's start date (which should be the Thursday).
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
