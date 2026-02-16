import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { createActivitySchema, updateActivitySchema } from '@race-weekend/shared';
import { notifyActivityChanges } from '../services/notifications.js';

export const activitiesRouter = new Hono();

// GET /api/weekends/:weekendId/activities
activitiesRouter.get('/weekends/:weekendId/activities', async (c) => {
  const weekendId = c.req.param('weekendId');
  const rows = await db
    .select()
    .from(schema.activities)
    .where(eq(schema.activities.weekendId, weekendId))
    .orderBy(schema.activities.day, schema.activities.startTime);
  return c.json(rows);
});

// POST /api/weekends/:weekendId/activities
activitiesRouter.post('/weekends/:weekendId/activities', async (c) => {
  const weekendId = c.req.param('weekendId');
  const body = await c.req.json();
  const parsed = createActivitySchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const now = new Date().toISOString();
  const activity = {
    id: crypto.randomUUID(),
    weekendId,
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(schema.activities).values(activity);
  return c.json(activity, 201);
});

// PUT /api/activities/:id
activitiesRouter.put('/activities/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateActivitySchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const [existing] = await db
    .select()
    .from(schema.activities)
    .where(eq(schema.activities.id, id));
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const updated = {
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  await db.update(schema.activities).set(updated).where(eq(schema.activities.id, id));

  // Return the full updated activity
  const [result] = await db
    .select()
    .from(schema.activities)
    .where(eq(schema.activities.id, id));

  // Fire-and-forget: send change notifications to assigned people
  notifyActivityChanges(existing as any, result as any).catch((err) =>
    console.error('Notification dispatch failed:', err)
  );

  return c.json(result);
});

// DELETE /api/activities/:id
activitiesRouter.delete('/activities/:id', async (c) => {
  const id = c.req.param('id');
  const [existing] = await db
    .select()
    .from(schema.activities)
    .where(eq(schema.activities.id, id));
  if (!existing) return c.json({ error: 'Not found' }, 404);

  await db.delete(schema.activities).where(eq(schema.activities.id, id));
  return c.json({ deleted: true });
});
