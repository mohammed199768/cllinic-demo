import { z } from 'zod';
import { conditionStatusSchema } from './enums';

export const conditionCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  status: conditionStatusSchema.default('ACTIVE'),
  diagnosedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type ConditionCreateInput = z.infer<typeof conditionCreateSchema>;
export const conditionUpdateSchema = conditionCreateSchema.partial();
export type ConditionUpdateInput = z.infer<typeof conditionUpdateSchema>;
