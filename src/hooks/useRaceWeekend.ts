import { useState, useEffect, useCallback } from 'react';
import { useWeekendStore } from '../store/weekendStore';
import { api } from '../lib/api';
import type { RaceWeekend } from '../types/schedule';

export function useRaceWeekends() {
  const [weekends, setWeekends] = useState<RaceWeekend[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await api.weekends.list();
      setWeekends(data);
    } catch (err) {
      console.error('Failed to fetch weekends:', err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { weekends, refresh };
}

export function useActiveWeekend() {
  const { activeWeekendId, setActiveWeekendId } = useWeekendStore();
  const { weekends, refresh } = useRaceWeekends();
  const [activeWeekend, setActiveWeekend] = useState<RaceWeekend | undefined>();

  // Auto-select the first weekend if none is active
  useEffect(() => {
    if (!activeWeekendId && weekends.length > 0) {
      setActiveWeekendId(weekends[0].id);
    }
  }, [activeWeekendId, weekends, setActiveWeekendId]);

  // Find active weekend from the fetched list
  useEffect(() => {
    if (activeWeekendId) {
      const found = weekends.find((w) => w.id === activeWeekendId);
      setActiveWeekend(found);
    } else {
      setActiveWeekend(undefined);
    }
  }, [activeWeekendId, weekends]);

  return { activeWeekend, weekends, activeWeekendId, setActiveWeekendId, refresh };
}
