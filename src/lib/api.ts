import { db } from '../db/database';
import { seedDatabase } from '../db/seed';
import type { RaceWeekend, MasterScheduleEvent } from '../types/schedule';
import type { Activity, Person } from '../types/activity';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ── Server availability detection ──

let serverAvailable: boolean | null = null; // null = not checked yet
let checkPromise: Promise<boolean> | null = null;

async function checkServer(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/weekends`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function isServerAvailable(): Promise<boolean> {
  if (serverAvailable !== null) return serverAvailable;
  if (!checkPromise) {
    checkPromise = checkServer().then((available) => {
      serverAvailable = available;
      if (!available) {
        console.log('[api] Server unreachable — using local IndexedDB');
        // Seed Dexie if empty
        seedDatabase().catch(console.error);
      } else {
        console.log('[api] Server connected — using API');
      }
      return available;
    });
  }
  return checkPromise;
}

// Allow re-checking (e.g. when server starts up later)
export function resetServerCheck(): void {
  serverAvailable = null;
  checkPromise = null;
}

// ── Remote (fetch) helpers ──

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

// ── Unified API (server-first, Dexie fallback) ──

function generateId(): string {
  return crypto.randomUUID();
}

const now = () => new Date().toISOString();

export const api = {
  weekends: {
    list: async (): Promise<RaceWeekend[]> => {
      if (await isServerAvailable()) {
        return request<RaceWeekend[]>('/weekends');
      }
      return db.raceWeekends.toArray();
    },

    get: async (id: string): Promise<RaceWeekend> => {
      if (await isServerAvailable()) {
        return request<RaceWeekend>(`/weekends/${id}`);
      }
      const weekend = await db.raceWeekends.get(id);
      if (!weekend) throw new Error('Weekend not found');
      return weekend;
    },

    create: async (data: Omit<RaceWeekend, 'id' | 'createdAt' | 'updatedAt'>): Promise<RaceWeekend> => {
      if (await isServerAvailable()) {
        return request<RaceWeekend>('/weekends', { method: 'POST', body: JSON.stringify(data) });
      }
      const weekend: RaceWeekend = {
        ...data,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      };
      await db.raceWeekends.add(weekend);
      return weekend;
    },

    update: async (id: string, data: Partial<RaceWeekend>): Promise<RaceWeekend> => {
      if (await isServerAvailable()) {
        return request<RaceWeekend>(`/weekends/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      }
      await db.raceWeekends.update(id, { ...data, updatedAt: now() });
      const updated = await db.raceWeekends.get(id);
      if (!updated) throw new Error('Weekend not found');
      return updated;
    },

    delete: async (id: string): Promise<{ deleted: boolean }> => {
      if (await isServerAvailable()) {
        return request<{ deleted: boolean }>(`/weekends/${id}`, { method: 'DELETE' });
      }
      await db.raceWeekends.delete(id);
      return { deleted: true };
    },
  },

  activities: {
    list: async (weekendId: string): Promise<Activity[]> => {
      if (await isServerAvailable()) {
        return request<Activity[]>(`/weekends/${weekendId}/activities`);
      }
      return db.activities.where('weekendId').equals(weekendId).toArray();
    },

    create: async (weekendId: string, data: Omit<Activity, 'id' | 'weekendId' | 'createdAt' | 'updatedAt'>): Promise<Activity> => {
      if (await isServerAvailable()) {
        return request<Activity>(`/weekends/${weekendId}/activities`, { method: 'POST', body: JSON.stringify(data) });
      }
      const activity: Activity = {
        ...data,
        id: generateId(),
        weekendId,
        createdAt: now(),
        updatedAt: now(),
      };
      await db.activities.add(activity);
      return activity;
    },

    update: async (id: string, data: Partial<Activity>): Promise<Activity> => {
      if (await isServerAvailable()) {
        return request<Activity>(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      }
      await db.activities.update(id, { ...data, updatedAt: now() });
      const updated = await db.activities.get(id);
      if (!updated) throw new Error('Activity not found');
      return updated;
    },

    delete: async (id: string): Promise<{ deleted: boolean }> => {
      if (await isServerAvailable()) {
        return request<{ deleted: boolean }>(`/activities/${id}`, { method: 'DELETE' });
      }
      await db.activities.delete(id);
      return { deleted: true };
    },
  },

  masterEvents: {
    list: async (weekendId: string): Promise<MasterScheduleEvent[]> => {
      if (await isServerAvailable()) {
        return request<MasterScheduleEvent[]>(`/weekends/${weekendId}/master-events`);
      }
      return db.masterEvents.where('weekendId').equals(weekendId).toArray();
    },

    bulkCreate: async (weekendId: string, events: Omit<MasterScheduleEvent, 'id' | 'weekendId'>[]): Promise<MasterScheduleEvent[]> => {
      if (await isServerAvailable()) {
        return request<MasterScheduleEvent[]>(`/weekends/${weekendId}/master-events`, {
          method: 'POST',
          body: JSON.stringify({ events }),
        });
      }
      // Delete existing master events for this weekend, then bulk add
      await db.masterEvents.where('weekendId').equals(weekendId).delete();
      const newEvents: MasterScheduleEvent[] = events.map((e) => ({
        ...e,
        id: generateId(),
        weekendId,
      }));
      await db.masterEvents.bulkAdd(newEvents);
      return newEvents;
    },

    deleteAll: async (weekendId: string): Promise<{ deleted: boolean }> => {
      if (await isServerAvailable()) {
        return request<{ deleted: boolean }>(`/weekends/${weekendId}/master-events`, { method: 'DELETE' });
      }
      await db.masterEvents.where('weekendId').equals(weekendId).delete();
      return { deleted: true };
    },
  },

  people: {
    list: async (): Promise<Person[]> => {
      if (await isServerAvailable()) {
        return request<Person[]>('/people');
      }
      return db.people.toArray();
    },

    get: async (id: string): Promise<Person> => {
      if (await isServerAvailable()) {
        return request<Person>(`/people/${id}`);
      }
      const person = await db.people.get(id);
      if (!person) throw new Error('Person not found');
      return person;
    },

    create: async (data: Omit<Person, 'id'>): Promise<Person> => {
      if (await isServerAvailable()) {
        return request<Person>('/people', { method: 'POST', body: JSON.stringify(data) });
      }
      const person: Person = { ...data, id: generateId() };
      await db.people.add(person);
      return person;
    },

    update: async (id: string, data: Partial<Person>): Promise<Person> => {
      if (await isServerAvailable()) {
        return request<Person>(`/people/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      }
      await db.people.update(id, data);
      const updated = await db.people.get(id);
      if (!updated) throw new Error('Person not found');
      return updated;
    },

    delete: async (id: string): Promise<{ deleted: boolean }> => {
      if (await isServerAvailable()) {
        return request<{ deleted: boolean }>(`/people/${id}`, { method: 'DELETE' });
      }
      await db.people.delete(id);
      return { deleted: true };
    },
  },
};
