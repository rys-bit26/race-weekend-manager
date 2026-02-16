import { Hono } from 'hono';
import { db, schema } from '../db/index.js';
import { generateIcsCalendar } from '../services/ics-generator.js';

// Department ID to display name mapping
const DEPARTMENT_NAMES: Record<string, string> = {
  'social-content': 'Social & Content',
  'communications': 'Communications',
  'brand-experiences': 'Brand Experiences',
  'sales': 'Sales',
  'partnerships': 'Partnerships',
  'drivers': 'Drivers',
  'photography': 'Photography',
  'executives': 'Executives',
};

export const calendarRouter = new Hono();

/**
 * GET /api/calendar/:departmentId.ics
 *
 * Generates a live ICS calendar feed for a department.
 * Outlook/Google Calendar can subscribe to this URL.
 */
calendarRouter.get('/:filename', async (c) => {
  const filename = c.req.param('filename');

  // Parse department ID from filename (e.g., "social-content.ics" → "social-content")
  const match = filename.match(/^(.+)\.ics$/);
  if (!match) {
    return c.json({ error: 'Invalid calendar URL. Use /api/calendar/{departmentId}.ics' }, 400);
  }

  const departmentId = match[1];
  const departmentName = DEPARTMENT_NAMES[departmentId];

  if (!departmentName) {
    return c.json({
      error: `Unknown department: ${departmentId}`,
      available: Object.keys(DEPARTMENT_NAMES),
    }, 404);
  }

  // Fetch all weekends
  const weekends = await db.select().from(schema.raceWeekends);

  // Fetch all activities that include this department
  const allActivities = await db.select().from(schema.activities);
  const deptActivities = allActivities.filter((a) => {
    const deptIds = a.departmentIds as string[];
    return deptIds.includes(departmentId);
  });

  // Build a weekendId → weekend lookup
  const weekendMap = new Map(weekends.map((w) => [w.id, w]));

  // Build ICS events
  const events = deptActivities.map((a) => {
    const weekend = weekendMap.get(a.weekendId);
    return {
      id: a.id,
      name: a.name,
      day: a.day,
      startTime: a.startTime,
      endTime: a.endTime,
      location: a.location,
      notes: a.notes,
      status: a.status,
      weekendStartDate: weekend?.startDate ?? '2026-02-25',
      weekendName: weekend?.name ?? 'Race Weekend',
    };
  });

  const icsContent = generateIcsCalendar({
    calendarName: `Andretti ${departmentName} Schedule`,
    events,
  });

  // Return as ICS file
  return new Response(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${departmentId}.ics"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
});

/**
 * GET /api/calendar
 *
 * Lists available calendar feed URLs.
 */
calendarRouter.get('/', (c) => {
  const baseUrl = new URL(c.req.url).origin;
  const feeds = Object.entries(DEPARTMENT_NAMES).map(([id, name]) => ({
    departmentId: id,
    departmentName: name,
    url: `${baseUrl}/api/calendar/${id}.ics`,
  }));

  return c.json({ feeds });
});
