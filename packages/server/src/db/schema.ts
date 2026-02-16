import { pgTable, text, timestamp, real, boolean, jsonb } from 'drizzle-orm/pg-core';

// ── Race Weekends ──

export const raceWeekends = pgTable('race_weekends', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  trackName: text('track_name').notNull(),
  location: text('location').notNull(),
  startDate: text('start_date').notNull(), // ISO date string
  endDate: text('end_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ── Master Schedule Events ──

export const masterEvents = pgTable('master_events', {
  id: text('id').primaryKey(),
  weekendId: text('weekend_id').notNull().references(() => raceWeekends.id, { onDelete: 'cascade' }),
  day: text('day').notNull(), // DayOfWeek
  startTime: text('start_time').notNull(), // HH:mm
  endTime: text('end_time').notNull(),
  title: text('title').notNull(),
  series: text('series').notNull(), // SeriesType
  description: text('description'),
  rawText: text('raw_text').notNull().default(''),
  confidence: real('confidence').notNull().default(1),
});

// ── Activities ──

export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  weekendId: text('weekend_id').notNull().references(() => raceWeekends.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  departmentIds: jsonb('department_ids').$type<string[]>().notNull().default([]),
  personIds: jsonb('person_ids').$type<string[]>().notNull().default([]),
  day: text('day').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  location: text('location').notNull().default(''),
  status: text('status').notNull().default('pending'),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ── People ──

export const people = pgTable('people', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  departmentId: text('department_id').notNull(),
  role: text('role'),
  email: text('email'),
  phoneNumber: text('phone_number'),
  smsOptIn: boolean('sms_opt_in').notNull().default(false),
});

// ── Notification Subscriptions ──

export const notificationSubscriptions = pgTable('notification_subscriptions', {
  id: text('id').primaryKey(),
  personId: text('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
  weekendId: text('weekend_id').notNull().references(() => raceWeekends.id, { onDelete: 'cascade' }),
  activityId: text('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  channels: jsonb('channels').$type<string[]>().notNull().default([]),
  reminderMinutes: real('reminder_minutes').notNull().default(15),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: text('created_at').notNull(),
});

// ── Fired Notifications (client-side reminders) ──

export const firedNotifications = pgTable('fired_notifications', {
  id: text('id').primaryKey(),
  subscriptionId: text('subscription_id').notNull(),
  activityId: text('activity_id').notNull(),
  channel: text('channel').notNull(),
  firedAt: text('fired_at').notNull(),
  read: boolean('read').notNull().default(false),
  title: text('title').notNull(),
  body: text('body').notNull(),
  day: text('day').notNull(),
  startTime: text('start_time').notNull(),
});

// ── Notification Log (email/SMS delivery tracking) ──

export const notificationLogs = pgTable('notification_logs', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  personId: text('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull(), // 'email' | 'sms'
  success: boolean('success').notNull().default(true),
  message: text('message'),
  sentAt: text('sent_at').notNull(),
});
