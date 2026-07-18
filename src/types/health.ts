/**
 * OurClinic Health Companion — local health data models.
 *
 * These are original, simplified TypeScript models. They were informed by the
 * structure of the Open mHealth blood-pressure and blood-glucose concepts
 * (systolic/diastolic, unit values, temporal relationship to meal) but do not
 * copy any schema file, code, or tooling. Everything here is local-first: no
 * value in this file is ever transmitted to a server.
 */

/** ISO-8601 datetime string, e.g. "2026-07-10T08:30". */
export type IsoDateTime = string;

/** Active interface language. */
export type Lang = "ar" | "en";

/** Shared bilingual text shape used across the site. */
export type Bilingual = { ar: string; en: string };

/** Fields every stored record carries. */
export interface RecordMeta {
  /** Stable client-generated identifier. */
  id: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

/* ------------------------------------------------------------------ */
/* Blood pressure                                                      */
/* ------------------------------------------------------------------ */

export type BloodPressureArm = "left" | "right";
export type BodyPosition = "sitting" | "standing" | "lying";

export interface BloodPressureReading extends RecordMeta {
  measuredAt: IsoDateTime;
  /** Systolic pressure in mmHg. */
  systolic: number;
  /** Diastolic pressure in mmHg. */
  diastolic: number;
  /** Pulse in beats per minute. */
  pulse?: number;
  arm?: BloodPressureArm;
  bodyPosition?: BodyPosition;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/* Blood glucose                                                       */
/* ------------------------------------------------------------------ */

export type GlucoseUnit = "mg/dL" | "mmol/L";
export type MealContext =
  | "fasting"
  | "before-meal"
  | "after-meal"
  | "bedtime"
  | "other";

export interface BloodGlucoseReading extends RecordMeta {
  measuredAt: IsoDateTime;
  /** Numeric value as displayed by the patient's device, in `unit`. */
  value: number;
  unit: GlucoseUnit;
  mealContext: MealContext;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/* Medications                                                         */
/* ------------------------------------------------------------------ */

export interface Medication extends RecordMeta {
  name: string;
  dose?: string;
  unit?: string;
  /** Free-text frequency, e.g. "مرة يومياً" / "Once daily". */
  frequency: string;
  /** Times of day as HH:MM strings, e.g. ["08:00", "20:00"]. */
  scheduledTimes: string[];
  purpose?: string;
  prescribingClinician?: string;
  notes?: string;
  active: boolean;
}

/* ------------------------------------------------------------------ */
/* Visit preparation                                                   */
/* ------------------------------------------------------------------ */

export interface VisitPreparation {
  /** Local calendar date as YYYY-MM-DD. */
  appointmentDate?: string;
  /** Local appointment time as HH:MM in 24-hour storage format. */
  appointmentTime?: string;
  mainConcern: string;
  symptomsToDiscuss: string;
  symptomsStarted?: string;
  recentChanges: string;
  questionsForClinician: string;
  medicationsToReview: string;
  filesToBring: string;
  personalGoals: string;
  notes: string;
  updatedAt: IsoDateTime;
}

export function emptyVisitPreparation(now: IsoDateTime): VisitPreparation {
  return {
    appointmentDate: "",
    appointmentTime: "",
    mainConcern: "",
    symptomsToDiscuss: "",
    symptomsStarted: "",
    recentChanges: "",
    questionsForClinician: "",
    medicationsToReview: "",
    filesToBring: "",
    personalGoals: "",
    notes: "",
    updatedAt: now,
  };
}

/* ------------------------------------------------------------------ */
/* Patient profile (optional, for printed summaries only)              */
/* ------------------------------------------------------------------ */

export interface PatientProfile {
  displayName?: string;
  dateOfBirth?: IsoDateTime;
  phone?: string;
  chronicConditions?: string;
  allergies?: string;
}

/* ------------------------------------------------------------------ */
/* Root store                                                          */
/* ------------------------------------------------------------------ */

export const HEALTH_STORE_VERSION = 1 as const;

export interface HealthStoreV1 {
  version: typeof HEALTH_STORE_VERSION;
  bloodPressure: BloodPressureReading[];
  bloodGlucose: BloodGlucoseReading[];
  medications: Medication[];
  visitPreparation: VisitPreparation | null;
  patientProfile: PatientProfile | null;
}

/** Keys addressing the array sections of the store. */
export type HealthCollectionKey =
  | "bloodPressure"
  | "bloodGlucose"
  | "medications";
