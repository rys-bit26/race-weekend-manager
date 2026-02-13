import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { startScheduler, stopScheduler } from '../services/notification/NotificationScheduler';

/**
 * Start the notification scheduler when a person is selected and a weekend is active.
 * Automatically restarts when either changes. Cleans up on unmount.
 */
export function useNotificationScheduler(weekendId: string | null) {
  const activePersonId = useNotificationStore((s) => s.activePersonId);

  useEffect(() => {
    if (!weekendId || !activePersonId) {
      stopScheduler();
      return;
    }

    startScheduler(weekendId, activePersonId);
    return () => stopScheduler();
  }, [weekendId, activePersonId]);
}
