import { T, type Locale } from '../../i18n/dict';

export function dateLabel(key: string, locale: Locale): string {
  return T[key]?.[locale] ?? key;
}

export function presetLabel(key: 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'previousMonth', locale: Locale): string {
  const translationKey = key === 'previousMonth' ? 'date.previousMonthPreset' : `date.${key}`;
  return dateLabel(translationKey, locale);
}
