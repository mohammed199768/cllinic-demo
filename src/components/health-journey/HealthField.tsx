"use client";

/**
 * Accessible, presentational form controls shared by every health tool.
 * Labels, hints, and errors are already-localized strings supplied by the
 * caller. Errors wire up `aria-describedby` + `aria-invalid`; every control
 * meets the 44px touch-target minimum.
 */

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { useLang } from "@/lib/i18n";
import { dateToLocalDateKey, formatLocalDateKey, parseLocalDateKey } from "@/lib/health-format";

const CONTROL =
  "w-full min-h-11 rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy-800 shadow-xs transition placeholder:text-navy-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400";

function borderClass(error?: string): string {
  return error ? "border-rose-300 focus-visible:ring-rose-400" : "border-navy-200/80";
}

interface FrameProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (aria: {
    describedBy: string | undefined;
    invalid: boolean;
  }) => React.ReactNode;
}

/** Renders label + hint + control + error with correct aria wiring. */
function Frame({ id, label, hint, error, required, children }: FrameProps) {
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy =
    [hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-navy-800">
        {label}
        {required && (
          <span className="text-rose-500" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-navy-500">
          {hint}
        </p>
      )}
      {children({ describedBy, invalid: !!error })}
      {error && (
        <p id={errId} role="alert" className="text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

type BaseProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  id?: string;
};

export function TextInput({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  id,
  type = "text",
  placeholder,
  inputMode,
  autoComplete = "off",
}: BaseProps & {
  type?: "text" | "tel" | "email";
  placeholder?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel";
  autoComplete?: string;
}) {
  const gen = useId();
  const fieldId = id ?? gen;
  return (
    <Frame id={fieldId} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => (
        <input
          id={fieldId}
          type={type}
          value={value}
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={`${CONTROL} ${borderClass(error)}`}
        />
      )}
    </Frame>
  );
}

export function NumberInput(props: BaseProps & { placeholder?: string; step?: string }) {
  return (
    <TextInputNumber {...props} />
  );
}

function TextInputNumber({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  id,
  placeholder,
  step,
}: BaseProps & { placeholder?: string; step?: string }) {
  const gen = useId();
  const fieldId = id ?? gen;
  return (
    <Frame id={fieldId} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => (
        <input
          id={fieldId}
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={`${CONTROL} ${borderClass(error)}`}
        />
      )}
    </Frame>
  );
}

export function DateTimeInput({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  id,
  type = "datetime-local",
}: BaseProps & { type?: "datetime-local" | "date" | "time" }) {
  const gen = useId();
  const fieldId = id ?? gen;
  if (type === "date") {
    return <LocalDateInput id={fieldId} label={label} value={value} onChange={onChange} hint={hint} error={error} required={required} />;
  }
  return (
    <Frame id={fieldId} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => (
        <input
          id={fieldId}
          type={type}
          value={value}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={`${CONTROL} ${borderClass(error)}`}
        />
      )}
    </Frame>
  );
}

function LocalDateInput({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  id,
}: BaseProps & { id: string }) {
  const { lang, t } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = parseLocalDateKey(value);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selected ?? startOfMonth(new Date()));
  const panelId = `${id}-calendar`;
  const locale = lang === "ar" ? "ar-JO" : "en-GB";
  const weekdays = lang === "ar"
    ? ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = useMemo(() => calendarDays(viewDate), [viewDate]);

  useEffect(() => {
    const nextSelected = parseLocalDateKey(value);
    if (nextSelected) setViewDate(startOfMonth(nextSelected));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (day: Date) => {
    onChange(dateToLocalDateKey(day));
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const displayValue = value ? formatLocalDateKey(value) : t("اختر التاريخ", "Choose date");

  return (
    <Frame id={id} label={label} hint={hint} error={error} required={required}>
      {({ describedBy }) => (
        <div ref={rootRef} className="relative min-w-0">
          <button
            ref={triggerRef}
            id={id}
            type="button"
            aria-label={`${label}: ${displayValue}`}
            aria-describedby={describedBy}
            aria-expanded={open}
            aria-controls={panelId}
            aria-haspopup="dialog"
            onClick={() => setOpen((current) => !current)}
            className={`${CONTROL} ${borderClass(error)} flex items-center justify-between gap-3 text-start`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="icon-pad h-8 w-8 shrink-0"><Icon name="calendar" className="h-4 w-4" /></span>
              <span className={`truncate ${value ? "font-semibold text-navy-800" : "text-navy-400"}`}>
                {displayValue}
              </span>
            </span>
            <Icon name="chevron" className={`h-4 w-4 shrink-0 text-navy-400 transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
          </button>
          {open && (
            <div
              id={panelId}
              role="dialog"
              aria-modal="false"
              aria-labelledby={id}
              className="absolute top-full z-[80] mt-2 w-[min(22rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-3xl border border-navy-100 bg-white p-4 shadow-float ltr:left-0 rtl:right-0"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setViewDate((current) => addMonths(current, -1))} aria-label={t("الشهر السابق", "Previous month")} className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy-200 text-navy-600 transition hover:border-brand-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                  <Icon name="chevron" className="h-4 w-4 rotate-180 rtl:rotate-0" />
                </button>
                <p aria-live="polite" className="min-w-0 flex-1 truncate text-center text-sm font-extrabold text-navy-900">
                  {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(viewDate)}
                </p>
                <button type="button" onClick={() => setViewDate((current) => addMonths(current, 1))} aria-label={t("الشهر التالي", "Next month")} className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy-200 text-navy-600 transition hover:border-brand-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                  <Icon name="chevron" className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-navy-400">
                {weekdays.map((day) => <span key={day} className="py-1">{day}</span>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {days.map((day, index) => day ? (
                  <button
                    key={dateToLocalDateKey(day)}
                    type="button"
                    aria-label={formatLocalDateKey(dateToLocalDateKey(day))}
                    aria-pressed={value === dateToLocalDateKey(day)}
                    onClick={() => choose(day)}
                    className={`flex h-10 min-w-0 items-center justify-center rounded-xl text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${value === dateToLocalDateKey(day) ? "bg-brand-600 text-white shadow-soft" : sameDate(day, new Date()) ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100" : "text-navy-700 hover:bg-brand-50 hover:text-brand-700"}`}
                  >
                    {new Intl.NumberFormat(locale).format(day.getDate())}
                  </button>
                ) : <span key={`empty-${index}`} className="h-10" aria-hidden="true" />)}
              </div>
              {value && <button type="button" onClick={() => { onChange(""); setOpen(false); requestAnimationFrame(() => triggerRef.current?.focus()); }} className="btn-ghost mt-3 w-full text-xs">{t("مسح التاريخ", "Clear date")}</button>}
            </div>
          )}
        </div>
      )}
    </Frame>
  );
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function calendarDays(viewDate: Date): Array<Date | null> {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const total = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const result: Array<Date | null> = Array.from({ length: first.getDay() }, () => null);
  for (let day = 1; day <= total; day += 1) result.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
  return result;
}

function sameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export interface Option {
  value: string;
  label: string;
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
  hint,
  error,
  required,
  id,
}: BaseProps & { options: Option[] }) {
  const gen = useId();
  const fieldId = id ?? gen;
  return (
    <Frame id={fieldId} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => (
        <select
          id={fieldId}
          value={value}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={`${CONTROL} ${borderClass(error)}`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Frame>
  );
}

export function TextAreaInput({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  id,
  rows = 3,
  placeholder,
}: BaseProps & { rows?: number; placeholder?: string }) {
  const gen = useId();
  const fieldId = id ?? gen;
  return (
    <Frame id={fieldId} label={label} hint={hint} error={error} required={required}>
      {({ describedBy, invalid }) => (
        <textarea
          id={fieldId}
          rows={rows}
          value={value}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={`${CONTROL} ${borderClass(error)} resize-y leading-relaxed`}
        />
      )}
    </Frame>
  );
}
