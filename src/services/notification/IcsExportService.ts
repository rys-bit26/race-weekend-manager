import { format } from 'date-fns';
import { db } from '../../db/database';
import { resolveActivityDate } from '../../utils/dateResolve';
import { generateId } from '../../utils/id';

/**
 * Get the IANA timezone string for the user's browser (e.g. "America/New_York").
 */
function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format a Date as an ICS local datetime string (NO "Z" suffix): 20260315T180000
 * Must be paired with a TZID parameter so calendar apps interpret
 * the time in the correct timezone rather than as UTC.
 */
function toIcsLocalDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

/**
 * Format a Date as a true UTC datetime string: 20260315T230000Z
 * Used only for DTSTAMP, which the ICS spec requires to be in UTC.
 */
function toIcsUtcDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
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

  const tz = getLocalTimezone();
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
    const now = toIcsUtcDate(new Date());

    let vevent = [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=${tz}:${toIcsLocalDate(startDate)}`,
      `DTEND;TZID=${tz}:${toIcsLocalDate(endDate)}`,
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
    `X-WR-TIMEZONE:${tz}`,
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
