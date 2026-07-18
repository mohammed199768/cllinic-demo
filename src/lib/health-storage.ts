/**
 * Centralized local-first storage adapter for the OurClinic Health Companion.
 *
 * Design goals:
 *  - One versioned key holds the entire store.
 *  - Safe JSON parsing with invalid-data recovery (never throws to the UI).
 *  - A migration hook so future versions can upgrade older payloads.
 *  - A tiny pub/sub so every open tool page stays in sync (same tab + cross tab).
 *  - A clean seam: swap `readRaw`/`writeRaw` for a backend later without
 *    touching any component. No health value is ever logged or put in a URL.
 */

import {
  HEALTH_STORE_VERSION,
  type BloodGlucoseReading,
  type BloodPressureReading,
  type HealthStoreV1,
  type HealthCollectionKey,
  type Medication,
  type PatientProfile,
  type VisitPreparation,
} from "@/types/health";
import { createId } from "@ourclinic/local-data/create-id";

export const STORAGE_KEY = "ourClinic.healthCompanion.v1";

const CHANGE_EVENT = "our-clinic:health-store-change";

export function emptyStore(): HealthStoreV1 {
  return {
    version: HEALTH_STORE_VERSION,
    bloodPressure: [],
    bloodGlucose: [],
    medications: [],
    visitPreparation: null,
    patientProfile: null,
  };
}

/** True only in a browser with a usable localStorage. */
function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/**
 * Migration hook. Given any parsed object of unknown shape/version, produce a
 * valid current-version store. Unknown or corrupt data recovers to an empty
 * store rather than surfacing an error to the patient.
 */
const isString = (value: unknown): value is string => typeof value === "string";
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const hasOnlyKeys = (value: Record<string, unknown>, allowed: string[]): boolean =>
  Object.keys(value).every((key) => allowed.includes(key));
const isLocalDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

function isRecordMeta(value: Record<string, unknown>): boolean {
  return isString(value.id) && isString(value.createdAt) && isString(value.updatedAt);
}

function isBloodPressure(value: unknown): value is BloodPressureReading {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    hasOnlyKeys(item, ["id", "measuredAt", "systolic", "diastolic", "pulse", "arm", "bodyPosition", "notes", "createdAt", "updatedAt"]) &&
    isRecordMeta(item) &&
    isString(item.measuredAt) &&
    isFiniteNumber(item.systolic) &&
    isFiniteNumber(item.diastolic) &&
    (item.pulse === undefined || isFiniteNumber(item.pulse)) &&
    (item.arm === undefined || item.arm === "left" || item.arm === "right") &&
    (item.bodyPosition === undefined ||
      item.bodyPosition === "sitting" ||
      item.bodyPosition === "standing" ||
      item.bodyPosition === "lying") &&
    (item.notes === undefined || isString(item.notes))
  );
}

function isBloodGlucose(value: unknown): value is BloodGlucoseReading {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    hasOnlyKeys(item, ["id", "measuredAt", "value", "unit", "mealContext", "notes", "createdAt", "updatedAt"]) &&
    isRecordMeta(item) &&
    isString(item.measuredAt) &&
    isFiniteNumber(item.value) &&
    (item.unit === "mg/dL" || item.unit === "mmol/L") &&
    ["fasting", "before-meal", "after-meal", "bedtime", "other"].includes(
      String(item.mealContext),
    ) &&
    (item.notes === undefined || isString(item.notes))
  );
}

function isMedication(value: unknown): value is Medication {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    hasOnlyKeys(item, ["id", "name", "dose", "unit", "frequency", "scheduledTimes", "purpose", "prescribingClinician", "notes", "active", "createdAt", "updatedAt"]) &&
    isRecordMeta(item) &&
    isString(item.name) &&
    isString(item.frequency) &&
    Array.isArray(item.scheduledTimes) &&
    item.scheduledTimes.every(isString) &&
    typeof item.active === "boolean" &&
    [item.dose, item.unit, item.purpose, item.prescribingClinician, item.notes].every(
      (field) => field === undefined || isString(field),
    )
  );
}

function normalizeVisitPreparation(value: unknown): VisitPreparation | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (
    !hasOnlyKeys(item, ["appointmentDate", "appointmentTime", "mainConcern", "symptomsToDiscuss", "symptomsStarted", "recentChanges", "questionsForClinician", "medicationsToReview", "filesToBring", "personalGoals", "notes", "updatedAt"]) ||
    ![
      "mainConcern",
      "symptomsToDiscuss",
      "recentChanges",
      "questionsForClinician",
      "medicationsToReview",
      "filesToBring",
      "personalGoals",
      "notes",
      "updatedAt",
    ].every((key) => isString(item[key])) ||
    (item.appointmentDate !== undefined && !isString(item.appointmentDate)) ||
    (item.appointmentTime !== undefined && !isString(item.appointmentTime)) ||
    (item.symptomsStarted !== undefined && !isString(item.symptomsStarted))
  ) return null;

  const legacyDateTime = String(item.appointmentDate ?? "");
  const [appointmentDate = "", legacyTime = ""] = legacyDateTime.split("T");
  const appointmentTime = String(item.appointmentTime ?? legacyTime).slice(0, 5);
  if (appointmentDate && !isLocalDate(appointmentDate)) return null;
  if (appointmentTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(appointmentTime)) return null;

  return {
    appointmentDate,
    appointmentTime,
    mainConcern: String(item.mainConcern),
    symptomsToDiscuss: String(item.symptomsToDiscuss),
    symptomsStarted: String(item.symptomsStarted ?? ""),
    recentChanges: String(item.recentChanges),
    questionsForClinician: String(item.questionsForClinician),
    medicationsToReview: String(item.medicationsToReview),
    filesToBring: String(item.filesToBring),
    personalGoals: String(item.personalGoals),
    notes: String(item.notes),
    updatedAt: String(item.updatedAt),
  };
}

function isVisitPreparation(value: unknown): value is VisitPreparation {
  return normalizeVisitPreparation(value) !== null;
}

function isPatientProfile(value: unknown): value is PatientProfile {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return hasOnlyKeys(item, ["displayName", "dateOfBirth", "phone", "chronicConditions", "allergies"]) && [
    item.displayName,
    item.dateOfBirth,
    item.phone,
    item.chronicConditions,
    item.allergies,
  ].every((field) => field === undefined || isString(field));
}

function migrate(input: unknown): HealthStoreV1 {
  const base = emptyStore();
  if (!input || typeof input !== "object") return base;

  const obj = input as Record<string, unknown>;
  const visitPreparation = normalizeVisitPreparation(obj.visitPreparation);

  // Future version branches would go here (e.g. if obj.version === 2 …).
  return {
    version: HEALTH_STORE_VERSION,
    bloodPressure: Array.isArray(obj.bloodPressure)
      ? obj.bloodPressure.filter(isBloodPressure)
      : base.bloodPressure,
    bloodGlucose: Array.isArray(obj.bloodGlucose)
      ? obj.bloodGlucose.filter(isBloodGlucose)
      : base.bloodGlucose,
    medications: Array.isArray(obj.medications)
      ? obj.medications.filter(isMedication)
      : base.medications,
    visitPreparation: visitPreparation ?? base.visitPreparation,
    patientProfile:
      isPatientProfile(obj.patientProfile)
        ? obj.patientProfile
        : base.patientProfile,
  };
}

function readRaw(): string | null {
  if (!hasStorage()) return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeRaw(value: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* Quota or private-mode failures are swallowed; the UI keeps its state. */
  }
}

/** Load and normalize the store. Always returns a valid object. */
export function loadStore(): HealthStoreV1 {
  const raw = readRaw();
  if (!raw) return emptyStore();
  try {
    return migrate(JSON.parse(raw));
  } catch {
    return emptyStore();
  }
}

/** Persist the store and notify subscribers in this tab. */
export function saveStore(store: HealthStoreV1): void {
  writeRaw(JSON.stringify(store));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
}

/** Read → mutate → persist in one atomic step, returning the next store. */
export function updateStore(
  mutator: (draft: HealthStoreV1) => HealthStoreV1,
): HealthStoreV1 {
  const next = mutator(loadStore());
  saveStore(next);
  return next;
}

/** Subscribe to store changes (same tab via custom event, other tabs via storage). */
export function subscribe(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => listener();
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener(CHANGE_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

/* ------------------------------------------------------------------ */
/* Whole-store operations (backup / restore / delete)                  */
/* ------------------------------------------------------------------ */

/** Serialize the whole store for a manual JSON backup file. */
export function exportStoreJson(): string {
  return JSON.stringify(loadStore(), null, 2);
}

export type ImportResult = { ok: true } | { ok: false; error: string };

/** Restore from a JSON backup string, running it through migration/recovery. */
export function importStoreJson(json: string): ImportResult {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "invalid-backup" };
    }
    const obj = parsed as Record<string, unknown>;
    if (obj.version !== HEALTH_STORE_VERSION) {
      return { ok: false, error: "unsupported-version" };
    }
    if (
      !Array.isArray(obj.bloodPressure) ||
      !Array.isArray(obj.bloodGlucose) ||
      !Array.isArray(obj.medications) ||
      !("visitPreparation" in obj) ||
      !("patientProfile" in obj)
    ) {
      return { ok: false, error: "invalid-backup" };
    }
    const migrated = migrate(parsed);
    const suppliedCounts = [obj.bloodPressure, obj.bloodGlucose, obj.medications]
      .filter(Array.isArray)
      .reduce((count, collection) => count + collection.length, 0);
    const validCounts =
      migrated.bloodPressure.length +
      migrated.bloodGlucose.length +
      migrated.medications.length;
    if (suppliedCounts !== validCounts) {
      return { ok: false, error: "invalid-records" };
    }
    if (obj.visitPreparation != null && !isVisitPreparation(obj.visitPreparation)) {
      return { ok: false, error: "invalid-visit" };
    }
    if (obj.patientProfile != null && !isPatientProfile(obj.patientProfile)) {
      return { ok: false, error: "invalid-profile" };
    }
    saveStore(migrated);
    return { ok: true };
  } catch {
    return { ok: false, error: "invalid-json" };
  }
}

/** Erase everything the companion has stored on this device. */
export function clearAll(): void {
  saveStore(emptyStore());
}

/** Erase a single array collection (blood pressure / glucose / medications). */
export function clearCollection(key: HealthCollectionKey): void {
  updateStore((draft) => ({ ...draft, [key]: [] }));
}

/** Erase the visit-preparation form. */
export function clearVisitPreparation(): void {
  updateStore((draft) => ({ ...draft, visitPreparation: null }));
}

/* ------------------------------------------------------------------ */
/* Tool-specific CRUD                                                  */
/* ------------------------------------------------------------------ */

type NewBloodPressure = Omit<BloodPressureReading, "id" | "createdAt" | "updatedAt">;
type NewBloodGlucose = Omit<BloodGlucoseReading, "id" | "createdAt" | "updatedAt">;
type NewMedication = Omit<Medication, "id" | "createdAt" | "updatedAt">;

function timestamps() {
  return new Date().toISOString();
}

export function addBloodPressure(input: NewBloodPressure): BloodPressureReading {
  const now = timestamps();
  const record = { ...input, id: createId(), createdAt: now, updatedAt: now };
  updateStore((store) => ({ ...store, bloodPressure: [record, ...store.bloodPressure] }));
  return record;
}

export function updateBloodPressure(
  id: string,
  input: NewBloodPressure,
): void {
  const now = timestamps();
  updateStore((store) => ({
    ...store,
    bloodPressure: store.bloodPressure.map((item) =>
      item.id === id ? { ...item, ...input, updatedAt: now } : item,
    ),
  }));
}

export function deleteBloodPressure(id: string): void {
  updateStore((store) => ({
    ...store,
    bloodPressure: store.bloodPressure.filter((item) => item.id !== id),
  }));
}

export function addBloodGlucose(input: NewBloodGlucose): BloodGlucoseReading {
  const now = timestamps();
  const record = { ...input, id: createId(), createdAt: now, updatedAt: now };
  updateStore((store) => ({ ...store, bloodGlucose: [record, ...store.bloodGlucose] }));
  return record;
}

export function updateBloodGlucose(id: string, input: NewBloodGlucose): void {
  const now = timestamps();
  updateStore((store) => ({
    ...store,
    bloodGlucose: store.bloodGlucose.map((item) =>
      item.id === id ? { ...item, ...input, updatedAt: now } : item,
    ),
  }));
}

export function deleteBloodGlucose(id: string): void {
  updateStore((store) => ({
    ...store,
    bloodGlucose: store.bloodGlucose.filter((item) => item.id !== id),
  }));
}

export function addMedication(input: NewMedication): Medication {
  const now = timestamps();
  const record = { ...input, id: createId(), createdAt: now, updatedAt: now };
  updateStore((store) => ({ ...store, medications: [record, ...store.medications] }));
  return record;
}

export function updateMedication(id: string, input: Partial<NewMedication>): void {
  const now = timestamps();
  updateStore((store) => ({
    ...store,
    medications: store.medications.map((item) =>
      item.id === id ? { ...item, ...input, updatedAt: now } : item,
    ),
  }));
}

export function deleteMedication(id: string): void {
  updateStore((store) => ({
    ...store,
    medications: store.medications.filter((item) => item.id !== id),
  }));
}

export function saveVisitPreparation(value: VisitPreparation): void {
  updateStore((store) => ({ ...store, visitPreparation: value }));
}

export function savePatientProfile(value: PatientProfile): void {
  updateStore((store) => ({ ...store, patientProfile: value }));
}

/* ------------------------------------------------------------------ */
/* Small utilities                                                     */
/* ------------------------------------------------------------------ */

/** Current local time as a `YYYY-MM-DDTHH:MM` string for datetime-local inputs. */
export function nowLocalInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
