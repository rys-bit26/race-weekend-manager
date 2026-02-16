import type { RaceWeekend, MasterScheduleEvent } from '../types/schedule';
import type { Activity, Person } from '../types/activity';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

// ── Race Weekends ──

export const api = {
  weekends: {
    list: () => request<RaceWeekend[]>('/weekends'),
    get: (id: string) => request<RaceWeekend>(`/weekends/${id}`),
    create: (data: Omit<RaceWeekend, 'id' | 'createdAt' | 'updatedAt'>) =>
      request<RaceWeekend>('/weekends', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<RaceWeekend>) =>
      request<RaceWeekend>(`/weekends/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ deleted: boolean }>(`/weekends/${id}`, { method: 'DELETE' }),
  },

  activities: {
    list: (weekendId: string) =>
      request<Activity[]>(`/weekends/${weekendId}/activities`),
    create: (weekendId: string, data: Omit<Activity, 'id' | 'weekendId' | 'createdAt' | 'updatedAt'>) =>
      request<Activity>(`/weekends/${weekendId}/activities`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Activity>) =>
      request<Activity>(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ deleted: boolean }>(`/activities/${id}`, { method: 'DELETE' }),
  },

  masterEvents: {
    list: (weekendId: string) =>
      request<MasterScheduleEvent[]>(`/weekends/${weekendId}/master-events`),
    bulkCreate: (weekendId: string, events: Omit<MasterScheduleEvent, 'id' | 'weekendId'>[]) =>
      request<MasterScheduleEvent[]>(`/weekends/${weekendId}/master-events`, {
        method: 'POST',
        body: JSON.stringify({ events }),
      }),
    deleteAll: (weekendId: string) =>
      request<{ deleted: boolean }>(`/weekends/${weekendId}/master-events`, { method: 'DELETE' }),
  },

  people: {
    list: () => request<Person[]>('/people'),
    get: (id: string) => request<Person>(`/people/${id}`),
    create: (data: Omit<Person, 'id'>) =>
      request<Person>('/people', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Person>) =>
      request<Person>(`/people/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ deleted: boolean }>(`/people/${id}`, { method: 'DELETE' }),
  },
};
