import { z } from 'zod';

export const visitUpdateSchema = z.object({
  visitDate: z.string().optional(),
  chiefComplaint: z.string().trim().max(500).optional(),
  symptoms: z.string().trim().max(4000).optional(),
  symptomsStartedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  medicalHistory: z.string().trim().max(4000).optional(),
  examinationNotes: z.string().trim().max(4000).optional(),
  assessment: z.string().trim().max(4000).optional(),
  diagnosisText: z.string().trim().max(2000).optional(),
  treatmentPlan: z.string().trim().max(4000).optional(),
  followUpInstructions: z.string().trim().max(2000).optional(),
  internalNotes: z.string().trim().max(2000).optional(),
  followUpAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
});
export type VisitUpdateInput = z.infer<typeof visitUpdateSchema>;

export const visitListQuerySchema = z.object({
  status: z.enum(['OPEN', 'COMPLETED', 'CANCELLED']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  q: z.string().trim().max(120).optional(),
  linked: z.enum(['linked', 'unlinked', 'all']).default('all'),
  followUp: z.enum(['all', 'due', 'scheduled']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  order: z.enum(['asc', 'desc']).default('desc'),
});
export type VisitListQuery = z.infer<typeof visitListQuerySchema>;

export const visitReopenSchema = z.object({ reason: z.string().trim().min(3).max(500) });
export type VisitReopenInput = z.infer<typeof visitReopenSchema>;
export const visitCancelSchema = z.object({ reason: z.string().trim().min(3).max(500) });
export type VisitCancelInput = z.infer<typeof visitCancelSchema>;
