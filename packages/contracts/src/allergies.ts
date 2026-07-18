import { z } from 'zod';

export const allergyCreateSchema = z.object({
  substance: z.string().trim().min(1).max(200),
  reaction: z.string().trim().max(500).optional(),
  severity: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type AllergyCreateInput = z.infer<typeof allergyCreateSchema>;
export const allergyUpdateSchema = allergyCreateSchema.partial();
export type AllergyUpdateInput = z.infer<typeof allergyUpdateSchema>;
