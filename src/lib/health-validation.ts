/**
 * Form validation for the health tools.
 *
 * These checks are input-plausibility guards only (is this a number, is a
 * required field filled). They are NOT clinical thresholds and never label a
 * reading as normal, high, low, safe, or dangerous.
 */

import type { Bilingual } from "@/types/health";

export type FieldErrors = Record<string, Bilingual>;

const req = (): Bilingual => ({
  ar: "هذا الحقل مطلوب.",
  en: "This field is required.",
});

const positiveNumber = (digits: number): Bilingual => ({
  ar: `أدخل رقمًا موجبًا لا يتجاوز ${digits} خانات.`,
  en: `Enter a positive number with no more than ${digits} digits.`,
});

/** Parse a possibly-empty text input into a finite number, or null. */
export function parseNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export interface BloodPressureInput {
  measuredAt: string;
  systolic: string;
  diastolic: string;
  pulse: string;
}

export function validateBloodPressure(input: BloodPressureInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.measuredAt.trim()) errors.measuredAt = req();

  const sys = parseNumber(input.systolic);
  if (input.systolic.trim() === "") errors.systolic = req();
  else if (sys === null || sys <= 0 || sys >= 1000)
    errors.systolic = positiveNumber(3);

  const dia = parseNumber(input.diastolic);
  if (input.diastolic.trim() === "") errors.diastolic = req();
  else if (dia === null || dia <= 0 || dia >= 1000)
    errors.diastolic = positiveNumber(3);

  if (input.pulse.trim() !== "") {
    const p = parseNumber(input.pulse);
    if (p === null || p <= 0 || p >= 1000) errors.pulse = positiveNumber(3);
  }
  return errors;
}

export interface BloodGlucoseInput {
  measuredAt: string;
  value: string;
  unit: string;
  mealContext: string;
}

export function validateBloodGlucose(input: BloodGlucoseInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.measuredAt.trim()) errors.measuredAt = req();

  const v = parseNumber(input.value);
  if (input.value.trim() === "") errors.value = req();
  else if (v === null || v <= 0 || v >= 10000) errors.value = positiveNumber(4);

  if (!input.unit.trim()) errors.unit = req();
  if (!input.mealContext.trim()) errors.mealContext = req();
  return errors;
}

export interface MedicationInput {
  name: string;
  frequency: string;
  scheduledTimes?: string;
}

export function validateMedication(input: MedicationInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.name.trim()) errors.name = req();
  if (!input.frequency.trim()) errors.frequency = req();
  if (input.scheduledTimes?.trim()) {
    const times = input.scheduledTimes.split(/[,،]/).map((value) => value.trim());
    if (times.some((value) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))) {
      errors.scheduledTimes = {
        ar: "اكتب كل وقت بصيغة 24 ساعة مثل 08:00، وافصل بينها بفاصلة.",
        en: "Use 24-hour times such as 08:00, separated by commas.",
      };
    }
  }
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
