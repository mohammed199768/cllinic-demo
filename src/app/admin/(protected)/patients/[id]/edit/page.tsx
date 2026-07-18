'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRound, Phone, StickyNote } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { api, ApiError } from '@/admin/lib/api';
import { useApi } from '@/admin/lib/useApi';
import { Card, CardHeader, Field, Input, Select, Textarea, Button, Alert, Spinner, Breadcrumb, PageHeader } from '@/admin/components/ui';
import { DatePicker, todayInAmman } from '@/admin/components/date-picker';

interface P { firstName: string; middleName: string; lastName: string; phone: string; secondaryPhone: string | null; dateOfBirth: string | null; gender: string; bloodType: string | null; address: string | null; generalNotes: string | null; fullName?: string; }

export default function EditPatient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useI18n();
  const router = useRouter();
  const { data, loading } = useApi<P>(`/api/patients/${id}`);
  const [f, setF] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [dirty, setDirty] = useState(false);

  useEffect(() => { if (data) setF({ firstName: data.firstName, middleName: data.middleName ?? '', lastName: data.lastName, phone: data.phone, secondaryPhone: data.secondaryPhone ?? '', dateOfBirth: data.dateOfBirth ?? '', gender: data.gender, bloodType: data.bloodType ?? '', address: data.address ?? '', generalNotes: data.generalNotes ?? '' }); }, [data]);
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [dirty]);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setF({ ...f, [k]: e.target.value }); setDirty(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const payload: Record<string, unknown> = { ...f };
      ['secondaryPhone', 'dateOfBirth', 'bloodType', 'address', 'generalNotes'].forEach((k) => { if (payload[k] === '') payload[k] = undefined; });
      await api.patch(`/api/patients/${id}`, payload); setDirty(false); router.push(`/admin/patients/${id}`);
    } catch (e2) { setErr(e2 instanceof ApiError ? e2.message : t('common.error')); setBusy(false); }
  };

  if (loading || !data) return <Spinner label={t('common.loading')} />;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-24">
      <Breadcrumb items={[{ label: t('nav.patients'), href: '/admin/patients' }, { label: data.fullName ?? `${data.firstName} ${data.lastName}`, href: `/admin/patients/${id}` }, { label: t('common.edit') }]} />
      <PageHeader title={t('common.edit')} subtitle={data.fullName ?? `${data.firstName} ${data.lastName}`} />

      <form onSubmit={submit} className="space-y-4">
        {err && <Alert tone="error">{err}</Alert>}

        <Card>
          <CardHeader title={locale === 'ar' ? 'الهوية' : 'Identity'} icon={<UserRound size={15} />} />
          <div className="grid gap-4 p-5 pt-1 sm:grid-cols-3">
            <Field label={t('pt.firstName')} required><Input required value={f.firstName ?? ''} onChange={set('firstName')} /></Field>
            <Field label={t('pt.middleName')} required><Input required value={f.middleName ?? ''} onChange={set('middleName')} /></Field>
            <Field label={t('pt.lastName')} required><Input required value={f.lastName ?? ''} onChange={set('lastName')} /></Field>
            <DatePicker label={t('pt.dob')} value={f.dateOfBirth ?? ''} onChange={(dateOfBirth) => { setF({ ...f, dateOfBirth }); setDirty(true); }} minDate="1900-01-01" maxDate={todayInAmman()} />
            <Field label={t('pt.gender')}><Select value={f.gender ?? 'UNSPECIFIED'} onChange={set('gender')}><option value="UNSPECIFIED">—</option><option value="MALE">{locale === 'ar' ? 'ذكر' : 'Male'}</option><option value="FEMALE">{locale === 'ar' ? 'أنثى' : 'Female'}</option><option value="OTHER">{locale === 'ar' ? 'آخر' : 'Other'}</option></Select></Field>
            <Field label={t('pt.bloodType')}><Input value={f.bloodType ?? ''} onChange={set('bloodType')} dir="ltr" /></Field>
          </div>
        </Card>

        <Card>
          <CardHeader title={locale === 'ar' ? 'التواصل' : 'Contact'} icon={<Phone size={15} />} />
          <div className="grid gap-4 p-5 pt-1 sm:grid-cols-2">
            <Field label={t('common.phone')} required><Input required value={f.phone ?? ''} onChange={set('phone')} dir="ltr" inputMode="tel" /></Field>
            <Field label={locale === 'ar' ? 'هاتف ثانوي' : 'Secondary phone'}><Input value={f.secondaryPhone ?? ''} onChange={set('secondaryPhone')} dir="ltr" inputMode="tel" /></Field>
            <Field label={locale === 'ar' ? 'العنوان' : 'Address'}><Input value={f.address ?? ''} onChange={set('address')} /></Field>
          </div>
        </Card>

        <Card>
          <CardHeader title={t('common.notes')} icon={<StickyNote size={15} />} />
          <div className="p-5 pt-1"><Textarea value={f.generalNotes ?? ''} onChange={set('generalNotes')} /></div>
        </Card>

        <div className="glass no-print sticky bottom-0 z-20 -mx-4 flex items-center justify-between gap-2 border-t border-line/60 px-4 py-3 md:-mx-6 md:px-6">
          <span className="text-xs text-ink-faint">{dirty ? (locale === 'ar' ? 'تغييرات غير محفوظة' : 'Unsaved changes') : ''}</span>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={busy}>{busy ? t('common.saving') : t('common.save')}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
