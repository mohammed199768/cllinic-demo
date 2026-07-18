import { z } from 'zod';
import { observationTypeSchema } from './enums';

export const observationCreateSchema = z.object({
  type: observationTypeSchema,
  measuredAt: z.string().optional(), // ISO datetime; server defaults to now
  valuePrimary: z.coerce.number(),
  valueSecondary: z.coerce.number().optional(),
  unit: z.string().trim().min(1).max(20),
  context: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
  visitId: z.string().optional(),
});
export type ObservationCreateInput = z.infer<typeof observationCreateSchema>;
export const observationUpdateSchema = observationCreateSchema.partial();
export type ObservationUpdateInput = z.infer<typeof observationUpdateSchema>;

// Default unit hints per type (display only — no clinical classification).
export const OBSERVATION_UNITS: Record<string, string> = {
  HEIGHT: 'cm',
  WEIGHT: 'kg',
  BLOOD_PRESSURE: 'mmHg',
  BLOOD_GLUCOSE: 'mg/dL',
  TEMPERATURE: '°C',
  PULSE: 'bpm',
  OXYGEN_SATURATION: '%',
};
