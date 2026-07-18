import { z } from 'zod';

export const prescriptionUpsertSchema = z.object({
  notes: z.string().trim().max(2000).optional(),
});
export type PrescriptionUpsertInput = z.infer<typeof prescriptionUpsertSchema>;

export const prescriptionItemSchema = z.object({
  medicationName: z.string().trim().min(1).max(200),
  dose: z.string().trim().max(120).optional(),
  unit: z.string().trim().max(60).optional(),
  route: z.string().trim().max(120).optional(),
  frequency: z.string().trim().max(120).optional(),
  duration: z.string().trim().max(120).optional(),
  instructions: z.string().trim().max(1000).optional(),
});
export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>;
export const prescriptionItemUpdateSchema = prescriptionItemSchema.partial();
export type PrescriptionItemUpdateInput = z.infer<typeof prescriptionItemUpdateSchema>;
