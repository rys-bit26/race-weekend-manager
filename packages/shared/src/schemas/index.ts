import { z } from 'zod';

// ── Day / Series / Status enums ──

export const dayOfWeekSchema = z.enum([
  'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]);

export const seriesTypeSchema = z.enum([
  'INDYCAR', 'INDY_NXT', 'USF2000', 'MX5_CUP', 'NCTS', 'SUPPORT', 'GENERAL',
]);

export const activityStatusSchema = z.enum(['pending', 'confirmed']);

export const departmentIdSchema = z.enum([
  'social-content', 'communications', 'brand-experiences', 'sales',
  'partnerships', 'drivers', 'photography', 'executives',
]);

// ── Time validation (HH:mm) ──

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
export const timeSchema = z.string().regex(timeRegex, 'Must be HH:mm format');

// ── Race Weekend ──

export const createWeekendSchema = z.object({
  name: z.string().min(1).max(200),
  trackName: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  startDate: z.string().date(),
  endDate: z.string().date(),
});

export const updateWeekendSchema = createWeekendSchema.partial();

// ── Master Schedule Event ──

export const createMasterEventSchema = z.object({
  day: dayOfWeekSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  title: z.string().min(1).max(500),
  series: seriesTypeSchema,
  description: z.string().max(2000).optional(),
  rawText: z.string().default(''),
  confidence: z.number().min(0).max(1).default(1),
});

export const bulkCreateMasterEventsSchema = z.object({
  events: z.array(createMasterEventSchema).min(1),
});

// ── Activity ──

export const createActivitySchema = z.object({
  name: z.string().min(1).max(500),
  departmentIds: z.array(departmentIdSchema).min(1),
  personIds: z.array(z.string()),
  day: dayOfWeekSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  location: z.string().max(200).default(''),
  status: activityStatusSchema.default('pending'),
  notes: z.string().max(5000).default(''),
});

export const updateActivitySchema = createActivitySchema.partial();

// ── Person ──

const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;

export const personBaseSchema = z.object({
  name: z.string().min(1).max(200),
  departmentId: departmentIdSchema,
  role: z.string().max(200).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phoneNumber: z.string().regex(phoneRegex, 'Invalid phone number format').optional().or(z.literal('')),
  smsOptIn: z.boolean().optional().default(false),
});

export const createPersonSchema = personBaseSchema.refine(
  (data) => !data.smsOptIn || (data.phoneNumber && data.phoneNumber.length > 0),
  { message: 'Phone number is required when SMS opt-in is enabled', path: ['phoneNumber'] }
);

export const updatePersonSchema = personBaseSchema.partial();

// ── Type exports for convenience ──

export type CreateWeekendInput = z.infer<typeof createWeekendSchema>;
export type UpdateWeekendInput = z.infer<typeof updateWeekendSchema>;
export type CreateMasterEventInput = z.infer<typeof createMasterEventSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
