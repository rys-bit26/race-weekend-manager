/**
 * Core notification dispatcher.
 * Detects what changed in an activity, resolves assigned people,
 * and dispatches email/SMS notifications with rate limiting.
 */

import { eq, and, gt } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { sendEmail } from './email.js';
import { sendSms } from './sms.js';
import { activityChangedEmailHtml } from '../templates/activity-changed.js';

interface ActivityData {
  id: string;
  weekendId: string;
  name: string;
  departmentIds: string[];
  personIds: string[];
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  notes: string;
}

interface ChangeDescription {
  field: string;
  from: string;
  to: string;
  humanReadable: string;
}

// Rate limit: 5 minutes per person per activity
const RATE_LIMIT_MS = 5 * 60 * 1000;

/**
 * Compare old and new activity data and send notifications if meaningful changes occurred.
 * This is fire-and-forget — errors are logged but don't propagate.
 */
export async function notifyActivityChanges(
  oldActivity: ActivityData,
  newActivity: ActivityData
): Promise<void> {
  try {
    // Detect changes
    const changes = detectChanges(oldActivity, newActivity);
    if (changes.length === 0) return;

    // Get the weekend name
    const [weekend] = await db
      .select()
      .from(schema.raceWeekends)
      .where(eq(schema.raceWeekends.id, newActivity.weekendId));

    const weekendName = weekend?.name ?? 'Race Weekend';

    // Get assigned people
    const allPeople = await db.select().from(schema.people);
    const assignedPeople = allPeople.filter((p) =>
      newActivity.personIds.includes(p.id)
    );

    // Also notify people who were REMOVED from the activity
    const removedPersonIds = oldActivity.personIds.filter(
      (id) => !newActivity.personIds.includes(id)
    );
    const removedPeople = allPeople.filter((p) =>
      removedPersonIds.includes(p.id)
    );

    const allNotifyPeople = [...assignedPeople, ...removedPeople];

    for (const person of allNotifyPeople) {
      // Rate limit check
      const rateLimited = await isRateLimited(person.id, newActivity.id);
      if (rateLimited) {
        console.log(`⏳ Rate limited: ${person.name} for ${newActivity.name}`);
        continue;
      }

      // Build change descriptions for this person
      const changeTexts = changes.map((c) => c.humanReadable);

      // If this person was removed, add that context
      if (removedPersonIds.includes(person.id)) {
        changeTexts.push('You have been removed from this activity');
      }

      // Send email
      if (person.email) {
        const subject = `Schedule Update: ${newActivity.name}`;
        const html = activityChangedEmailHtml({
          activityName: newActivity.name,
          changes: changeTexts,
          newDay: newActivity.day,
          newStartTime: newActivity.startTime,
          newEndTime: newActivity.endTime,
          newStatus: newActivity.status,
          location: newActivity.location || undefined,
          weekendName,
        });

        const emailSent = await sendEmail({ to: person.email, subject, html });
        await logNotification({
          personId: person.id,
          activityId: newActivity.id,
          channel: 'email',
          success: emailSent,
          message: subject,
        });
      }

      // Send SMS (only if opted in)
      if (person.smsOptIn && person.phoneNumber) {
        const smsBody = buildSmsBody(newActivity.name, changes, newActivity);
        const smsSent = await sendSms({ to: person.phoneNumber, body: smsBody });
        await logNotification({
          personId: person.id,
          activityId: newActivity.id,
          channel: 'sms',
          success: smsSent,
          message: smsBody,
        });
      }
    }
  } catch (err) {
    console.error('Notification dispatch error:', err);
  }
}

/**
 * Detect meaningful changes between old and new activity data.
 */
function detectChanges(
  oldA: ActivityData,
  newA: ActivityData
): ChangeDescription[] {
  const changes: ChangeDescription[] = [];

  if (oldA.day !== newA.day) {
    changes.push({
      field: 'day',
      from: oldA.day,
      to: newA.day,
      humanReadable: `Day changed from ${capitalize(oldA.day)} to ${capitalize(newA.day)}`,
    });
  }

  if (oldA.startTime !== newA.startTime) {
    changes.push({
      field: 'startTime',
      from: oldA.startTime,
      to: newA.startTime,
      humanReadable: `Start time changed from ${oldA.startTime} to ${newA.startTime}`,
    });
  }

  if (oldA.endTime !== newA.endTime) {
    changes.push({
      field: 'endTime',
      from: oldA.endTime,
      to: newA.endTime,
      humanReadable: `End time changed from ${oldA.endTime} to ${newA.endTime}`,
    });
  }

  if (oldA.status !== newA.status) {
    changes.push({
      field: 'status',
      from: oldA.status,
      to: newA.status,
      humanReadable: `Status changed from ${capitalize(oldA.status)} to ${capitalize(newA.status)}`,
    });
  }

  if (oldA.location !== newA.location && newA.location) {
    changes.push({
      field: 'location',
      from: oldA.location,
      to: newA.location,
      humanReadable: oldA.location
        ? `Location changed from ${oldA.location} to ${newA.location}`
        : `Location set to ${newA.location}`,
    });
  }

  if (oldA.name !== newA.name) {
    changes.push({
      field: 'name',
      from: oldA.name,
      to: newA.name,
      humanReadable: `Renamed from "${oldA.name}" to "${newA.name}"`,
    });
  }

  return changes;
}

/**
 * Check if a notification was already sent for this person+activity within the rate limit window.
 */
async function isRateLimited(
  personId: string,
  activityId: string
): Promise<boolean> {
  const cutoff = new Date(Date.now() - RATE_LIMIT_MS).toISOString();

  const recent = await db
    .select()
    .from(schema.notificationLogs)
    .where(
      and(
        eq(schema.notificationLogs.personId, personId),
        eq(schema.notificationLogs.activityId, activityId),
        gt(schema.notificationLogs.sentAt, cutoff)
      )
    )
    .limit(1);

  return recent.length > 0;
}

/**
 * Log a notification to the notification_logs table.
 */
async function logNotification(params: {
  personId: string;
  activityId: string;
  channel: string;
  success: boolean;
  message: string;
}): Promise<void> {
  try {
    await db.insert(schema.notificationLogs).values({
      id: crypto.randomUUID(),
      personId: params.personId,
      activityId: params.activityId,
      channel: params.channel,
      success: params.success,
      message: params.message,
      sentAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to log notification:', err);
  }
}

function buildSmsBody(
  activityName: string,
  changes: ChangeDescription[],
  newActivity: ActivityData
): string {
  const changeSummary = changes.map((c) => {
    if (c.field === 'day') return `moved to ${capitalize(c.to)}`;
    if (c.field === 'startTime') return `now at ${c.to}`;
    if (c.field === 'status') return `now ${c.to}`;
    return c.humanReadable;
  }).join(', ');

  return `[Race Schedule] "${activityName}" updated: ${changeSummary}. ${capitalize(newActivity.day)} ${newActivity.startTime}-${newActivity.endTime}.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
