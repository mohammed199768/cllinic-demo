'use client';
import { use, useEffect } from 'react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi } from '@/admin/lib/useApi';
import { Spinner } from '@/admin/components/ui';
import { OBS_TYPE } from '@/admin/i18n/dict';
import { fmtDate } from '@/admin/lib/format';

interface VisitDetail {
  visitNumber: string; visitDate: string; chiefComplaint: string | null; symptoms: string | null; assessment: string | null; diagnosisText: string | null; treatmentPlan: string | null; followUpInstructions: string | null;
  patient: { medicalRecordNumber: string; fullName: string; phone: string; age: number | null; gender: string };
  observations: { id: string; type: string; valuePrimary: number | null; valueSecondary: number | null; unit: string }[];
  prescription: { notes: string | null; items: { id: string; medicationName: string; dose: string | null; frequency: string | null; duration: string | null; instructions: string | null }[] } | null;
}

export default function PrintVisit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useI18n();
  const { data: v, loading } = useApi<VisitDetail>(`/api/visits/${id}`);
  useEffect(() => { if (v) setTimeout(() => window.print(), 400); }, [v]);
  if (loading || !v) return <Spinner label={t('common.loading')} />;

  const Row = ({ label, value }: { label: string; value: string | null }) => value ? <div className="mb-2"><p className="text-xs font-semibold text-brand-700">{label}</p><p className="text-sm whitespace-pre-wrap">{value}</p></div> : null;

  return (
    <div className="print-area mx-auto max-w-2xl bg-white p-8 text-ink" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
        <div><h1 className="text-lg font-bold text-brand-800">{t('appShort')}</h1><p className="text-xs text-ink-faint">{t('appName')}</p></div>
        <div className="text-end text-xs text-ink-faint"><p>{v.visitNumber}</p><p>{fmtDate(v.visitDate, locale)}</p></div>
      </div>
      <div className="mb-3 rounded bg-amber-100 px-2 py-1 text-center text-[10px] text-amber-900">{t('demoNotice')}</div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-ink-faint">{t('common.name')}: </span>{v.patient.fullName}</div>
        <div><span className="text-ink-faint">{t('pt.mrn')}: </span><span className="tabular">{v.patient.medicalRecordNumber}</span></div>
        <div><span className="text-ink-faint">{t('common.phone')}: </span><span dir="ltr">{v.patient.phone}</span></div>
        <div><span className="text-ink-faint">{t('pt.age')}: </span>{v.patient.age ?? '—'}</div>
      </div>

      <Row label={t('vs.chiefComplaint')} value={v.chiefComplaint} />
      <Row label={t('vs.symptoms')} value={v.symptoms} />
      {v.observations.length > 0 && (
        <div className="mb-2"><p className="text-xs font-semibold text-brand-700">{t('pt.measurements')}</p><ul className="text-sm">{v.observations.map((o) => <li key={o.id}>{OBS_TYPE[o.type]?.[locale] ?? o.type}: <span className="tabular">{o.valuePrimary}{o.valueSecondary ? `/${o.valueSecondary}` : ''} {o.unit}</span></li>)}</ul></div>
      )}
      <Row label={t('vs.assessment')} value={v.assessment} />
      <Row label={t('vs.diagnosis')} value={v.diagnosisText} />
      <Row label={t('vs.plan')} value={v.treatmentPlan} />
      <Row label={t('vs.followUp')} value={v.followUpInstructions} />

      {v.prescription && v.prescription.items.length > 0 && (
        <div className="mt-3 border-t border-line pt-3"><p className="mb-1 text-xs font-semibold text-brand-700">{t('vs.prescription')}</p>
          <ol className="list-decimal space-y-1 text-sm ps-5">{v.prescription.items.map((i) => <li key={i.id}>{i.medicationName} — {[i.dose, i.frequency, i.duration].filter(Boolean).join(' · ')}{i.instructions ? ` (${i.instructions})` : ''}</li>)}</ol>
          {v.prescription.notes && <p className="mt-1 text-xs text-ink-soft">{v.prescription.notes}</p>}
        </div>
      )}
      <p className="mt-6 text-[10px] text-ink-faint">{locale === 'ar' ? 'تاريخ الطباعة' : 'Printed'}: {new Date().toLocaleString()}</p>
    </div>
  );
}
