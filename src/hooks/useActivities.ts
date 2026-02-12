import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { generateId } from '../utils/id';
import type { Activity, DepartmentId, ActivityStatus } from '../types/activity';
import type { DayOfWeek } from '../types/schedule';

export function useActivities(weekendId: string | null, day?: DayOfWeek) {
  const activities = useLiveQuery(
    () => {
      if (!weekendId) return [];
      let query = db.activities.where('weekendId').equals(weekendId);
      return query.toArray().then((items) =>
        day ? items.filter((a) => a.day === day) : items
      );
    },
    [weekendId, day],
    []
  );

  const addActivity = async (
    data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    const activity: Activity = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.activities.add(activity);
    return activity;
  };

  const updateActivity = async (id: string, changes: Partial<Activity>) => {
    await db.activities.update(id, {
      ...changes,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteActivity = async (id: string) => {
    await db.activities.delete(id);
  };

  const toggleStatus = async (id: string) => {
    const activity = await db.activities.get(id);
    if (activity) {
      const newStatus: ActivityStatus =
        activity.status === 'pending' ? 'confirmed' : 'pending';
      await db.activities.update(id, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return { activities, addActivity, updateActivity, deleteActivity, toggleStatus };
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
