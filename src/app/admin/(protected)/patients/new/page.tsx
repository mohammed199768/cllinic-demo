'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRound, Phone, HeartPulse, StickyNote } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { api, ApiError } from '@/admin/lib/api';
import { Card, CardHeader, Field, Input, Select, Textarea, Button, Alert, Breadcrumb, PageHeader } from '@/admin/components/ui';
import { useToast } from '@/admin/components/Toast';
import { DatePicker, todayInAmman } from '@/admin/components/date-picker';

const empty = { firstName: '', middleName: '', lastName: '', phone: '', secondaryPhone: '', dateOfBirth: '', gender: 'UNSPECIFIED', bloodType: '', address: '', emergencyContactName: '', emergencyContactPhone: '', generalNotes: '' };

export default function NewPatientPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [dupWarn, setDupWarn] = useState(false);
  const { toast } = useToast();
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (confirmDuplicate = false) => {
    setBusy(true); setErr('');
    try {
      const payload: Record<string, unknown> = { ...f, confirmDuplicate };
      Object.keys(payload).forEach((k) => payload[k] === '' && delete payload[k]);
      payload.firstName = f.firstName; payload.middleName = f.middleName; payload.lastName = f.lastName; payload.phone = f.phone;
      const res = await api.post<{ id: string }>('/api/patients', payload);
      toast(t('toast.created'));
      router.push(`/admin/patients/${res.id}`);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'DUPLICATE') { setDupWarn(true); setErr(locale === 'ar' ? 'يوجد مريض بنفس الاسم والهاتف. يمكنك المتابعة إن كان فردًا مختلفًا من نفس العائلة.' : 'A patient with the same name and phone exists. Continue if this is a different family member.'); }
      else setErr(e instanceof ApiError ? e.message : t('common.error'));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-24">
      <Breadcrumb items={[{ label: t('nav.patients'), href: '/admin/patients' }, { label: t('pt.new') }]} />
      <PageHeader title={t('pt.new')} subtitle={locale === 'ar' ? 'أدخل بيانات المريض — الحقول المعلّمة بـ • مطلوبة.' : 'Enter the patient details — fields marked • are required.'} />

      <form onSubmit={(e) => { e.preventDefault(); submit(dupWarn); }} className="space-y-4">
        {err && <Alert tone={dupWarn ? 'warn' : 'error'}>{err}</Alert>}

        {/* Identity */}
        <Card>
          <CardHeader title={locale === 'ar' ? 'الهوية' : 'Identity'} icon={<UserRound size={15} />} />
          <div className="grid gap-4 p-5 pt-1 sm:grid-cols-3">
            <Field label={t('pt.firstName')} required><Input required value={f.firstName} onChange={set('firstName')} /></Field>
            <Field label={t('pt.middleName')} required><Input required value={f.middleName} onChange={set('middleName')} /></Field>
            <Field label={t('pt.lastName')} required><Input required value={f.lastName} onChange={set('lastName')} /></Field>
            <DatePicker label={t('pt.dob')} value={f.dateOfBirth} onChange={(dateOfBirth) => setF({ ...f, dateOfBirth })} minDate="1900-01-01" maxDate={todayInAmman()} />
            <Field label={t('pt.gender')}>
              <Select value={f.gender} onChange={set('gender')}>
                <option value="UNSPECIFIED">—</option><option value="MALE">{locale === 'ar' ? 'ذكر' : 'Male'}</option><option value="FEMALE">{locale === 'ar' ? 'أنثى' : 'Female'}</option><option value="OTHER">{locale === 'ar' ? 'آخر' : 'Other'}</option>
              </Select>
            </Field>
            <Field label={t('pt.bloodType')} hint={locale === 'ar' ? 'مثال: +A أو -O' : 'e.g. A+ or O-'}><Input value={f.bloodType} onChange={set('bloodType')} dir="ltr" /></Field>
          </div>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader title={locale === 'ar' ? 'التواصل' : 'Contact'} icon={<Phone size={15} />} />
          <div className="grid gap-4 p-5 pt-1 sm:grid-cols-2">
            <Field label={t('common.phone')} required><Input required value={f.phone} onChange={set('phone')} dir="ltr" inputMode="tel" /></Field>
            <Field label={locale === 'ar' ? 'هاتف ثانوي' : 'Secondary phone'}><Input value={f.secondaryPhone} onChange={set('secondaryPhone')} dir="ltr" inputMode="tel" /></Field>
            <Field label={locale === 'ar' ? 'العنوان' : 'Address'}><Input value={f.address} onChange={set('address')} /></Field>
          </div>
        </Card>

        {/* Emergency */}
        <Card>
          <CardHeader title={locale === 'ar' ? 'جهة اتصال الطوارئ' : 'Emergency contact'} icon={<HeartPulse size={15} />} />
          <div className="grid gap-4 p-5 pt-1 sm:grid-cols-2">
            <Field label={locale === 'ar' ? 'اسم جهة الطوارئ' : 'Contact name'}><Input value={f.emergencyContactName} onChange={set('emergencyContactName')} /></Field>
            <Field label={locale === 'ar' ? 'هاتف الطوارئ' : 'Contact phone'}><Input value={f.emergencyContactPhone} onChange={set('emergencyContactPhone')} dir="ltr" inputMode="tel" /></Field>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader title={t('common.notes')} icon={<StickyNote size={15} />} />
          <div className="p-5 pt-1">
            <Field hint={locale === 'ar' ? 'ملاحظات عامة تظهر في ملف المريض.' : 'General notes shown on the patient record.'}>
              <Textarea value={f.generalNotes} onChange={set('generalNotes')} />
            </Field>
          </div>
        </Card>

        {/* Sticky action bar */}
        <div className="glass no-print sticky bottom-0 z-20 -mx-4 flex items-center justify-end gap-2 border-t border-line/60 px-4 py-3 md:-mx-6 md:px-6">
          <Button type="button" variant="secondary" onClick={() => router.back()}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={busy}>{busy ? t('common.saving') : (dupWarn ? (locale === 'ar' ? 'متابعة رغم التشابه' : 'Create anyway') : t('common.save'))}</Button>
        </div>
      </form>
    </div>
  );
}
