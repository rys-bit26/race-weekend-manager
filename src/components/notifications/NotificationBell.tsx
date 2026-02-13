import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useUnreadCount } from '../../hooks/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationBellProps {
  weekendId: string | null;
  onOpenPreferences: () => void;
}

export function NotificationBell({ weekendId, onOpenPreferences }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activePersonId = useNotificationStore((s) => s.activePersonId);
  const unreadCount = useUnreadCount(activePersonId, weekendId);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          weekendId={weekendId}
          onClose={() => setOpen(false)}
          onOpenPreferences={() => {
            setOpen(false);
            onOpenPreferences();
          }}
        />
      )}
    </div>
  );
}
