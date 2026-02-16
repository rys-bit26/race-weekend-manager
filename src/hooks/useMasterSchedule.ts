import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { MasterScheduleEvent, DayOfWeek } from '../types/schedule';

export function useMasterSchedule(weekendId: string | null, day?: DayOfWeek) {
  const [events, setEvents] = useState<MasterScheduleEvent[]>([]);

  const refresh = useCallback(async () => {
    if (!weekendId) {
      setEvents([]);
      return;
    }
    try {
      let data = await api.masterEvents.list(weekendId);
      if (day) {
        data = data.filter((e) => e.day === day);
      }
      data.sort((a, b) => a.startTime.localeCompare(b.startTime));
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch master events:', err);
    }
  }, [weekendId, day]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { events, refresh };
}
