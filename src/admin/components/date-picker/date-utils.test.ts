import { describe, expect, it } from 'vitest';
import {
  addMonths,
  ammanDateTimeToUtcIso,
  calendarGridDays,
  differenceInCalendarDays,
  formatDateValue,
  isDateDisabled,
  isMonthDisabled,
  monthViewDate,
  moveFocusedDate,
  parseDateValue,
  previewRange,
  reportDatePresets,
  selectRangeDate,
  serializeDate,
  todayInAmman,
  utcIsoToAmmanDateTime,
  weekdayNames,
} from './date-utils';

describe('date picker Gregorian calendar utilities', () => {
  it('strictly parses and serializes API date-only values', () => {
    expect(parseDateValue('2026-02-28')).toEqual({ year: 2026, month: 2, day: 28 });
    expect(parseDateValue('2026-02-29')).toBeNull();
    expect(parseDateValue('14/07/2026')).toBeNull();
    expect(serializeDate({ year: 2026, month: 7, day: 4 })).toBe('2026-07-04');
  });

  it('builds a fixed six-week Saturday-first grid and navigates months and years', () => {
    const days = calendarGridDays('2026-07-01');
    expect(days).toHaveLength(42);
    expect(days[0]).toBe('2026-06-27');
    expect(weekdayNames('en')[0]).toMatch(/Sat/i);
    expect(weekdayNames('ar')[0]).toContain('السبت');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(monthViewDate(2027, 2, '2026-04-10', '2026-10-20')).toBe('2026-10-01');
    expect(isMonthDisabled(2026, 3, '2026-04-10')).toBe(true);
    expect(isMonthDisabled(2026, 4, '2026-04-10')).toBe(false);
  });

  it('formats one stored date in both locales without changing its value', () => {
    const selected = '2026-07-14';
    expect(formatDateValue(selected, 'en', 'long')).toMatch(/14.*July.*2026/i);
    expect(formatDateValue(selected, 'ar', 'long')).toMatch(/يوليو|تموز/);
    expect(selected).toBe('2026-07-14');
  });

  it('enforces min, max, and custom disabled dates', () => {
    expect(isDateDisabled('2026-07-09', '2026-07-10', '2026-07-20')).toBe(true);
    expect(isDateDisabled('2026-07-21', '2026-07-10', '2026-07-20')).toBe(true);
    expect(isDateDisabled('2026-07-14', undefined, undefined, ['2026-07-14'])).toBe(true);
    expect(isDateDisabled('2026-07-15', undefined, undefined, (date) => date.endsWith('-15'))).toBe(true);
    expect(isDateDisabled('2026-07-16', '2026-07-10', '2026-07-20')).toBe(false);
  });

  it('selects forward and reverse ranges and calculates hover preview', () => {
    expect(selectRangeDate({ start: '', end: '' }, '2026-07-14')).toEqual({ start: '2026-07-14', end: '' });
    expect(selectRangeDate({ start: '2026-07-14', end: '' }, '2026-07-10')).toEqual({ start: '2026-07-10', end: '2026-07-14' });
    expect(previewRange({ start: '2026-07-14', end: '' }, '2026-07-18')).toEqual({ start: '2026-07-14', end: '2026-07-18' });
  });

  it('moves keyboard focus in visual direction for LTR and RTL calendars', () => {
    expect(moveFocusedDate('2026-07-14', 'ArrowRight', 'en')).toBe('2026-07-15');
    expect(moveFocusedDate('2026-07-14', 'ArrowRight', 'ar')).toBe('2026-07-13');
    expect(moveFocusedDate('2026-07-14', 'Home', 'en')).toBe('2026-07-11');
    expect(moveFocusedDate('2026-07-14', 'PageDown', 'en')).toBe('2026-08-14');
  });
});

describe('Asia/Amman boundaries and report contracts', () => {
  it('derives the clinic date at the UTC day boundary', () => {
    expect(todayInAmman(new Date('2026-01-01T20:59:59.000Z'))).toBe('2026-01-01');
    expect(todayInAmman(new Date('2026-01-01T21:00:00.000Z'))).toBe('2026-01-02');
    expect(differenceInCalendarDays('2026-01-02', '2025-12-31')).toBe(2);
  });

  it('round-trips booking date and time through a UTC API timestamp', () => {
    const iso = ammanDateTimeToUtcIso('2026-07-14', '09:30');
    expect(iso).toBe('2026-07-14T06:30:00.000Z');
    expect(utcIsoToAmmanDateTime(iso)).toEqual({ date: '2026-07-14', time: '09:30' });
  });

  it('creates stable report presets using inclusive YYYY-MM-DD ranges', () => {
    const presets = reportDatePresets(new Date('2026-07-14T10:00:00.000Z'));
    expect(presets).toEqual([
      { key: 'today', value: { start: '2026-07-14', end: '2026-07-14' } },
      { key: 'yesterday', value: { start: '2026-07-13', end: '2026-07-13' } },
      { key: 'last7', value: { start: '2026-07-08', end: '2026-07-14' } },
      { key: 'thisMonth', value: { start: '2026-07-01', end: '2026-07-14' } },
      { key: 'previousMonth', value: { start: '2026-06-01', end: '2026-06-30' } },
    ]);
  });
});
