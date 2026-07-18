/**
 * Shared, non-clinical formatting and math helpers for the health tools.
 *
 * The statistics here (count, average, min, max, delta, range) are plain
 * arithmetic summaries of whatever readings the patient selected. They are
 * explicitly NOT interpretations and never classify a value.
 */

import type { Lang } from "@/types/health";

function parseDisplayDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

/** Format an ISO datetime for display. Falls back to the raw string. */
export function formatDateTime(iso: string | undefined, lang: Lang): string {
  if (!iso) return "—";
  const d = parseDisplayDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(lang === "ar" ? "ar-JO" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string | undefined, lang: Lang): string {
  if (!iso) return "—";
  const d = parseDisplayDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "ar" ? "ar-JO" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatTime(time: string | undefined, lang: Lang): string {
  if (!time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return "—";
  const [hour, minute] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-JO" : "en-GB", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hour, minute));
}

export function formatAppointment(
  date: string | undefined,
  time: string | undefined,
  lang: Lang,
): string {
  if (!date && !time) return "—";
  return [date ? formatDate(date, lang) : "", time ? formatTime(time, lang) : ""]
    .filter(Boolean)
    .join(lang === "ar" ? "، " : ", ");
}

/** Round to at most one decimal place and drop a trailing ".0". */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export interface NumericSummary {
  count: number;
  average: number | null;
  highest: number | null;
  lowest: number | null;
  /** Newest value minus the immediately previous value (chronological). */
  latestChange: number | null;
}

/**
 * Compute arithmetic summaries from a list of numbers already ordered
 * newest-first (as the history table stores them). Returns nulls for an
 * empty set so the UI can show an empty state instead of NaN.
 */
export function summarize(newestFirst: number[]): NumericSummary {
  const values = newestFirst.filter((n) => Number.isFinite(n));
  if (values.length === 0) {
    return { count: 0, average: null, highest: null, lowest: null, latestChange: null };
  }
  const sum = values.reduce((a, b) => a + b, 0);
  const average = round1(sum / values.length);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const latestChange =
    values.length >= 2 ? round1(values[0] - values[1]) : null;
  return { count: values.length, average, highest, lowest, latestChange };
}

/** Signed number as a string with an explicit +/− sign. */
export function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}
