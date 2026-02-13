import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, Settings } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useFiredNotifications, markRead, markAllRead } from '../../hooks/useNotifications';

interface NotificationDropdownProps {
  weekendId: string | null;
  onClose: () => void;
  onOpenPreferences: () => void;
}

export function NotificationDropdown({
  weekendId,
  onClose,
  onOpenPreferences,
}: NotificationDropdownProps) {
  const activePersonId = useNotificationStore((s) => s.activePersonId);
  const notifications = useFiredNotifications(activePersonId, weekendId);

  const handleMarkRead = async (id: string) => {
    await markRead(id);
  };

  const handleMarkAllRead = async () => {
    if (activePersonId && weekendId) {
      await markAllRead(activePersonId, weekendId);
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-80 overflow-y-auto">
        {!activePersonId ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            <Bell size={24} className="mx-auto mb-2 text-gray-300" />
            <p>Select your profile to see notifications</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            <Bell size={24} className="mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Subscribe to activities to get alerts
            </p>
          </div>
        ) : (
          notifications.slice(0, 20).map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleMarkRead(notification.id)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                !notification.read ? 'bg-indigo-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {!notification.read && (
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                )}
                <div className={!notification.read ? '' : 'pl-5'}>
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {notification.body}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.firedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-2.5">
        <button
          onClick={onOpenPreferences}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-indigo-600 transition-colors w-full"
        >
          <Settings size={14} />
          Notification Preferences
        </button>
      </div>
    </div>
  );
}
