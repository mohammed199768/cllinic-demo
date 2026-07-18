import type { Locale } from '../../i18n/dict';
import type { DateRangeValue, DateValue, DisabledDateMatcher } from './types';

export const CLINIC_TIMEZONE = 'Asia/Amman';
export const EMPTY_RANGE: DateRangeValue = { start: '', end: '' };

interface DateParts {
  year: number;
  month: number;
  day: number;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseDateValue(value: DateValue): DateParts | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day };
}

export function serializeDate(parts: DateParts): DateValue {
  return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function utcDate(value: DateValue): Date {
  const parts = parseDateValue(value);
  if (!parts) throw new Error(`Invalid Gregorian date: ${value}`);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12));
}

export function compareDates(a: DateValue, b: DateValue): number {
  if (!parseDateValue(a) || !parseDateValue(b)) throw new Error('compareDates requires valid YYYY-MM-DD values.');
  return a.localeCompare(b);
}

export function addDays(value: DateValue, days: number): DateValue {
  const date = utcDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return serializeDate({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });
}

export function differenceInCalendarDays(value: DateValue, relativeTo: DateValue): number {
  const valueDate = utcDate(value);
  const relativeDate = utcDate(relativeTo);
  return Math.round((valueDate.getTime() - relativeDate.getTime()) / 86_400_000);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function addMonths(value: DateValue, months: number): DateValue {
  const parts = parseDateValue(value);
  if (!parts) throw new Error(`Invalid Gregorian date: ${value}`);
  const monthIndex = parts.year * 12 + parts.month - 1 + months;
  const year = Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12 + 1;
  return serializeDate({ year, month, day: Math.min(parts.day, daysInMonth(year, month)) });
}

export function startOfMonth(value: DateValue): DateValue {
  const parts = parseDateValue(value);
  if (!parts) throw new Error(`Invalid Gregorian date: ${value}`);
  return serializeDate({ ...parts, day: 1 });
}

export function endOfMonth(value: DateValue): DateValue {
  const parts = parseDateValue(value);
  if (!parts) throw new Error(`Invalid Gregorian date: ${value}`);
  return serializeDate({ ...parts, day: daysInMonth(parts.year, parts.month) });
}

export function monthViewDate(year: number, month: number, minDate?: DateValue, maxDate?: DateValue): DateValue {
  let candidate = serializeDate({ year, month, day: 1 });
  if (minDate && parseDateValue(minDate) && compareDates(endOfMonth(candidate), minDate) < 0) candidate = startOfMonth(minDate);
  if (maxDate && parseDateValue(maxDate) && compareDates(candidate, maxDate) > 0) candidate = startOfMonth(maxDate);
  return candidate;
}

export function isMonthDisabled(year: number, month: number, minDate?: DateValue, maxDate?: DateValue): boolean {
  const candidate = serializeDate({ year, month, day: 1 });
  return (!!minDate && !!parseDateValue(minDate) && compareDates(endOfMonth(candidate), minDate) < 0)
    || (!!maxDate && !!parseDateValue(maxDate) && compareDates(candidate, maxDate) > 0);
}

export function dayOfWeek(value: DateValue): number {
  return utcDate(value).getUTCDay();
}

export function calendarGridDays(viewDate: DateValue): DateValue[] {
  const first = startOfMonth(viewDate);
  const saturdayOffset = (dayOfWeek(first) + 1) % 7;
  const gridStart = addDays(first, -saturdayOffset);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export function todayInAmman(now = new Date()): DateValue {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return serializeDate({ year: get('year'), month: get('month'), day: get('day') });
}

function localeTag(locale: Locale): string {
  return locale === 'ar' ? 'ar-JO' : 'en-GB';
}

export function formatDateValue(value: DateValue, locale: Locale, style: 'short' | 'medium' | 'long' | 'full' = 'long'): string {
  if (!parseDateValue(value)) return '';
  return new Intl.DateTimeFormat(localeTag(locale), { dateStyle: style, timeZone: 'UTC' }).format(utcDate(value));
}

export function formatDayNumber(value: DateValue, locale: Locale): string {
  const parts = parseDateValue(value);
  return parts ? new Intl.NumberFormat(localeTag(locale), { useGrouping: false }).format(parts.day) : '';
}

export function monthNames(locale: Locale): string[] {
  return Array.from({ length: 12 }, (_, month) => new Intl.DateTimeFormat(localeTag(locale), {
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2024, month, 15, 12))));
}

export function weekdayNames(locale: Locale): string[] {
  const saturday = new Date(Date.UTC(2024, 0, 6, 12));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(saturday);
    date.setUTCDate(date.getUTCDate() + index);
    return new Intl.DateTimeFormat(localeTag(locale), { weekday: 'short', timeZone: 'UTC' }).format(date);
  });
}

export function isDateDisabled(date: DateValue, minDate?: DateValue, maxDate?: DateValue, disabledDates?: DisabledDateMatcher): boolean {
  if (!parseDateValue(date)) return true;
  if (minDate && compareDates(date, minDate) < 0) return true;
  if (maxDate && compareDates(date, maxDate) > 0) return true;
  if (Array.isArray(disabledDates)) return disabledDates.includes(date);
  return disabledDates ? disabledDates(date) : false;
}

export function selectRangeDate(range: DateRangeValue, date: DateValue): DateRangeValue {
  if (!range.start || range.end) return { start: date, end: '' };
  return compareDates(date, range.start) < 0 ? { start: date, end: range.start } : { start: range.start, end: date };
}

export function isDateInRange(date: DateValue, range: DateRangeValue): boolean {
  return !!range.start && !!range.end && compareDates(date, range.start) >= 0 && compareDates(date, range.end) <= 0;
}

export function previewRange(range: DateRangeValue, hoverDate: DateValue): DateRangeValue {
  if (!range.start || range.end || !hoverDate) return range;
  return compareDates(hoverDate, range.start) < 0
    ? { start: hoverDate, end: range.start }
    : { start: range.start, end: hoverDate };
}

export function moveFocusedDate(value: DateValue, key: string, locale: Locale): DateValue {
  const weekOffset = (dayOfWeek(value) + 1) % 7;
  switch (key) {
    case 'ArrowLeft': return addDays(value, locale === 'ar' ? 1 : -1);
    case 'ArrowRight': return addDays(value, locale === 'ar' ? -1 : 1);
    case 'ArrowUp': return addDays(value, -7);
    case 'ArrowDown': return addDays(value, 7);
    case 'Home': return addDays(value, -weekOffset);
    case 'End': return addDays(value, 6 - weekOffset);
    case 'PageUp': return addMonths(value, -1);
    case 'PageDown': return addMonths(value, 1);
    default: return value;
  }
}

export interface DateRangePreset {
  key: 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'previousMonth';
  value: DateRangeValue;
}

export function reportDatePresets(now = new Date()): DateRangePreset[] {
  const today = todayInAmman(now);
  const currentMonth = startOfMonth(today);
  const previousMonth = startOfMonth(addMonths(currentMonth, -1));
  return [
    { key: 'today', value: { start: today, end: today } },
    { key: 'yesterday', value: { start: addDays(today, -1), end: addDays(today, -1) } },
    { key: 'last7', value: { start: addDays(today, -6), end: today } },
    { key: 'thisMonth', value: { start: currentMonth, end: today } },
    { key: 'previousMonth', value: { start: previousMonth, end: endOfMonth(previousMonth) } },
  ];
}

function zonedParts(date: Date): Required<DateParts> & { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') };
}

export function ammanDateTimeToUtcIso(dateValue: DateValue, timeValue: string): string {
  const date = parseDateValue(dateValue);
  const time = TIME_PATTERN.exec(timeValue);
  if (!date || !time) throw new Error('A valid YYYY-MM-DD date and HH:mm time are required.');
  const desired = Date.UTC(date.year, date.month - 1, date.day, Number(time[1]), Number(time[2]));
  let candidate = desired;
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const observed = zonedParts(new Date(candidate));
    const observedAsUtc = Date.UTC(observed.year, observed.month - 1, observed.day, observed.hour, observed.minute);
    candidate += desired - observedAsUtc;
  }
  return new Date(candidate).toISOString();
}

export function utcIsoToAmmanDateTime(iso: string): { date: DateValue; time: string } {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) throw new Error('A valid UTC timestamp is required.');
  const parts = zonedParts(instant);
  return {
    date: serializeDate(parts),
    time: `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`,
  };
}
