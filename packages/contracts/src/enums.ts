import { z } from 'zod';

export const UserRole = { ADMIN: 'ADMIN' } as const;
export const userRoleSchema = z.enum(['ADMIN']);
export type UserRoleType = z.infer<typeof userRoleSchema>;

export const bookingStatusSchema = z.enum([
  'NEW',
  'CONFIRMED',
  'ARRIVED',
  'CONVERTED_TO_VISIT',
  'CANCELLED',
  'NO_SHOW',
]);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

export const bookingSourceSchema = z.enum(['PUBLIC_WEBSITE', 'ADMIN', 'OTHER']);
export type BookingSource = z.infer<typeof bookingSourceSchema>;

export const publicSubmissionTypeSchema = z.enum(['CHILD_FORM', 'GENERAL_MESSAGE', 'OTHER']);
export type PublicSubmissionType = z.infer<typeof publicSubmissionTypeSchema>;

export const publicSubmissionStatusSchema = z.enum(['NEW', 'IN_REVIEW', 'CONTACTED', 'RESOLVED', 'ARCHIVED']);
export type PublicSubmissionStatus = z.infer<typeof publicSubmissionStatusSchema>;

export const operationalEventTypeSchema = z.enum([
  'BOOKING_CREATED',
  'BOOKING_RESCHEDULED',
  'BOOKING_STATUS_CHANGED',
  'PATIENT_CREATED',
  'VISIT_CREATED',
  'VISIT_COMPLETED',
  'PUBLIC_SUBMISSION_CREATED',
  'PUBLIC_SUBMISSION_STATUS_CHANGED',
]);
export type OperationalEventType = z.infer<typeof operationalEventTypeSchema>;

export const visitStatusSchema = z.enum(['OPEN', 'COMPLETED', 'CANCELLED']);
export type VisitStatus = z.infer<typeof visitStatusSchema>;

export const conditionStatusSchema = z.enum([
  'ACTIVE',
  'CONTROLLED',
  'RESOLVED',
  'UNKNOWN',
]);
export type ConditionStatus = z.infer<typeof conditionStatusSchema>;

export const observationTypeSchema = z.enum([
  'HEIGHT',
  'WEIGHT',
  'BLOOD_PRESSURE',
  'BLOOD_GLUCOSE',
  'TEMPERATURE',
  'PULSE',
  'OXYGEN_SATURATION',
]);
export type ObservationType = z.infer<typeof observationTypeSchema>;

export const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED']);
export type Gender = z.infer<typeof genderSchema>;

export const auditActionSchema = z.enum([
  'CREATE',
  'UPDATE',
  'DELETE',
  'ARCHIVE',
  'RESTORE',
  'LOGIN',
  'LOGOUT',
  'STATUS_CHANGE',
  'CONVERT_BOOKING',
  'COMPLETE_VISIT',
  'RESET_DEMO',
]);
export type AuditAction = z.infer<typeof auditActionSchema>;

// Allowed booking status transitions (enforced on API + UI).
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  NEW: ['CONFIRMED', 'ARRIVED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['ARRIVED', 'CANCELLED', 'NO_SHOW'],
  ARRIVED: ['CONVERTED_TO_VISIT', 'CANCELLED', 'NO_SHOW'],
  CONVERTED_TO_VISIT: [],
  CANCELLED: [],
  NO_SHOW: [],
};
