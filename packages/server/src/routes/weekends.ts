import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { createWeekendSchema, updateWeekendSchema } from '@race-weekend/shared';

export const weekendsRouter = new Hono();

// GET /api/weekends — list all
weekendsRouter.get('/', async (c) => {
  const rows = await db.select().from(schema.raceWeekends).orderBy(schema.raceWeekends.startDate);
  return c.json(rows);
});

// GET /api/weekends/:id — get one
weekendsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [row] = await db.select().from(schema.raceWeekends).where(eq(schema.raceWeekends.id, id));
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// POST /api/weekends — create
weekendsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createWeekendSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const now = new Date().toISOString();
  const weekend = {
    id: crypto.randomUUID(),
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(schema.raceWeekends).values(weekend);
  return c.json(weekend, 201);
});

// PUT /api/weekends/:id — update
weekendsRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateWeekendSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const [existing] = await db.select().from(schema.raceWeekends).where(eq(schema.raceWeekends.id, id));
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const updated = {
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  await db.update(schema.raceWeekends).set(updated).where(eq(schema.raceWeekends.id, id));
  return c.json({ ...existing, ...updated });
});

// DELETE /api/weekends/:id
weekendsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const [existing] = await db.select().from(schema.raceWeekends).where(eq(schema.raceWeekends.id, id));
  if (!existing) return c.json({ error: 'Not found' }, 404);

  await db.delete(schema.raceWeekends).where(eq(schema.raceWeekends.id, id));
  return c.json({ deleted: true });
});
