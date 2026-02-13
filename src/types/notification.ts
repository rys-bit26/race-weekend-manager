import type { DayOfWeek } from './schedule';

export type NotificationChannel = 'in-app' | 'ics' | 'sms';
export type ReminderTiming = 5 | 15 | 30 | 60;

export interface NotificationSubscription {
  id: string;
  personId: string;
  weekendId: string;
  activityId: string;
  channels: NotificationChannel[];
  reminderMinutes: ReminderTiming;
  enabled: boolean;
  createdAt: string;
}

export interface FiredNotification {
  id: string;
  subscriptionId: string;
  activityId: string;
  channel: 'in-app';
  firedAt: string;
  read: boolean;
  title: string;
  body: string;
  day: DayOfWeek;
  startTime: string;
}
