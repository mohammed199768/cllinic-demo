import type { Locale } from '../i18n/dict';
import { CLINIC_TIMEZONE, formatDateValue, parseDateValue } from '../components/date-picker/date-utils';

export function fmtDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return '—';
  if (parseDateValue(iso)) return formatDateValue(iso, locale, 'medium');
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-GB', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: CLINIC_TIMEZONE,
  }).format(d);
}
export function fmtDateTime(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-GB', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: CLINIC_TIMEZONE,
  }).format(d);
}
export function fmtNum(n: number | null | undefined, locale: Locale): string {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-US').format(n);
}
