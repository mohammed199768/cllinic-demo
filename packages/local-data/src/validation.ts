import { z } from 'zod';
import { BOOKING_STATUSES, type DatabaseSnapshot } from './types';

const iso = z.string().min(10);
const booking = z.object({
  id: z.string().min(1), publicReference: z.string().min(1), patientId: z.string().optional(), visitId: z.string().optional(),
  fullName: z.string().min(2), phone: z.string().min(6), requestedService: z.string().min(1), requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  requestedTime: z.string().regex(/^\d{2}:\d{2}$/), durationMinutes: z.number().int().positive(), location: z.enum(['clinic', 'home']),
  relation: z.enum(['myself', 'child', 'family']).optional(), ageGroup: z.enum(['child', 'adult', 'senior']).optional(), requestedGender: z.enum(['male', 'female']).optional(), insurance: z.enum(['yes', 'no']).optional(), urgency: z.enum(['today', '24h', 'normal']).optional(), address: z.string().optional(), arrivalNotes: z.string().optional(),
  source: z.enum(['PUBLIC_WEBSITE', 'ADMIN', 'OTHER']), status: z.enum(BOOKING_STATUSES), message: z.string().optional(), internalNotes: z.string().optional(),
  createdAt: iso, updatedAt: iso, arrivedAt: iso.optional(), convertedAt: iso.optional(),
});
const patient = z.object({
  id: z.string(), medicalRecordNumber: z.string(), firstName: z.string(), middleName: z.string().optional(), lastName: z.string(), fullName: z.string(),
  phone: z.string(), secondaryPhone: z.string().optional(), dateOfBirth: z.string().optional(), gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED']),
  bloodType: z.string().optional(), address: z.string().optional(), emergencyContactName: z.string().optional(), emergencyContactPhone: z.string().optional(),
  generalNotes: z.string().optional(), archivedAt: iso.optional(), createdAt: iso, updatedAt: iso,
});
const visit = z.object({
  id: z.string(), visitNumber: z.string(), patientId: z.string(), bookingId: z.string().optional(), status: z.enum(['OPEN', 'COMPLETED', 'CANCELLED']),
  visitDate: iso, chiefComplaint: z.string().optional(), symptoms: z.string().optional(), symptomsStartedAt: z.string().optional(), medicalHistory: z.string().optional(),
  examinationNotes: z.string().optional(), assessment: z.string().optional(), diagnosisText: z.string().optional(), treatmentPlan: z.string().optional(),
  followUpInstructions: z.string().optional(), internalNotes: z.string().optional(), followUpAt: z.string().optional(), completedAt: iso.optional(), reopenedReason: z.string().optional(),
  createdAt: iso, updatedAt: iso,
});
const condition = z.object({ id: z.string(), patientId: z.string(), name: z.string(), status: z.enum(['ACTIVE', 'CONTROLLED', 'RESOLVED', 'UNKNOWN']), diagnosedAt: z.string().optional(), notes: z.string().optional(), createdAt: iso });
const allergy = z.object({ id: z.string(), patientId: z.string(), substance: z.string(), reaction: z.string().optional(), severity: z.string().optional(), notes: z.string().optional(), createdAt: iso });
const medication = z.object({ id: z.string(), patientId: z.string(), name: z.string(), dose: z.string().optional(), unit: z.string().optional(), frequency: z.string().optional(), route: z.string().optional(), notes: z.string().optional(), active: z.boolean(), createdAt: iso });
const observation = z.object({ id: z.string(), patientId: z.string(), visitId: z.string().optional(), type: z.enum(['HEIGHT', 'WEIGHT', 'BLOOD_PRESSURE', 'BLOOD_GLUCOSE', 'TEMPERATURE', 'PULSE', 'OXYGEN_SATURATION']), measuredAt: iso, valuePrimary: z.number(), valueSecondary: z.number().optional(), unit: z.string(), context: z.string().optional(), notes: z.string().optional() });
const prescriptionItem = z.object({ id: z.string(), medicationName: z.string(), dose: z.string().optional(), unit: z.string().optional(), route: z.string().optional(), frequency: z.string().optional(), duration: z.string().optional(), instructions: z.string().optional() });
const prescription = z.object({ id: z.string(), visitId: z.string(), notes: z.string().optional(), items: z.array(prescriptionItem), updatedAt: iso });
const submission = z.object({ id: z.string(), type: z.enum(['CHILD_FORM', 'GENERAL_MESSAGE', 'OTHER']), status: z.enum(['NEW', 'IN_REVIEW', 'CONTACTED', 'RESOLVED', 'ARCHIVED']), name: z.string().optional(), phone: z.string().optional(), email: z.string().optional(), subject: z.string().optional(), message: z.string().optional(), source: z.string(), internalNote: z.string().optional(), payload: z.record(z.unknown()).optional(), createdAt: iso, updatedAt: iso });
const activity = z.object({ id: z.string(), action: z.string(), entityType: z.string(), entityId: z.string().optional(), descriptionAr: z.string(), descriptionEn: z.string(), createdAt: iso });

export const snapshotSchema: z.ZodType<DatabaseSnapshot> = z.object({
  schemaVersion: z.number().int().positive(), seedVersion: z.string(), counters: z.object({ booking: z.number().int().nonnegative(), patient: z.number().int().nonnegative(), visit: z.number().int().nonnegative() }),
  bookings: z.array(booking), patients: z.array(patient), visits: z.array(visit), conditions: z.array(condition), allergies: z.array(allergy),
  medications: z.array(medication), observations: z.array(observation), prescriptions: z.array(prescription), submissions: z.array(submission), activities: z.array(activity),
});

export function validateSnapshot(input: unknown): DatabaseSnapshot {
  const data = snapshotSchema.parse(input);
  const patientIds = new Set(data.patients.map((item) => item.id));
  const visitIds = new Set(data.visits.map((item) => item.id));
  const bookingIds = new Set(data.bookings.map((item) => item.id));
  const fail = (message: string): never => { throw new Error(message); };
  if (new Set(data.bookings.map((item) => item.publicReference)).size !== data.bookings.length) fail('Duplicate booking reference.');
  if (new Set(data.patients.map((item) => item.medicalRecordNumber)).size !== data.patients.length) fail('Duplicate medical record number.');
  if (new Set(data.visits.map((item) => item.bookingId).filter(Boolean)).size !== data.visits.filter((item) => item.bookingId).length) fail('A booking is linked to more than one visit.');
  data.bookings.forEach((item) => {
    if (item.patientId && !patientIds.has(item.patientId)) fail(`Booking ${item.id} has an invalid patient.`);
    if (item.visitId && !visitIds.has(item.visitId)) fail(`Booking ${item.id} has an invalid visit.`);
  });
  data.visits.forEach((item) => {
    if (!patientIds.has(item.patientId)) fail(`Visit ${item.id} has an invalid patient.`);
    if (item.bookingId && !bookingIds.has(item.bookingId)) fail(`Visit ${item.id} has an invalid booking.`);
  });
  [...data.conditions, ...data.allergies, ...data.medications, ...data.observations].forEach((item) => {
    if (!patientIds.has(item.patientId)) fail(`Related record ${item.id} has an invalid patient.`);
  });
  data.observations.forEach((item) => { if (item.visitId && !visitIds.has(item.visitId)) fail(`Observation ${item.id} has an invalid visit.`); });
  data.prescriptions.forEach((item) => { if (!visitIds.has(item.visitId)) fail(`Prescription ${item.id} has an invalid visit.`); });
  return data;
}
