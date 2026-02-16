import { useState, useEffect, useCallback } from 'react';
import { generateId } from '../utils/id';
import {
  subscriptionStore,
  firedStore,
  getSubscriptionsForScheduler,
} from '../services/notification/notificationStoreHelpers';
import type { NotificationSubscription, FiredNotification, NotificationChannel, ReminderTiming } from '../types/notification';

// ── Re-use the shared in-memory stores from notificationStoreHelpers ──

function getSubscriptions(personId: string, weekendId: string) {
  return getSubscriptionsForScheduler(personId, weekendId);
}

export function useNotificationSubscriptions(
  personId: string | null,
  weekendId: string | null
) {
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);

  const refresh = useCallback(() => {
    if (!personId || !weekendId) {
      setSubscriptions([]);
      return;
    }
    setSubscriptions(getSubscriptions(personId, weekendId));
  }, [personId, weekendId]);

  useEffect(() => {
    refresh();
    // Poll for changes every 2 seconds
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  return subscriptions;
}

export function useFiredNotifications(
  personId: string | null,
  weekendId: string | null
) {
  const [notifications, setNotifications] = useState<FiredNotification[]>([]);

  const refresh = useCallback(() => {
    if (!personId || !weekendId) {
      setNotifications([]);
      return;
    }
    const subs = getSubscriptions(personId, weekendId);
    const subIds = new Set(subs.map((s) => s.id));
    const matching = firedStore
      .filter((n) => subIds.has(n.subscriptionId))
      .sort((a, b) => b.firedAt.localeCompare(a.firedAt));
    setNotifications(matching);
  }, [personId, weekendId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  return notifications;
}

export function useUnreadCount(
  personId: string | null,
  weekendId: string | null
) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!personId || !weekendId) {
      setCount(0);
      return;
    }
    const subs = getSubscriptions(personId, weekendId);
    const subIds = new Set(subs.map((s) => s.id));
    const unread = firedStore.filter((n) => subIds.has(n.subscriptionId) && !n.read).length;
    setCount(unread);
  }, [personId, weekendId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  return count;
}

// ── CRUD helpers ──

export async function subscribe(params: {
  personId: string;
  weekendId: string;
  activityId: string;
  channels: NotificationChannel[];
  reminderMinutes: ReminderTiming;
}) {
  const sub: NotificationSubscription = {
    id: generateId(),
    personId: params.personId,
    weekendId: params.weekendId,
    activityId: params.activityId,
    channels: params.channels,
    reminderMinutes: params.reminderMinutes,
    enabled: true,
    createdAt: new Date().toISOString(),
  };
  subscriptionStore.push(sub);
  return sub;
}

export async function unsubscribe(id: string) {
  const idx = subscriptionStore.findIndex((s) => s.id === id);
  if (idx !== -1) subscriptionStore.splice(idx, 1);
  // Remove associated fired notifications
  for (let i = firedStore.length - 1; i >= 0; i--) {
    if (firedStore[i].subscriptionId === id) firedStore.splice(i, 1);
  }
}

export async function toggleSubscription(id: string) {
  const sub = subscriptionStore.find((s) => s.id === id);
  if (sub) sub.enabled = !sub.enabled;
}

export async function updateSubscription(
  id: string,
  changes: Partial<Pick<NotificationSubscription, 'channels' | 'reminderMinutes' | 'enabled'>>
) {
  const sub = subscriptionStore.find((s) => s.id === id);
  if (sub) Object.assign(sub, changes);
}

export async function markRead(id: string) {
  const n = firedStore.find((f) => f.id === id);
  if (n) n.read = true;
}

export async function markAllRead(personId: string, weekendId: string) {
  const subs = getSubscriptions(personId, weekendId);
  const subIds = new Set(subs.map((s) => s.id));
  for (const n of firedStore) {
    if (subIds.has(n.subscriptionId) && !n.read) n.read = true;
  }
}

export async function subscribeToAll(params: {
  personId: string;
  weekendId: string;
  activityIds: string[];
  channels: NotificationChannel[];
  reminderMinutes: ReminderTiming;
}) {
  const existing = getSubscriptions(params.personId, params.weekendId);
  const existingActivityIds = new Set(existing.map((s) => s.activityId));

  for (const activityId of params.activityIds) {
    if (!existingActivityIds.has(activityId)) {
      subscriptionStore.push({
        id: generateId(),
        personId: params.personId,
        weekendId: params.weekendId,
        activityId,
        channels: params.channels,
        reminderMinutes: params.reminderMinutes,
        enabled: true,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Enable disabled ones
  for (const sub of existing) {
    if (!sub.enabled) sub.enabled = true;
  }
}

export async function unsubscribeFromAll(personId: string, weekendId: string) {
  const toRemove = subscriptionStore
    .filter((s) => s.personId === personId && s.weekendId === weekendId)
    .map((s) => s.id);

  // Remove fired notifications first
  for (let i = firedStore.length - 1; i >= 0; i--) {
    if (toRemove.includes(firedStore[i].subscriptionId)) firedStore.splice(i, 1);
  }

  // Remove subscriptions
  for (let i = subscriptionStore.length - 1; i >= 0; i--) {
    if (toRemove.includes(subscriptionStore[i].id)) subscriptionStore.splice(i, 1);
  }
}
