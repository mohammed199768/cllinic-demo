import { z } from 'zod';
import { genderSchema } from './enums';

const optStr = z.string().trim().max(500).optional().or(z.literal('')).transform((v) => (v ? v : undefined));

export const patientCreateSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  middleName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(6).max(30),
  secondaryPhone: optStr,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  gender: genderSchema.default('UNSPECIFIED'),
  bloodType: optStr,
  address: optStr,
  emergencyContactName: optStr,
  emergencyContactPhone: optStr,
  generalNotes: z.string().trim().max(4000).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
});
export type PatientCreateInput = z.infer<typeof patientCreateSchema>;

export const patientUpdateSchema = patientCreateSchema.partial();
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;

export const patientSearchSchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(['active', 'archived', 'all']).default('active'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  order: z.enum(['asc', 'desc']).default('desc'),
});
export type PatientSearchQuery = z.infer<typeof patientSearchSchema>;

export interface PatientListItem {
  id: string;
  medicalRecordNumber: string;
  fullName: string;
  phone: string;
  dateOfBirth: string | null;
  gender: string;
  lastVisitAt: string | null;
  openVisits: number;
  archivedAt: string | null;
}
