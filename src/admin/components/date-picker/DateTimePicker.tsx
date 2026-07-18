'use client';

import { useId } from 'react';
import { useI18n } from '../../i18n/LocaleProvider';
import { Field, Input } from '../ui';
import { DatePicker } from './DatePicker';
import type { DateTimePickerProps } from './types';

export function DateTimePicker({ value, onChange, dateLabel, timeLabel, open, onOpenChange, minDate, maxDate, disabledDates, locale: localeProp, disabled, required, error, className, allowClear = false, timeRequired = true }: DateTimePickerProps) {
  const { locale: contextLocale } = useI18n();
  const locale = localeProp ?? contextLocale;
  const timeId = useId();
  return (
    <div className={className ?? 'grid gap-3 sm:grid-cols-2'}>
      <DatePicker
        label={dateLabel}
        value={value.date}
        onChange={(date) => onChange({ ...value, date })}
        open={open}
        onOpenChange={onOpenChange}
        minDate={minDate}
        maxDate={maxDate}
        disabledDates={disabledDates}
        locale={locale}
        disabled={disabled}
        required={required}
        error={error}
        allowClear={allowClear}
      />
      <Field label={timeLabel} required={timeRequired} htmlFor={timeId}>
        <Input
          id={timeId}
          type="time"
          value={value.time}
          onChange={(event) => onChange({ ...value, time: event.target.value })}
          disabled={disabled}
          required={timeRequired}
          dir="ltr"
        />
      </Field>
    </div>
  );
}
