import { z } from 'zod';

export const medicationCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  dose: z.string().trim().max(120).optional(),
  unit: z.string().trim().max(60).optional(),
  frequency: z.string().trim().max(120).optional(),
  route: z.string().trim().max(120).optional(),
  startedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  prescribedBy: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
  active: z.boolean().default(true),
});
export type MedicationCreateInput = z.infer<typeof medicationCreateSchema>;
export const medicationUpdateSchema = medicationCreateSchema.partial();
export type MedicationUpdateInput = z.infer<typeof medicationUpdateSchema>;
