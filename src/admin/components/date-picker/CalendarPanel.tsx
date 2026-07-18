'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Locale } from '../../i18n/dict';
import { IconButton, cx } from '../ui';
import { dateLabel } from './date-labels';
import {
  addDays,
  addMonths,
  calendarGridDays,
  compareDates,
  endOfMonth,
  formatDateValue,
  formatDayNumber,
  isDateDisabled,
  isDateInRange,
  moveFocusedDate,
  parseDateValue,
  previewRange,
  startOfMonth,
  todayInAmman,
  weekdayNames,
} from './date-utils';
import { MonthYearSelector } from './MonthYearSelector';
import type { DateRangeValue, DisabledDateMatcher } from './types';

interface CalendarPanelProps {
  locale: Locale;
  viewDate: string;
  onViewDateChange: (value: string) => void;
  selectedDate?: string;
  selectedRange?: DateRangeValue;
  onSelect: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  disabledDates?: DisabledDateMatcher;
}

const NAVIGATION_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']);

export function CalendarPanel({ locale, viewDate, onViewDateChange, selectedDate, selectedRange, onSelect, minDate, maxDate, disabledDates }: CalendarPanelProps) {
  const today = todayInAmman();
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedDate, setFocusedDate] = useState(selectedDate || selectedRange?.end || selectedRange?.start || today);
  const [hoveredDate, setHoveredDate] = useState('');
  const days = useMemo(() => calendarGridDays(viewDate), [viewDate]);
  const weekdays = useMemo(() => weekdayNames(locale), [locale]);
  const viewParts = parseDateValue(viewDate)!;
  const effectiveRange = selectedRange ? previewRange(selectedRange, hoveredDate) : undefined;

  useEffect(() => {
    const next = selectedDate || selectedRange?.end || selectedRange?.start;
    if (next) setFocusedDate(next);
  }, [selectedDate, selectedRange?.end, selectedRange?.start]);

  useEffect(() => {
    const button = gridRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${focusedDate}"]`);
    if (button && document.activeElement?.closest('[role="grid"]')) button.focus();
  }, [focusedDate, viewDate]);

  const previousMonth = startOfMonth(addMonths(viewDate, -1));
  const nextMonth = startOfMonth(addMonths(viewDate, 1));
  const previousDisabled = !!minDate && compareDates(endOfMonth(previousMonth), minDate) < 0;
  const nextDisabled = !!maxDate && compareDates(nextMonth, maxDate) > 0;

  const focusAvailableDate = (candidate: string, key: string) => {
    let next = candidate;
    for (let attempts = 0; attempts < 42 && isDateDisabled(next, minDate, maxDate, disabledDates); attempts += 1) {
      if (key === 'ArrowLeft') next = addDays(next, locale === 'ar' ? 1 : -1);
      else if (key === 'ArrowRight') next = addDays(next, locale === 'ar' ? -1 : 1);
      else if (key === 'ArrowUp') next = addDays(next, -7);
      else if (key === 'ArrowDown') next = addDays(next, 7);
      else break;
    }
    if (isDateDisabled(next, minDate, maxDate, disabledDates)) return;
    setFocusedDate(next);
    if (startOfMonth(next) !== startOfMonth(viewDate)) onViewDateChange(startOfMonth(next));
  };

  const onDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
    if (!NAVIGATION_KEYS.has(event.key)) return;
    event.preventDefault();
    focusAvailableDate(moveFocusedDate(date, event.key, locale), event.key);
  };

  const PreviousIcon = locale === 'ar' ? ChevronRight : ChevronLeft;
  const NextIcon = locale === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2" dir="ltr">
        <IconButton
          label={dateLabel('date.previousMonth', locale)}
          disabled={previousDisabled}
          onClick={() => onViewDateChange(previousMonth)}
          className="h-11 w-11 shrink-0 border border-line/70 bg-white"
        >
          <PreviousIcon size={17} />
        </IconButton>
        <MonthYearSelector value={viewDate} onChange={onViewDateChange} locale={locale} minDate={minDate} maxDate={maxDate} />
        <IconButton
          label={dateLabel('date.nextMonth', locale)}
          disabled={nextDisabled}
          onClick={() => onViewDateChange(nextMonth)}
          className="h-11 w-11 shrink-0 border border-line/70 bg-white"
        >
          <NextIcon size={17} />
        </IconButton>
      </div>

      <div ref={gridRef} role="grid" aria-label={dateLabel('date.dialog', locale)} className="select-none" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div role="row" className="grid grid-cols-7 border-b border-line/60 pb-1">
          {weekdays.map((weekday, index) => (
            <div key={`${weekday}-${index}`} role="columnheader" aria-label={weekday} className="grid h-8 place-items-center text-[11px] font-semibold text-ink-faint">
              {weekday}
            </div>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, row) => (
          <div key={row} role="row" className="grid grid-cols-7">
            {days.slice(row * 7, row * 7 + 7).map((date) => {
              const parts = parseDateValue(date)!;
              const outside = parts.month !== viewParts.month;
              const disabled = isDateDisabled(date, minDate, maxDate, disabledDates);
              const isToday = date === today;
              const isSingleSelected = date === selectedDate;
              const isStart = date === selectedRange?.start;
              const isEnd = date === selectedRange?.end;
              const inRange = !!effectiveRange && isDateInRange(date, effectiveRange);
              const selected = isSingleSelected || isStart || isEnd;
              return (
                <div
                  key={date}
                  role="gridcell"
                  aria-selected={selected}
                  className={cx('relative p-0.5', inRange && !selected && 'bg-brand-50')}
                >
                  <button
                    type="button"
                    data-date={date}
                    data-calendar-focus={date === focusedDate && !disabled ? 'true' : undefined}
                    tabIndex={date === focusedDate && !disabled ? 0 : -1}
                    disabled={disabled}
                    aria-label={formatDateValue(date, locale, 'full')}
                    aria-current={isToday ? 'date' : undefined}
                    onFocus={() => setFocusedDate(date)}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate('')}
                    onKeyDown={(event) => onDayKeyDown(event, date)}
                    onClick={() => onSelect(date)}
                    className={cx(
                      'relative grid aspect-square min-h-10 w-full place-items-center rounded-xl text-[13px] font-medium tabular transition-colors motion-reduce:transition-none',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
                      selected && 'bg-brand-600 text-white shadow-[0_2px_5px_rgba(39,103,160,.25)]',
                      !selected && inRange && 'rounded-none bg-brand-50 text-brand-800',
                      !selected && !inRange && !outside && 'text-ink hover:bg-surface-muted',
                      !selected && !inRange && outside && 'text-ink-faint/65 hover:bg-surface-muted hover:text-ink-soft',
                      disabled && 'cursor-not-allowed text-ink-faint/35 line-through hover:bg-transparent',
                    )}
                  >
                    {formatDayNumber(date, locale)}
                    {isToday && !selected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-500" aria-hidden />}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
