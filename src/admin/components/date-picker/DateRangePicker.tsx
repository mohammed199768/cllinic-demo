'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/LocaleProvider';
import { Button, cx } from '../ui';
import { CalendarPanel } from './CalendarPanel';
import { DateInput } from './DateInput';
import { dateLabel, presetLabel } from './date-labels';
import { EMPTY_RANGE, compareDates, formatDateValue, reportDatePresets, selectRangeDate, startOfMonth, todayInAmman } from './date-utils';
import { PickerDialog } from './PickerDialog';
import type { DateRangePickerProps, DateRangeValue } from './types';

function rangeText(value: DateRangeValue, locale: 'ar' | 'en'): string {
  if (!value.start && !value.end) return '';
  const start = value.start ? formatDateValue(value.start, locale, 'medium') : dateLabel('date.start', locale);
  const end = value.end ? formatDateValue(value.end, locale, 'medium') : dateLabel('date.end', locale);
  return `${start} ${locale === 'ar' ? '←' : '→'} ${end}`;
}

export function DateRangePicker({ value, onChange, label, open, onOpenChange, minDate, maxDate, disabledDates, locale: localeProp, disabled, required, error, className, allowClear = true, presets = false }: DateRangePickerProps) {
  const { locale: contextLocale } = useI18n();
  const locale = localeProp ?? contextLocale;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue>(value);
  const [viewDate, setViewDate] = useState(startOfMonth(value.start || todayInAmman()));
  const wasOpen = useRef(false);
  const isOpen = open ?? internalOpen;

  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setDraft(value);
      setViewDate(startOfMonth(value.start || todayInAmman()));
    }
    if (!isOpen && wasOpen.current) triggerRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen, value]);

  const complete = !!draft.start && !!draft.end && compareDates(draft.start, draft.end) <= 0;
  const apply = () => {
    if (required && !complete) return;
    if ((draft.start || draft.end) && !complete) return;
    onChange(draft);
    setOpen(false);
  };
  const cancel = () => setOpen(false);

  return (
    <>
      <DateInput
        label={label}
        valueText={rangeText(value, locale)}
        locale={locale}
        open={isOpen}
        onClick={() => !disabled && setOpen(true)}
        triggerRef={triggerRef}
        disabled={disabled}
        required={required}
        error={error}
        className={className}
      />
      <PickerDialog open={isOpen} title={dateLabel('date.chooseRange', locale)} locale={locale} triggerRef={triggerRef} onClose={cancel}>
        {presets && (
          <div className="flex gap-2 overflow-x-auto border-b border-line/60 px-3 py-3 sm:flex-wrap sm:overflow-visible sm:px-4">
            {reportDatePresets().map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => { setDraft(preset.value); setViewDate(startOfMonth(preset.value.start)); }}
                className={cx(
                  'h-9 shrink-0 rounded-xl border px-3 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                  draft.start === preset.value.start && draft.end === preset.value.end
                    ? 'border-brand-300 bg-brand-50 text-brand-800'
                    : 'border-line bg-white text-ink-soft hover:bg-surface-muted',
                )}
              >
                {presetLabel(preset.key, locale)}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 px-4 pt-3 text-xs">
          <div className="rounded-xl bg-surface-muted px-3 py-2"><span className="text-ink-faint">{dateLabel('date.start', locale)}</span><p className="mt-0.5 truncate font-semibold text-ink">{draft.start ? formatDateValue(draft.start, locale, 'medium') : '—'}</p></div>
          <div className="rounded-xl bg-surface-muted px-3 py-2"><span className="text-ink-faint">{dateLabel('date.end', locale)}</span><p className="mt-0.5 truncate font-semibold text-ink">{draft.end ? formatDateValue(draft.end, locale, 'medium') : '—'}</p></div>
        </div>
        <CalendarPanel
          locale={locale}
          viewDate={viewDate}
          onViewDateChange={setViewDate}
          selectedRange={draft}
          onSelect={(date) => setDraft((current) => selectRangeDate(current, date))}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
        />
        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-line/70 bg-white/95 px-4 py-3 backdrop-blur-sm">
          {allowClear && <Button type="button" size="sm" variant="ghost" onClick={() => setDraft(EMPTY_RANGE)} disabled={!draft.start && !draft.end}>{dateLabel('date.clear', locale)}</Button>}
          <span className="flex-1" />
          <Button type="button" size="sm" variant="secondary" onClick={cancel}>{dateLabel('common.cancel', locale)}</Button>
          <Button type="button" size="sm" onClick={apply} disabled={(required && !complete) || (!!(draft.start || draft.end) && !complete)}>{dateLabel('date.apply', locale)}</Button>
        </div>
      </PickerDialog>
    </>
  );
}
