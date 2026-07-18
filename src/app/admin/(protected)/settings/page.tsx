'use client';
import { useRef, useState } from 'react';
import { Building2, Database, Download, RotateCcw, Upload } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi } from '@/admin/lib/useApi';
import { Card, CardHeader, Alert, Badge, Button, PageHeader } from '@/admin/components/ui';
import { CLINIC } from '@/admin/config/clinic';
import { exportLocalData, importLocalData, resetLocalData } from '@ourclinic/local-data/admin-adapter';

export default function SettingsPage() {
  const { t, locale } = useI18n();
  const { data } = useApi<{ status: string; demo: boolean }>('/api/health');
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState('');
  const download = async () => {
    const url = URL.createObjectURL(new Blob([await exportLocalData()], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ourclinic-local-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };
  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      await importLocalData(await file.text());
      setNotice(locale === 'ar' ? 'تم استيراد البيانات المحلية.' : 'Local data imported.');
    } catch {
      setNotice(locale === 'ar' ? 'تعذّر استيراد الملف. لم تتغير البيانات الحالية.' : 'The file could not be imported. Current data was not changed.');
    }
  };
  const reset = async () => {
    if (!window.confirm(locale === 'ar' ? 'إعادة البيانات التجريبية إلى حالتها الأصلية؟' : 'Reset the demo data to its original state?')) return;
    await resetLocalData();
    setNotice(locale === 'ar' ? 'تمت إعادة تعيين البيانات.' : 'Demo data reset.');
  };
  const clinic = {
    name: locale === 'ar' ? CLINIC.nameAr : CLINIC.nameEn,
    phone: CLINIC.phoneDisplay,
    email: CLINIC.email,
    address: locale === 'ar' ? `${CLINIC.cityAr}، ${CLINIC.countryAr}` : `${CLINIC.cityEn}, ${CLINIC.countryEn}`,
  };

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title={t('nav.settings')} />

      <Card>
        <CardHeader title={t('set.demoEnv')} icon={<Database size={15} />} />
        <div className="space-y-3 p-5 pt-1 text-sm">
          <div className="flex items-center gap-2">{t('set.demoEnv')}: {data?.demo ? <Badge tone="amber" dot>{locale === 'ar' ? 'مُفعّل' : 'Enabled'}</Badge> : <Badge tone="gray">off</Badge>}</div>
          <p className="text-ink-soft">{locale === 'ar' ? 'قاعدة البيانات: IndexedDB داخل هذا المتصفح.' : 'Database: IndexedDB in this browser.'}</p>
          <Alert tone="warn">{locale === 'ar' ? 'إعادة التعيين تستبدل جميع تغييرات العرض بالبيانات التجريبية الأصلية.' : 'Reset replaces all demo changes with the original seeded data.'}</Alert>
          {notice && <Alert>{notice}</Alert>}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => void download()}><Download size={14} />{locale === 'ar' ? 'تصدير JSON' : 'Export JSON'}</Button>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} />{locale === 'ar' ? 'استيراد JSON' : 'Import JSON'}</Button>
            <Button variant="secondary" size="sm" onClick={() => void reset()}><RotateCcw size={14} />{locale === 'ar' ? 'إعادة التعيين' : 'Reset demo'}</Button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={(event) => void importFile(event.target.files?.[0])} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title={t('set.clinic')} icon={<Building2 size={15} />} />
        <dl className="grid grid-cols-1 gap-4 p-5 pt-1 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-surface-muted/70 p-3.5"><dt className="text-xs text-ink-faint">{t('common.name')}</dt><dd className="mt-0.5 font-medium text-ink">{clinic.name}</dd></div>
          <div className="rounded-xl bg-surface-muted/70 p-3.5"><dt className="text-xs text-ink-faint">{t('common.phone')}</dt><dd className="tabular mt-0.5 font-medium text-ink" dir="ltr">{clinic.phone}</dd></div>
          <div className="rounded-xl bg-surface-muted/70 p-3.5"><dt className="text-xs text-ink-faint">Email</dt><dd className="mt-0.5 font-medium text-ink" dir="ltr">{clinic.email}</dd></div>
          <div className="rounded-xl bg-surface-muted/70 p-3.5"><dt className="text-xs text-ink-faint">{locale === 'ar' ? 'العنوان' : 'Address'}</dt><dd className="mt-0.5 font-medium text-ink">{clinic.address}</dd></div>
        </dl>
        <p className="px-5 pb-5 text-xs text-ink-faint">{t('demoNotice')}</p>
      </Card>
    </div>
  );
}
