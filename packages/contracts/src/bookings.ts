import { z } from 'zod';
import { bookingSourceSchema, bookingStatusSchema } from './enums';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal('')).transform((value) => value || undefined);

export const bookingCreateSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(6).max(30),
  requestedService: z.string().trim().min(1).max(160),
  requestedDate: dateSchema,
  requestedTime: timeSchema.default('09:00'),
  durationMinutes: z.coerce.number().int().min(10).max(480).default(30),
  message: optionalText(2000),
  internalNotes: optionalText(4000),
  source: bookingSourceSchema.default('ADMIN'),
  overrideConflicts: z.boolean().default(false),
});
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

export const bookingUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(160).optional(),
  phone: z.string().trim().min(6).max(30).optional(),
  requestedService: z.string().trim().min(1).max(160).optional(),
  requestedDate: dateSchema.optional(),
  requestedTime: timeSchema.optional(),
  durationMinutes: z.coerce.number().int().min(10).max(480).optional(),
  message: optionalText(2000),
  internalNotes: optionalText(4000),
  overrideConflicts: z.boolean().default(false),
});
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;

export const bookingStatusUpdateSchema = z.object({
  status: bookingStatusSchema,
  reason: z.string().trim().max(500).optional(),
});
export type BookingStatusUpdateInput = z.infer<typeof bookingStatusUpdateSchema>;

export const bookingListQuerySchema = z.object({
  status: bookingStatusSchema.optional(),
  service: z.string().trim().max(160).optional(),
  date: dateSchema.optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  q: z.string().trim().max(120).optional(),
  linked: z.enum(['linked', 'unlinked', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['createdAt', 'scheduledStartAt', 'status']).default('scheduledStartAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
export type BookingListQuery = z.infer<typeof bookingListQuerySchema>;

export const linkPatientSchema = z.object({ patientId: z.string().min(1) });
export type LinkPatientInput = z.infer<typeof linkPatientSchema>;

export const convertBookingSchema = z
  .object({
    patientMode: z.enum(['existing', 'create']),
    existingPatientId: z.string().optional(),
    newPatient: z
      .object({
        firstName: z.string().trim().min(1).max(80),
        middleName: z.string().trim().min(1).max(80),
        lastName: z.string().trim().min(1).max(80),
        phone: z.string().trim().min(6).max(30),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED']).optional(),
      })
      .optional(),
    confirmDuplicate: z.boolean().default(false),
  })
  .refine((v) => (v.patientMode === 'existing' ? !!v.existingPatientId : !!v.newPatient), {
    message: 'existingPatientId or newPatient is required',
  });
export type ConvertBookingInput = z.infer<typeof convertBookingSchema>;

export const publicBookingSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(6).max(30),
  requestedService: z.string().trim().min(1).max(160),
  requestedDate: dateSchema,
  requestedTime: timeSchema,
  location: z.enum(['clinic', 'home']),
  relation: z.enum(['myself', 'child', 'family']),
  ageGroup: z.enum(['child', 'adult', 'senior']),
  gender: z.enum(['male', 'female']),
  insurance: z.enum(['yes', 'no']),
  urgency: z.enum(['today', '24h', 'normal']),
  geo: optionalText(100),
  address: optionalText(500),
  arrivalNotes: optionalText(1000),
  message: optionalText(2000),
  locale: z.enum(['ar', 'en']).default('ar'),
  idempotencyKey: z.string().trim().min(8).max(120),
  website: z.string().max(0).optional(),
}).strict();
export type PublicBookingInput = z.infer<typeof publicBookingSchema>;

export const availabilityQuerySchema = z.object({ date: dateSchema });
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

export interface MatchCandidate {
  patientId: string;
  medicalRecordNumber: string;
  fullName: string;
  phone: string;
  dateOfBirth: string | null;
  lastVisitAt: string | null;
  reasonCode: 'EXACT_PHONE' | 'MRN' | 'SIMILAR_NAME' | 'PHONE_SUFFIX';
  reasonLabelEn: string;
  reasonLabelAr: string;
  strength: 'strong' | 'medium' | 'suggestion';
}
