'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/LocaleProvider';
import { Button } from '../ui';
import { CalendarPanel } from './CalendarPanel';
import { DateInput } from './DateInput';
import { dateLabel } from './date-labels';
import { formatDateValue, isDateDisabled, parseDateValue, startOfMonth, todayInAmman } from './date-utils';
import { PickerDialog } from './PickerDialog';
import type { DatePickerProps } from './types';

export function DatePicker({ value, onChange, label, open, onOpenChange, minDate, maxDate, disabledDates, locale: localeProp, disabled, required, error, className, allowClear = true }: DatePickerProps) {
  const { locale: contextLocale } = useI18n();
  const locale = localeProp ?? contextLocale;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [viewDate, setViewDate] = useState(startOfMonth(value || todayInAmman()));
  const wasOpen = useRef(false);
  const isOpen = open ?? internalOpen;

  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setDraft(value);
      setViewDate(startOfMonth(value || todayInAmman()));
    }
    if (!isOpen && wasOpen.current) triggerRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen, value]);

  const cancel = () => setOpen(false);
  const apply = () => {
    if (draft && (!parseDateValue(draft) || isDateDisabled(draft, minDate, maxDate, disabledDates))) return;
    if (required && !draft) return;
    onChange(draft);
    setOpen(false);
  };
  const today = todayInAmman();

  return (
    <>
      <DateInput
        label={label}
        valueText={formatDateValue(value, locale, 'long')}
        locale={locale}
        open={isOpen}
        onClick={() => !disabled && setOpen(true)}
        triggerRef={triggerRef}
        disabled={disabled}
        required={required}
        error={error}
        className={className}
      />
      <PickerDialog open={isOpen} title={dateLabel('date.choose', locale)} locale={locale} triggerRef={triggerRef} onClose={cancel}>
        <CalendarPanel
          locale={locale}
          viewDate={viewDate}
          onViewDateChange={setViewDate}
          selectedDate={draft}
          onSelect={setDraft}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
        />
        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-line/70 bg-white/95 px-4 py-3 backdrop-blur-sm">
          <Button type="button" size="sm" variant="soft" onClick={() => { setDraft(today); setViewDate(startOfMonth(today)); }} disabled={isDateDisabled(today, minDate, maxDate, disabledDates)}>
            {dateLabel('date.today', locale)}
          </Button>
          {allowClear && <Button type="button" size="sm" variant="ghost" onClick={() => setDraft('')} disabled={!draft}>{dateLabel('date.clear', locale)}</Button>}
          <span className="flex-1" />
          <Button type="button" size="sm" variant="secondary" onClick={cancel}>{dateLabel('common.cancel', locale)}</Button>
          <Button type="button" size="sm" onClick={apply} disabled={(required && !draft) || (!!draft && (!parseDateValue(draft) || isDateDisabled(draft, minDate, maxDate, disabledDates)))}>{dateLabel('date.apply', locale)}</Button>
        </div>
      </PickerDialog>
    </>
  );
}
