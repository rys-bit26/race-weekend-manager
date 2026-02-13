import { format } from 'date-fns';
import { db } from '../../db/database';
import { resolveActivityDate } from '../../utils/dateResolve';
import { generateId } from '../../utils/id';

/**
 * Format a Date as an ICS datetime string (UTC): 20260315T140000Z
 */
function toIcsDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

/**
 * Escape special characters for ICS text values.
 */
function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a VCALENDAR string for all subscribed activities
 * of a given person and weekend.
 */
export async function generateIcsForPerson(
  personId: string,
  weekendId: string
): Promise<string> {
  const weekend = await db.raceWeekends.get(weekendId);
  if (!weekend) throw new Error('Weekend not found');

  const subs = await db.notificationSubscriptions
    .where('personId')
    .equals(personId)
    .filter((s) => s.weekendId === weekendId && s.enabled)
    .toArray();

  if (subs.length === 0) {
    throw new Error('No subscribed activities to export');
  }

  const events: string[] = [];

  for (const sub of subs) {
    const activity = await db.activities.get(sub.activityId);
    if (!activity) continue;

    const startDate = resolveActivityDate(
      weekend.startDate,
      activity.day,
      activity.startTime
    );
    const endDate = resolveActivityDate(
      weekend.startDate,
      activity.day,
      activity.endTime
    );

    const uid = `${activity.id}-${generateId()}@race-weekend-manager`;
    const now = toIcsDate(new Date());

    let vevent = [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${toIcsDate(startDate)}`,
      `DTEND:${toIcsDate(endDate)}`,
      `SUMMARY:${escapeIcs(activity.name)}`,
    ];

    if (activity.location) {
      vevent.push(`LOCATION:${escapeIcs(activity.location)}`);
    }

    if (activity.notes) {
      vevent.push(`DESCRIPTION:${escapeIcs(activity.notes)}`);
    }

    // Add VALARM based on subscription reminder timing
    if (sub.channels.includes('ics')) {
      vevent.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeIcs(activity.name)} is starting soon`,
        `TRIGGER:-PT${sub.reminderMinutes}M`,
        'END:VALARM'
      );
    }

    vevent.push('END:VEVENT');
    events.push(vevent.join('\r\n'));
  }

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Race Weekend Manager//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(weekend.name)} Schedule`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  return calendar;
}

/**
 * Trigger a browser download of the .ics file.
 */
export function downloadIcsFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
