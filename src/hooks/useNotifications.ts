import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { generateId } from '../utils/id';
import type { NotificationSubscription, FiredNotification, NotificationChannel, ReminderTiming } from '../types/notification';

export function useNotificationSubscriptions(
  personId: string | null,
  weekendId: string | null
) {
  const subscriptions = useLiveQuery(
    () => {
      if (!personId || !weekendId) return [];
      return db.notificationSubscriptions
        .where('[personId+weekendId]')
        .equals([personId, weekendId])
        .toArray()
        .catch(() =>
          // Fallback if compound index isn't available
          db.notificationSubscriptions
            .where('personId')
            .equals(personId)
            .filter((s) => s.weekendId === weekendId)
            .toArray()
        );
    },
    [personId, weekendId],
    []
  );

  return subscriptions;
}

export function useFiredNotifications(
  personId: string | null,
  weekendId: string | null
) {
  const subscriptionIds = useLiveQuery(
    () => {
      if (!personId || !weekendId) return [];
      return db.notificationSubscriptions
        .where('personId')
        .equals(personId)
        .filter((s) => s.weekendId === weekendId)
        .toArray()
        .then((subs) => subs.map((s) => s.id));
    },
    [personId, weekendId],
    []
  );

  const notifications = useLiveQuery(
    () => {
      if (subscriptionIds.length === 0) return [];
      return db.firedNotifications
        .where('subscriptionId')
        .anyOf(subscriptionIds)
        .reverse()
        .sortBy('firedAt');
    },
    [subscriptionIds],
    []
  );

  return notifications;
}

export function useUnreadCount(
  personId: string | null,
  weekendId: string | null
) {
  const count = useLiveQuery(
    async () => {
      if (!personId || !weekendId) return 0;
      const subs = await db.notificationSubscriptions
        .where('personId')
        .equals(personId)
        .filter((s) => s.weekendId === weekendId)
        .toArray();
      const subIds = subs.map((s) => s.id);
      if (subIds.length === 0) return 0;
      return db.firedNotifications
        .where('subscriptionId')
        .anyOf(subIds)
        .filter((n) => !n.read)
        .count();
    },
    [personId, weekendId],
    0
  );

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
  await db.notificationSubscriptions.add(sub);
  return sub;
}

export async function unsubscribe(id: string) {
  // Remove subscription and its fired notifications
  await db.firedNotifications.where('subscriptionId').equals(id).delete();
  await db.notificationSubscriptions.delete(id);
}

export async function toggleSubscription(id: string) {
  const sub = await db.notificationSubscriptions.get(id);
  if (sub) {
    await db.notificationSubscriptions.update(id, { enabled: !sub.enabled });
  }
}

export async function updateSubscription(
  id: string,
  changes: Partial<Pick<NotificationSubscription, 'channels' | 'reminderMinutes' | 'enabled'>>
) {
  await db.notificationSubscriptions.update(id, changes);
}

export async function markRead(id: string) {
  await db.firedNotifications.update(id, { read: true });
}

export async function markAllRead(personId: string, weekendId: string) {
  const subs = await db.notificationSubscriptions
    .where('personId')
    .equals(personId)
    .filter((s) => s.weekendId === weekendId)
    .toArray();

  const subIds = subs.map((s) => s.id);
  if (subIds.length === 0) return;

  const unread = await db.firedNotifications
    .where('subscriptionId')
    .anyOf(subIds)
    .filter((n) => !n.read)
    .toArray();

  await Promise.all(
    unread.map((n) => db.firedNotifications.update(n.id, { read: true }))
  );
}

export async function subscribeToAll(params: {
  personId: string;
  weekendId: string;
  activityIds: string[];
  channels: NotificationChannel[];
  reminderMinutes: ReminderTiming;
}) {
  // Get existing subscriptions to avoid duplicates
  const existing = await db.notificationSubscriptions
    .where('personId')
    .equals(params.personId)
    .filter((s) => s.weekendId === params.weekendId)
    .toArray();

  const existingActivityIds = new Set(existing.map((s) => s.activityId));

  const newSubs: NotificationSubscription[] = params.activityIds
    .filter((aid) => !existingActivityIds.has(aid))
    .map((activityId) => ({
      id: generateId(),
      personId: params.personId,
      weekendId: params.weekendId,
      activityId,
      channels: params.channels,
      reminderMinutes: params.reminderMinutes,
      enabled: true,
      createdAt: new Date().toISOString(),
    }));

  if (newSubs.length > 0) {
    await db.notificationSubscriptions.bulkAdd(newSubs);
  }

  // Enable any existing disabled subscriptions
  const disabled = existing.filter((s) => !s.enabled);
  await Promise.all(
    disabled.map((s) =>
      db.notificationSubscriptions.update(s.id, { enabled: true })
    )
  );
}

export async function unsubscribeFromAll(personId: string, weekendId: string) {
  const subs = await db.notificationSubscriptions
    .where('personId')
    .equals(personId)
    .filter((s) => s.weekendId === weekendId)
    .toArray();

  const subIds = subs.map((s) => s.id);

  // Delete fired notifications first
  for (const id of subIds) {
    await db.firedNotifications.where('subscriptionId').equals(id).delete();
  }

  // Delete subscriptions
  await db.notificationSubscriptions.bulkDelete(subIds);
}
