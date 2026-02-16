import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { weekendsRouter } from './routes/weekends.js';
import { activitiesRouter } from './routes/activities.js';
import { masterEventsRouter } from './routes/master-events.js';
import { peopleRouter } from './routes/people.js';
import { calendarRouter } from './routes/calendar.js';
import { sendEmail } from './services/email.js';
import { sendSms } from './services/sms.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowHeaders: ['Content-Type'],
  })
);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.route('/api/weekends', weekendsRouter);
app.route('/api', activitiesRouter);
app.route('/api', masterEventsRouter);
app.route('/api/people', peopleRouter);
app.route('/api/calendar', calendarRouter);

// Test notification endpoint
app.post('/api/notify/test', async (c) => {
  const { email, phone } = await c.req.json();
  const results: Record<string, boolean> = {};

  if (email) {
    results.email = await sendEmail({
      to: email,
      subject: 'Race Weekend Schedule - Test Notification',
      html: '<p>This is a test notification from Race Weekend Schedule Manager. Notifications are working!</p>',
    });
  }

  if (phone) {
    results.sms = await sendSms({
      to: phone,
      body: '[Race Schedule] Test notification - your SMS notifications are working!',
    });
  }

  return c.json({ sent: results });
});

// Start server
const port = Number(process.env.PORT) || 3001;

console.log(`🏁 Race Weekend API starting on port ${port}...`);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🏁 Race Weekend API running at http://localhost:${info.port}`);
});
