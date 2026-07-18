'use client';

import { useId, type RefObject } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { cx } from '../ui';
import type { Locale } from '../../i18n/dict';
import { dateLabel } from './date-labels';

interface DateInputProps {
  label: string;
  valueText: string;
  locale: Locale;
  open: boolean;
  onClick: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export function DateInput({ label, valueText, locale, open, onClick, triggerRef, disabled, required, error, className }: DateInputProps) {
  const errorId = useId();
  const labelId = useId();
  const valueId = useId();
  return (
    <div className={cx('min-w-0 space-y-1.5', className)} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <span id={labelId} className="block text-[13px] font-medium text-ink-soft">
        {label} {required && <span className="text-red-500" aria-hidden>•</span>}
      </span>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${valueId}`}
        aria-describedby={error ? errorId : undefined}
        onClick={onClick}
        className={cx(
          'flex h-11 w-full min-w-0 items-center gap-2.5 rounded-xl border bg-white px-3.5 text-start text-sm shadow-inner-soft transition-colors',
          'focus:outline-none focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-400/15',
          error ? 'border-red-400' : 'border-line hover:border-line-strong',
          disabled && 'cursor-not-allowed bg-surface-muted text-ink-faint opacity-60',
        )}
      >
        <CalendarDays size={17} className="shrink-0 text-brand-600" aria-hidden />
        <span id={valueId} className={cx('min-w-0 flex-1 truncate tabular', valueText ? 'font-medium text-ink' : 'text-ink-faint')}>
          {valueText || dateLabel('date.none', locale)}
        </span>
        <ChevronDown size={15} className={cx('shrink-0 text-ink-faint transition-transform motion-reduce:transition-none', open && 'rotate-180')} aria-hidden />
      </button>
      {error && <p id={errorId} className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
