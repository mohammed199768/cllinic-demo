'use client';

import type { Locale } from '../../i18n/dict';
import { Select } from '../ui';
import { dateLabel } from './date-labels';
import { isMonthDisabled, monthNames, monthViewDate, parseDateValue } from './date-utils';

interface MonthYearSelectorProps {
  value: string;
  onChange: (value: string) => void;
  locale: Locale;
  minDate?: string;
  maxDate?: string;
}

export function MonthYearSelector({ value, onChange, locale, minDate, maxDate }: MonthYearSelectorProps) {
  const current = parseDateValue(value);
  if (!current) return null;
  const minYear = parseDateValue(minDate ?? '')?.year ?? current.year - 100;
  const maxYear = parseDateValue(maxDate ?? '')?.year ?? current.year + 20;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index);
  const months = monthNames(locale);

  return (
    <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_7rem] gap-2" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Select
        aria-label={dateLabel('date.selectMonth', locale)}
        value={current.month}
        onChange={(event) => onChange(monthViewDate(current.year, Number(event.target.value), minDate, maxDate))}
        className="h-10 py-0 text-[13px] font-semibold"
      >
        {months.map((month, index) => <option key={month} value={index + 1} disabled={isMonthDisabled(current.year, index + 1, minDate, maxDate)}>{month}</option>)}
      </Select>
      <Select
        aria-label={dateLabel('date.selectYear', locale)}
        value={current.year}
        onChange={(event) => onChange(monthViewDate(Number(event.target.value), current.month, minDate, maxDate))}
        className="h-10 py-0 text-[13px] font-semibold tabular"
      >
        {years.map((year) => <option key={year} value={year}>{new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-GB', { useGrouping: false }).format(year)}</option>)}
      </Select>
    </div>
  );
}
