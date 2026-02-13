import { db } from '../../db/database';
import { generateId } from '../../utils/id';
import { resolveActivityDate } from '../../utils/dateResolve';
import { useNotificationStore } from '../../store/notificationStore';
import type { FiredNotification } from '../../types/notification';

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Check all enabled subscriptions for the given person+weekend.
 * If an activity's reminder window has arrived and no FiredNotification
 * exists yet, create one and show a toast.
 */
export async function checkAndFire(weekendId: string, personId: string) {
  try {
    // Get the weekend to resolve dates
    const weekend = await db.raceWeekends.get(weekendId);
    if (!weekend) return;

    // Get all enabled subscriptions for this person+weekend
    const subs = await db.notificationSubscriptions
      .where('personId')
      .equals(personId)
      .filter((s) => s.weekendId === weekendId && s.enabled && s.channels.includes('in-app'))
      .toArray();

    if (subs.length === 0) return;

    const now = new Date();

    for (const sub of subs) {
      // Get the activity
      const activity = await db.activities.get(sub.activityId);
      if (!activity) continue;

      // Resolve the absolute date/time of the activity
      const activityDate = resolveActivityDate(
        weekend.startDate,
        activity.day,
        activity.startTime
      );

      // Calculate the reminder trigger time
      const triggerTime = new Date(
        activityDate.getTime() - sub.reminderMinutes * 60 * 1000
      );

      // Check if we're past the trigger time
      if (now < triggerTime) continue;

      // Don't fire if the activity has already passed
      if (now > activityDate) continue;

      // Check if we already fired this notification
      const existing = await db.firedNotifications
        .where('subscriptionId')
        .equals(sub.id)
        .first();

      if (existing) continue;

      // Fire the notification
      const minutesUntil = Math.round(
        (activityDate.getTime() - now.getTime()) / 60000
      );

      const fired: FiredNotification = {
        id: generateId(),
        subscriptionId: sub.id,
        activityId: sub.activityId,
        channel: 'in-app',
        firedAt: now.toISOString(),
        read: false,
        title: activity.name,
        body:
          minutesUntil <= 0
            ? 'Starting now!'
            : minutesUntil === 1
              ? 'Starts in 1 minute'
              : `Starts in ${minutesUntil} minutes`,
        day: activity.day,
        startTime: activity.startTime,
      };

      await db.firedNotifications.add(fired);

      // Show toast
      useNotificationStore.getState().addToast(fired);
    }
  } catch (err) {
    console.error('Notification scheduler error:', err);
  }
}

export function startScheduler(weekendId: string, personId: string) {
  stopScheduler();

  // Run immediately, then every 60 seconds
  checkAndFire(weekendId, personId);
  intervalId = setInterval(() => {
    checkAndFire(weekendId, personId);
  }, 60_000);
}

export function stopScheduler() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
