import { z } from 'zod';
import { publicSubmissionStatusSchema, publicSubmissionTypeSchema } from './enums';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal('')).transform((value) => value || undefined);
const common = {
  idempotencyKey: z.string().trim().min(8).max(120),
  locale: z.enum(['ar', 'en']).default('ar'),
  website: z.string().max(0).optional(),
};

export const childSubmissionSchema = z.object({
  childName: z.string().trim().min(1).max(160),
  gameName: z.string().trim().min(1).max(160),
  score: optionalText(120),
  levelLabel: optionalText(160),
  date: dateSchema.optional(),
  ...common,
}).strict();
export type ChildSubmissionInput = z.infer<typeof childSubmissionSchema>;

export const generalSubmissionSchema = z.object({
  kind: z.enum(['CONTACT', 'NEWSLETTER', 'GENERAL']).default('CONTACT'),
  name: optionalText(160),
  phone: optionalText(30),
  email: z.string().trim().email().max(254).optional().or(z.literal('')).transform((value) => value || undefined),
  subject: optionalText(200),
  message: optionalText(4000),
  source: z.enum(['CONTACT_PAGE', 'SITE_FOOTER', 'OTHER']).default('CONTACT_PAGE'),
  ...common,
}).strict().superRefine((value, ctx) => {
  if (value.kind === 'NEWSLETTER') {
    if (!value.email) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: 'Email is required' });
    return;
  }
  if (!value.name) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: 'Name is required' });
  if (!value.message) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['message'], message: 'Message is required' });
  if (!value.phone && !value.email) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: 'Phone or email is required' });
});
export type GeneralSubmissionInput = z.infer<typeof generalSubmissionSchema>;

export const submissionListQuerySchema = z.object({
  type: publicSubmissionTypeSchema.optional(),
  status: publicSubmissionStatusSchema.optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  order: z.enum(['asc', 'desc']).default('desc'),
});
export type SubmissionListQuery = z.infer<typeof submissionListQuerySchema>;

export const submissionUpdateSchema = z.object({
  status: publicSubmissionStatusSchema.optional(),
  internalNote: optionalText(4000),
}).refine((value) => value.status !== undefined || value.internalNote !== undefined, { message: 'No changes supplied' });
export type SubmissionUpdateInput = z.infer<typeof submissionUpdateSchema>;
