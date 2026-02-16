import { useState, useMemo } from 'react';
import { Calendar, Copy, Check, ExternalLink } from 'lucide-react';
import { Modal } from '../common/Modal';
import { DEPARTMENTS } from '../../utils/constants';

interface CalendarSubscriptionsProps {
  open: boolean;
  onClose: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || window.location.origin + '/api';

export function CalendarSubscriptions({ open, onClose }: CalendarSubscriptionsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const feeds = useMemo(
    () =>
      DEPARTMENTS.map((dept) => ({
        ...dept,
        url: `${API_BASE}/calendar/${dept.id}.ics`,
      })),
    []
  );

  const handleCopy = async (url: string, deptId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(deptId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedId(deptId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Calendar Feeds">
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Subscribe to these calendar feeds in Outlook, Google Calendar, or Apple Calendar
            to automatically sync department schedules.
          </p>
          <p className="text-xs text-blue-600 mt-1">
            In Outlook: File &rarr; Account Settings &rarr; Internet Calendars &rarr; New
          </p>
        </div>

        <div className="space-y-2">
          {feeds.map((feed) => (
            <div
              key={feed.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: feed.bgColor }}
              >
                <Calendar size={14} style={{ color: feed.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{feed.name}</p>
                <p className="text-xs text-gray-500 truncate font-mono">
                  {feed.url}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleCopy(feed.url, feed.id)}
                  className={`p-1.5 rounded-md transition-colors ${
                    copiedId === feed.id
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Copy URL"
                >
                  {copiedId === feed.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <a
                  href={feed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                  title="Open feed"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Calendar feeds update automatically when schedule changes are made.
            Outlook typically polls every 30 minutes.
          </p>
        </div>
      </div>
    </Modal>
  );
}
