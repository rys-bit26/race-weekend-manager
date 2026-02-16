import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { createPersonSchema, updatePersonSchema } from '@race-weekend/shared';

export const peopleRouter = new Hono();

// GET /api/people
peopleRouter.get('/', async (c) => {
  const rows = await db.select().from(schema.people).orderBy(schema.people.name);
  return c.json(rows);
});

// GET /api/people/:id
peopleRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [row] = await db.select().from(schema.people).where(eq(schema.people.id, id));
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// POST /api/people
peopleRouter.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createPersonSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const person = {
    id: crypto.randomUUID(),
    ...parsed.data,
    email: parsed.data.email || null,
    phoneNumber: parsed.data.phoneNumber || null,
  };

  await db.insert(schema.people).values(person);
  return c.json(person, 201);
});

// PUT /api/people/:id
peopleRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updatePersonSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const [existing] = await db.select().from(schema.people).where(eq(schema.people.id, id));
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const updates: Record<string, unknown> = { ...parsed.data };
  // Normalize empty strings to null for DB
  if (updates.email === '') updates.email = null;
  if (updates.phoneNumber === '') updates.phoneNumber = null;

  await db.update(schema.people).set(updates).where(eq(schema.people.id, id));

  const [result] = await db.select().from(schema.people).where(eq(schema.people.id, id));
  return c.json(result);
});

// DELETE /api/people/:id
peopleRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const [existing] = await db.select().from(schema.people).where(eq(schema.people.id, id));
  if (!existing) return c.json({ error: 'Not found' }, 404);

  await db.delete(schema.people).where(eq(schema.people.id, id));
  return c.json({ deleted: true });
});
