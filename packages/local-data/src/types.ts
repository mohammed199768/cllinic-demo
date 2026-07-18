export const BOOKING_STATUSES = ['NEW', 'CONFIRMED', 'ARRIVED', 'CONVERTED_TO_VISIT', 'CANCELLED', 'NO_SHOW'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type VisitStatus = 'OPEN' | 'COMPLETED' | 'CANCELLED';
export type SubmissionStatus = 'NEW' | 'IN_REVIEW' | 'CONTACTED' | 'RESOLVED' | 'ARCHIVED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';

export interface Booking {
  id: string;
  publicReference: string;
  patientId?: string;
  visitId?: string;
  fullName: string;
  phone: string;
  requestedService: string;
  requestedDate: string;
  requestedTime: string;
  durationMinutes: number;
  location: 'clinic' | 'home';
  relation?: 'myself' | 'child' | 'family';
  ageGroup?: 'child' | 'adult' | 'senior';
  requestedGender?: 'male' | 'female';
  insurance?: 'yes' | 'no';
  urgency?: 'today' | '24h' | 'normal';
  address?: string;
  arrivalNotes?: string;
  source: 'PUBLIC_WEBSITE' | 'ADMIN' | 'OTHER';
  status: BookingStatus;
  message?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  arrivedAt?: string;
  convertedAt?: string;
}

export interface Patient {
  id: string;
  medicalRecordNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  phone: string;
  secondaryPhone?: string;
  dateOfBirth?: string;
  gender: Gender;
  bloodType?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  generalNotes?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  visitNumber: string;
  patientId: string;
  bookingId?: string;
  status: VisitStatus;
  visitDate: string;
  chiefComplaint?: string;
  symptoms?: string;
  symptomsStartedAt?: string;
  medicalHistory?: string;
  examinationNotes?: string;
  assessment?: string;
  diagnosisText?: string;
  treatmentPlan?: string;
  followUpInstructions?: string;
  internalNotes?: string;
  followUpAt?: string;
  completedAt?: string;
  reopenedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Condition {
  id: string;
  patientId: string;
  name: string;
  status: 'ACTIVE' | 'CONTROLLED' | 'RESOLVED' | 'UNKNOWN';
  diagnosedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Allergy {
  id: string;
  patientId: string;
  substance: string;
  reaction?: string;
  severity?: string;
  notes?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dose?: string;
  unit?: string;
  frequency?: string;
  route?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export type ObservationType = 'HEIGHT' | 'WEIGHT' | 'BLOOD_PRESSURE' | 'BLOOD_GLUCOSE' | 'TEMPERATURE' | 'PULSE' | 'OXYGEN_SATURATION';
export interface Observation {
  id: string;
  patientId: string;
  visitId?: string;
  type: ObservationType;
  measuredAt: string;
  valuePrimary: number;
  valueSecondary?: number;
  unit: string;
  context?: string;
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dose?: string;
  unit?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  visitId: string;
  notes?: string;
  items: PrescriptionItem[];
  updatedAt: string;
}

export interface Submission {
  id: string;
  type: 'CHILD_FORM' | 'GENERAL_MESSAGE' | 'OTHER';
  status: SubmissionStatus;
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  source: string;
  internalNote?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  descriptionAr: string;
  descriptionEn: string;
  createdAt: string;
}

export interface DatabaseSnapshot {
  schemaVersion: number;
  seedVersion: string;
  counters: { booking: number; patient: number; visit: number };
  bookings: Booking[];
  patients: Patient[];
  visits: Visit[];
  conditions: Condition[];
  allergies: Allergy[];
  medications: Medication[];
  observations: Observation[];
  prescriptions: Prescription[];
  submissions: Submission[];
  activities: Activity[];
}

export interface BookingInput {
  fullName: string;
  phone: string;
  requestedService: string;
  requestedDate: string;
  requestedTime: string;
  durationMinutes?: number;
  location?: 'clinic' | 'home';
  relation?: Booking['relation'];
  ageGroup?: Booking['ageGroup'];
  requestedGender?: Booking['requestedGender'];
  insurance?: Booking['insurance'];
  urgency?: Booking['urgency'];
  address?: string;
  arrivalNotes?: string;
  source?: Booking['source'];
  message?: string;
  internalNotes?: string;
}

export type PatientInput = Omit<Patient, 'id' | 'medicalRecordNumber' | 'fullName' | 'createdAt' | 'updatedAt'>;
export type VisitPatch = Partial<Omit<Visit, 'id' | 'visitNumber' | 'patientId' | 'bookingId' | 'createdAt' | 'updatedAt'>>;
