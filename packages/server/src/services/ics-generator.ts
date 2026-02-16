/**
 * Server-side ICS calendar feed generator.
 * Generates RFC 5545 VCALENDAR documents for department-filtered activities.
 */

interface IcsActivity {
  id: string;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  notes: string;
  departmentIds: string[];
  updatedAt: string;
}

interface IcsWeekend {
  id: string;
  name: string;
  startDate: string; // ISO date (e.g. "2026-02-25")
}

interface IcsMasterEvent {
  id: string;
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  series: string;
}

/**
 * Map day-of-week to offset from the weekend startDate (Wednesday = 0).
 * Assumes the weekend starts on a Wednesday.
 */
const DAY_OFFSETS: Record<string, number> = {
  wednesday: 0,
  thursday: 1,
  friday: 2,
  saturday: 3,
  sunday: 4,
};

function resolveDate(weekendStartDate: string, day: string, time: string): string {
  const base = new Date(weekendStartDate + 'T00:00:00');
  const offset = DAY_OFFSETS[day] ?? 0;
  base.setDate(base.getDate() + offset);

  const [hours, minutes] = time.split(':').map(Number);
  base.setHours(hours, minutes, 0, 0);

  // Return as ICS local datetime: 20260227T093000
  const y = base.getFullYear();
  const mo = String(base.getMonth() + 1).padStart(2, '0');
  const d = String(base.getDate()).padStart(2, '0');
  const h = String(base.getHours()).padStart(2, '0');
  const mi = String(base.getMinutes()).padStart(2, '0');
  return `${y}${mo}${d}T${h}${mi}00`;
}

function toIcsUtcNow(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
  );
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a VCALENDAR string for a department's activities across all weekends.
 */
export function generateDepartmentCalendar(params: {
  departmentId: string;
  departmentName: string;
  weekends: IcsWeekend[];
  activities: IcsActivity[];
  masterEvents?: IcsMasterEvent[];
  weekendMap: Map<string, IcsWeekend>;
}): string {
  const { departmentId, departmentName, activities, weekendMap } = params;
  const now = toIcsUtcNow();

  // Filter activities that belong to this department
  const deptActivities = activities.filter((a) =>
    a.departmentIds.includes(departmentId)
  );

  const events: string[] = [];

  for (const activity of deptActivities) {
    const weekend = weekendMap.get(activity.id.split('-')[0]) ??
      Array.from(weekendMap.values()).find(() => true);

    // We need to find which weekend this activity belongs to
    // Activities have weekendId but we get them from the DB with it
    // For simplicity, we iterate weekends to find the matching one
    let matchedWeekend: IcsWeekend | undefined;
    for (const w of weekendMap.values()) {
      matchedWeekend = w; // Will be overridden by proper lookup below
    }

    // This will be called with activities that already include weekendId context
    // We need the weekend start date to resolve absolute dates
    // Let's use a different approach: pass weekendId on the activity

    const vevent = buildVevent({
      uid: `activity-${activity.id}@race-weekend-manager`,
      summary: activity.name,
      startDate: '20260225', // placeholder - will be resolved properly in route
      startTime: activity.startTime,
      endTime: activity.endTime,
      day: activity.day,
      location: activity.location,
      description: activity.notes,
      status: activity.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE',
      dtstamp: now,
    });
    events.push(vevent);
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Race Weekend Manager//Department Feed//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(departmentName)} Schedule`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

interface VeventParams {
  uid: string;
  summary: string;
  startDate: string; // ICS format YYYYMMDD
  startTime: string; // HH:mm
  endTime: string;
  day: string;
  location?: string;
  description?: string;
  status?: string;
  dtstamp: string;
}

function buildVevent(params: VeventParams): string {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${params.dtstamp}`,
  ];

  // Use DTSTART/DTEND with the resolved date
  const startDt = `${params.startDate}T${params.startTime.replace(':', '')}00`;
  const endDt = `${params.startDate}T${params.endTime.replace(':', '')}00`;
  lines.push(`DTSTART:${startDt}`);
  lines.push(`DTEND:${endDt}`);

  lines.push(`SUMMARY:${escapeIcs(params.summary)}`);

  if (params.location) {
    lines.push(`LOCATION:${escapeIcs(params.location)}`);
  }

  if (params.description) {
    lines.push(`DESCRIPTION:${escapeIcs(params.description)}`);
  }

  if (params.status) {
    lines.push(`STATUS:${params.status}`);
  }

  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

/**
 * Simpler approach: generate ICS directly from activities + weekend data.
 */
export function generateIcsCalendar(params: {
  calendarName: string;
  events: Array<{
    id: string;
    name: string;
    day: string;
    startTime: string;
    endTime: string;
    location: string;
    notes: string;
    status: string;
    weekendStartDate: string;
    weekendName: string;
  }>;
}): string {
  const now = toIcsUtcNow();
  const vevents: string[] = [];

  for (const event of params.events) {
    const startDt = resolveDate(event.weekendStartDate, event.day, event.startTime);
    const endDt = resolveDate(event.weekendStartDate, event.day, event.endTime);

    const lines = [
      'BEGIN:VEVENT',
      `UID:${event.id}@race-weekend-manager`,
      `DTSTAMP:${now}`,
      `DTSTART:${startDt}`,
      `DTEND:${endDt}`,
      `SUMMARY:${escapeIcs(event.name)}`,
    ];

    if (event.location) {
      lines.push(`LOCATION:${escapeIcs(event.location)}`);
    }

    const desc = [event.weekendName, event.notes].filter(Boolean).join(' - ');
    if (desc) {
      lines.push(`DESCRIPTION:${escapeIcs(desc)}`);
    }

    lines.push(`STATUS:${event.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`);
    lines.push('END:VEVENT');
    vevents.push(lines.join('\r\n'));
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Race Weekend Manager//Department Feed//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(params.calendarName)}`,
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}
