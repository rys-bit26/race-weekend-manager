import { useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

export function NotificationToast() {
  const toasts = useNotificationStore((s) => s.toasts);
  const dismissToast = useNotificationStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          title={toast.title}
          body={toast.body}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
}

function ToastItem({
  id,
  title,
  body,
  onDismiss,
}: {
  id: string;
  title: string;
  body: string;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 8000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div className="pointer-events-auto bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80 animate-slide-in-right">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
          <Bell size={16} className="text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{body}</p>
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
