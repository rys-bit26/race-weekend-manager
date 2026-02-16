import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { createMasterEventSchema, bulkCreateMasterEventsSchema } from '@race-weekend/shared';

export const masterEventsRouter = new Hono();

// GET /api/weekends/:weekendId/master-events
masterEventsRouter.get('/weekends/:weekendId/master-events', async (c) => {
  const weekendId = c.req.param('weekendId');
  const rows = await db
    .select()
    .from(schema.masterEvents)
    .where(eq(schema.masterEvents.weekendId, weekendId))
    .orderBy(schema.masterEvents.day, schema.masterEvents.startTime);
  return c.json(rows);
});

// POST /api/weekends/:weekendId/master-events — bulk create (from PDF import)
masterEventsRouter.post('/weekends/:weekendId/master-events', async (c) => {
  const weekendId = c.req.param('weekendId');
  const body = await c.req.json();
  const parsed = bulkCreateMasterEventsSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  // Clear existing master events for this weekend
  await db.delete(schema.masterEvents).where(eq(schema.masterEvents.weekendId, weekendId));

  const events = parsed.data.events.map((event) => ({
    id: crypto.randomUUID(),
    weekendId,
    ...event,
  }));

  if (events.length > 0) {
    await db.insert(schema.masterEvents).values(events);
  }

  return c.json(events, 201);
});

// DELETE /api/weekends/:weekendId/master-events — clear all
masterEventsRouter.delete('/weekends/:weekendId/master-events', async (c) => {
  const weekendId = c.req.param('weekendId');
  await db.delete(schema.masterEvents).where(eq(schema.masterEvents.weekendId, weekendId));
  return c.json({ deleted: true });
});
