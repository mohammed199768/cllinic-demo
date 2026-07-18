"use client";

/**
 * Accessible, presentational form controls shared by every health tool.
 * Labels, hints, and errors are already-localized strings supplied by the
 * caller. Errors wire up `aria-describedby` + `aria-invalid`; every control
 * meets the 44px touch-target minimum.
 */

import React, { useId } from "react";

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
