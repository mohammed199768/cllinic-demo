/**
 * Client-side export helpers: CSV for a table, JSON for a full backup.
 * Everything runs in the browser; nothing is uploaded. Values are written to a
 * Blob and offered as a download — they are never logged or placed in a URL.
 */

/** A single CSV column: a header label and a cell accessor. */
export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function escapeCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const head = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.value(row))).join(","))
    .join("\r\n");
  // BOM keeps Arabic text readable when opened in Excel.
  return `﻿${head}\r\n${body}`;
}

/** Trigger a browser download of `content` with the given filename + MIME type. */
export function downloadFile(
  filename: string,
  content: string,
  mime: string,
): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Release the object URL on the next tick.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[],
): void {
  downloadFile(filename, toCsv(rows, columns), "text/csv");
}

export function downloadJson(filename: string, json: string): void {
  downloadFile(filename, json, "application/json");
}

/** Read a user-selected File as text (for JSON restore). */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsText(file);
  });
}

/** Timestamp suffix for export filenames, e.g. "2026-07-10". */
export function fileDateStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
