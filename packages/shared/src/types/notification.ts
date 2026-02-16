import type { DayOfWeek } from './schedule.js';

export type NotificationChannel = 'in-app' | 'ics' | 'sms' | 'email';
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
  channel: NotificationChannel;
  firedAt: string;
  read: boolean;
  title: string;
  body: string;
  day: DayOfWeek;
  startTime: string;
}

export interface NotificationLog {
  id: string;
  activityId: string;
  personId: string;
  channel: 'email' | 'sms';
  status: 'sent' | 'failed';
  error?: string;
  sentAt: string;
}
