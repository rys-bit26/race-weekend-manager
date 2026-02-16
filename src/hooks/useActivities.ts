import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Activity, DepartmentId, ActivityStatus } from '../types/activity';
import type { DayOfWeek } from '../types/schedule';

export function useActivities(weekendId: string | null, day?: DayOfWeek) {
  const [activities, setActivities] = useState<Activity[]>([]);

  const refresh = useCallback(async () => {
    if (!weekendId) {
      setActivities([]);
      return;
    }
    try {
      let data = await api.activities.list(weekendId);
      if (day) {
        data = data.filter((a) => a.day === day);
      }
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  }, [weekendId, day]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addActivity = useCallback(
    async (data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!weekendId) return;
      const { weekendId: _wid, ...rest } = data as Activity;
      const activity = await api.activities.create(weekendId, rest);
      await refresh();
      return activity;
    },
    [weekendId, refresh]
  );

  const updateActivity = useCallback(
    async (id: string, changes: Partial<Activity>) => {
      await api.activities.update(id, changes);
      await refresh();
    },
    [refresh]
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      await api.activities.delete(id);
      await refresh();
    },
    [refresh]
  );

  const toggleStatus = useCallback(
    async (id: string) => {
      const activity = activities.find((a) => a.id === id);
      if (activity) {
        const newStatus: ActivityStatus =
          activity.status === 'pending' ? 'confirmed' : 'pending';
        await api.activities.update(id, { status: newStatus });
        await refresh();
      }
    },
    [activities, refresh]
  );

  return { activities, addActivity, updateActivity, deleteActivity, toggleStatus, refresh };
}

export function filterActivities(
  activities: Activity[],
  filters: {
    departments: DepartmentId[];
    personIds: string[];
    statuses: ActivityStatus[];
    location: string;
  }
): Activity[] {
  let result = activities;

  if (filters.departments.length > 0) {
    result = result.filter((a) =>
      a.departmentIds.some((d) => filters.departments.includes(d))
    );
  }

  if (filters.personIds.length > 0) {
    result = result.filter((a) =>
      a.personIds.some((p) => filters.personIds.includes(p))
    );
  }

  if (filters.statuses.length > 0) {
    result = result.filter((a) => filters.statuses.includes(a.status));
  }

  if (filters.location) {
    const loc = filters.location.toLowerCase();
    result = result.filter((a) => a.location.toLowerCase().includes(loc));
  }

  return result.sort((a, b) => a.startTime.localeCompare(b.startTime));
}
