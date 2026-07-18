'use client';
import { Sparkles } from 'lucide-react';
import { useI18n } from '../i18n/LocaleProvider';
export function DemoBanner() {
  const { t } = useI18n();
  return (
    <div className="no-print flex items-center justify-center gap-1.5 border-b border-amber-200/60 bg-amber-50/80 px-3 py-1.5 text-center text-[11px] font-medium text-amber-800">
      <Sparkles size={12} aria-hidden /> {t('demoNotice')}
    </div>
  );
}
