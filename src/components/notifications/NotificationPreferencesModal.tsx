import { useState, useEffect, useMemo } from 'react';
import { Calendar, Download, BellRing, BellOff } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useNotificationStore } from '../../store/notificationStore';
import {
  useNotificationSubscriptions,
  subscribe,
  unsubscribe,
  updateSubscription,
  subscribeToAll,
  unsubscribeFromAll,
} from '../../hooks/useNotifications';
import {
  generateIcsForPerson,
  downloadIcsFile,
} from '../../services/notification/IcsExportService';
import { api } from '../../lib/api';
import { DEPARTMENTS, DEPARTMENT_MAP, REMINDER_TIMINGS, NOTIFICATION_CHANNELS } from '../../utils/constants';
import type { Activity, Person } from '../../types/activity';
import type { NotificationChannel, ReminderTiming } from '../../types/notification';

interface NotificationPreferencesModalProps {
  open: boolean;
  onClose: () => void;
  weekendId: string | null;
  activities: Activity[];
  people: Person[];
}

export function NotificationPreferencesModal({
  open,
  onClose,
  weekendId,
  activities,
  people,
}: NotificationPreferencesModalProps) {
  const activePersonId = useNotificationStore((s) => s.activePersonId);
  const setActivePersonId = useNotificationStore((s) => s.setActivePersonId);
  const subscriptions = useNotificationSubscriptions(activePersonId, weekendId);

  const [defaultChannels, setDefaultChannels] = useState<NotificationChannel[]>(['in-app']);
  const [defaultTiming, setDefaultTiming] = useState<ReminderTiming>(15);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [icsExporting, setIcsExporting] = useState(false);

  // Load person's phone data when person changes
  useEffect(() => {
    if (!activePersonId) return;
    api.people.get(activePersonId).then((person) => {
      if (person) {
        setPhoneNumber(person.phoneNumber ?? '');
        setSmsOptIn(person.smsOptIn ?? false);
      }
    }).catch(() => {});
  }, [activePersonId]);

  // Map of activityId → subscription
  const subMap = useMemo(() => {
    const map = new Map<string, (typeof subscriptions)[number]>();
    for (const sub of subscriptions) {
      map.set(sub.activityId, sub);
    }
    return map;
  }, [subscriptions]);

  const activePerson = useMemo(
    () => people.find((p) => p.id === activePersonId),
    [people, activePersonId]
  );

  const handleToggleActivity = async (activityId: string) => {
    if (!activePersonId || !weekendId) return;

    const existing = subMap.get(activityId);
    if (existing) {
      await unsubscribe(existing.id);
    } else {
      await subscribe({
        personId: activePersonId,
        weekendId,
        activityId,
        channels: defaultChannels,
        reminderMinutes: defaultTiming,
      });
    }
  };

  const handleSubscribeAll = async () => {
    if (!activePersonId || !weekendId) return;
    await subscribeToAll({
      personId: activePersonId,
      weekendId,
      activityIds: activities.map((a) => a.id),
      channels: defaultChannels,
      reminderMinutes: defaultTiming,
    });
  };

  const handleUnsubscribeAll = async () => {
    if (!activePersonId || !weekendId) return;
    await unsubscribeFromAll(activePersonId, weekendId);
  };

  const handleUpdateSubTiming = async (
    subId: string,
    timing: ReminderTiming
  ) => {
    await updateSubscription(subId, { reminderMinutes: timing });
  };

  const handleSavePhone = async () => {
    if (!activePersonId) return;
    await api.people.update(activePersonId, { phoneNumber, smsOptIn });
  };

  const handleExportIcs = async () => {
    if (!activePersonId || !weekendId) return;
    setIcsExporting(true);
    try {
      const content = await generateIcsForPerson(activePersonId, weekendId);
      const weekend = await api.weekends.get(weekendId);
      const filename = `${(weekend?.name ?? 'schedule').replace(/\s+/g, '-').toLowerCase()}-schedule.ics`;
      downloadIcsFile(content, filename);
    } catch (err) {
      console.error('ICS export error:', err);
    } finally {
      setIcsExporting(false);
    }
  };

  const toggleDefaultChannel = (ch: NotificationChannel) => {
    setDefaultChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  // Group activities by day for display
  const activitiesByDay = useMemo(() => {
    const grouped = new Map<string, Activity[]>();
    for (const a of activities) {
      const list = grouped.get(a.day) ?? [];
      list.push(a);
      grouped.set(a.day, list);
    }
    // Sort each group by start time
    for (const list of grouped.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return grouped;
  }, [activities]);

  const dayOrder = ['wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels: Record<string, string> = {
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  return (
    <Modal open={open} onClose={onClose} title="Notification Preferences" wide>
      <div className="space-y-6">
        {/* Active Person */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Your Profile
          </label>
          <select
            value={activePersonId ?? ''}
            onChange={(e) => setActivePersonId(e.target.value || null)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select your profile...</option>
            {people.map((p) => {
              const dept = DEPARTMENT_MAP[p.departmentId];
              return (
                <option key={p.id} value={p.id}>
                  {p.name} ({dept?.name ?? p.departmentId})
                </option>
              );
            })}
          </select>
        </div>

        {activePersonId && (
          <>
            {/* Default Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Default Timing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Default Reminder
                </label>
                <select
                  value={defaultTiming}
                  onChange={(e) =>
                    setDefaultTiming(Number(e.target.value) as ReminderTiming)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {REMINDER_TIMINGS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number (SMS-ready) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                  <span className="text-xs text-gray-400 ml-1">(for SMS - coming soon)</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onBlur={handleSavePhone}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Default Channels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Channels
              </label>
              <div className="flex flex-wrap gap-2">
                {NOTIFICATION_CHANNELS.map((ch) => {
                  const isActive = defaultChannels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => ch.available && toggleDefaultChannel(ch.id)}
                      disabled={!ch.available}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        !ch.available
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isActive
                            ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {ch.label}
                      {!ch.available && (
                        <span className="ml-1.5 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bulk Actions + ICS Export */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={handleSubscribeAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <BellRing size={14} />
                Subscribe to All
              </button>
              <button
                onClick={handleUnsubscribeAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <BellOff size={14} />
                Unsubscribe All
              </button>
              <div className="flex-1" />
              <button
                onClick={handleExportIcs}
                disabled={icsExporting || subscriptions.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {icsExporting ? (
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Calendar size={14} />
                )}
                Export Calendar (.ics)
              </button>
            </div>

            {/* Per-Activity Subscriptions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Activity Subscriptions
              </h3>

              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No activities for this weekend yet. Add some activities first!
                </p>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {dayOrder
                    .filter((d) => activitiesByDay.has(d))
                    .map((day) => (
                      <div key={day}>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          {dayLabels[day]}
                        </h4>
                        <div className="space-y-1">
                          {activitiesByDay.get(day)!.map((activity) => {
                            const sub = subMap.get(activity.id);
                            const isSubscribed = !!sub;
                            const depts = activity.departmentIds
                              .map((id) => DEPARTMENT_MAP[id]?.shortName ?? id)
                              .join(', ');

                            return (
                              <div
                                key={activity.id}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                {/* Toggle */}
                                <button
                                  onClick={() => handleToggleActivity(activity.id)}
                                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                                    isSubscribed ? 'bg-indigo-500' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                      isSubscribed ? 'translate-x-4' : 'translate-x-0.5'
                                    }`}
                                  />
                                </button>

                                {/* Activity info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 truncate">
                                    {activity.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {activity.startTime} - {activity.endTime}
                                    {depts && ` \u00b7 ${depts}`}
                                  </p>
                                </div>

                                {/* Timing selector (only when subscribed) */}
                                {isSubscribed && sub && (
                                  <select
                                    value={sub.reminderMinutes}
                                    onChange={(e) =>
                                      handleUpdateSubTiming(
                                        sub.id,
                                        Number(e.target.value) as ReminderTiming
                                      )
                                    }
                                    className="text-xs px-2 py-1 bg-gray-100 border border-gray-200 rounded text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {REMINDER_TIMINGS.map((t) => (
                                      <option key={t.value} value={t.value}>
                                        {t.value}m
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
