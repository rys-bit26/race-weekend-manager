import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { DayOfWeek } from '../types/schedule';

export function useMasterSchedule(weekendId: string | null, day?: DayOfWeek) {
  const events = useLiveQuery(
    () => {
      if (!weekendId) return [];
      return db.masterEvents
        .where('weekendId')
        .equals(weekendId)
        .toArray()
        .then((items) => (day ? items.filter((e) => e.day === day) : items))
        .then((items) => items.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    },
    [weekendId, day],
    []
  );

  return { events };
}
