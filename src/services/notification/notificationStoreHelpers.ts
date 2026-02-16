/**
 * Shared in-memory notification store helpers.
 * Both the NotificationScheduler and useNotifications hook reference
 * these same module-level arrays so data stays consistent.
 *
 * Phase 3 will move subscriptions + fired notifications to the server.
 */

import type { NotificationSubscription, FiredNotification } from '../../types/notification';

// Module-level stores (singleton per app instance)
export const subscriptionStore: NotificationSubscription[] = [];
export const firedStore: FiredNotification[] = [];

// ── Read helpers (used by scheduler) ──

export function getSubscriptionsForScheduler(
  personId: string,
  weekendId: string
): NotificationSubscription[] {
  return subscriptionStore.filter(
    (s) => s.personId === personId && s.weekendId === weekendId
  );
}

export function getFiredNotificationsForScheduler(): FiredNotification[] {
  return [...firedStore];
}

export function addFiredNotification(fired: FiredNotification): void {
  firedStore.push(fired);
}
