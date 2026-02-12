import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useWeekendStore } from '../store/weekendStore';
import { useEffect } from 'react';

export function useRaceWeekends() {
  return useLiveQuery(() => db.raceWeekends.toArray(), [], []);
}

export function useActiveWeekend() {
  const { activeWeekendId, setActiveWeekendId } = useWeekendStore();

  const weekends = useRaceWeekends();

  // Auto-select the first weekend if none is active
  useEffect(() => {
    if (!activeWeekendId && weekends.length > 0) {
      setActiveWeekendId(weekends[0].id);
    }
  }, [activeWeekendId, weekends, setActiveWeekendId]);

  const activeWeekend = useLiveQuery(
    () => (activeWeekendId ? db.raceWeekends.get(activeWeekendId) : undefined),
    [activeWeekendId]
  );

  return { activeWeekend, weekends, activeWeekendId, setActiveWeekendId };
}
