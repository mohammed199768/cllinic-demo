'use client';
import { use, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Printer, ShieldAlert, HeartPulse, Activity, Thermometer, Scale, Ruler, Droplets, Wind, ClipboardList, Stethoscope, FileText, Pill, ChevronDown, Plus, CheckCircle2, RotateCcw, Lock, StickyNote } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi } from '@/admin/lib/useApi';
import { api, ApiError } from '@/admin/lib/api';
import { Card, CardHeader, Spinner, Button, Field, Input, Textarea, Alert, StatusBadge, Badge, Dialog, ConfirmDialog, Avatar, Breadcrumb, Select, cx } from '@/admin/components/ui';
import { OBS_TYPE } from '@/admin/i18n/dict';
import { useToast } from '@/admin/components/Toast';
import { DatePicker } from '@/admin/components/date-picker';

interface Item { id: string; medicationName: string; dose: string | null; frequency: string | null; duration: string | null; instructions: string | null; }
interface VisitDetail {
  id: string; visitNumber: string; status: string; visitDate: string;
  chiefComplaint: string | null; symptoms: string | null; symptomsStartedAt: string | null; medicalHistory: string | null;
  examinationNotes: string | null; assessment: string | null; diagnosisText: string | null; treatmentPlan: string | null; followUpInstructions: string | null; internalNotes: string | null; followUpAt: string | null;
  patient: { id: string; medicalRecordNumber: string; fullName: string; phone: string; age: number | null; gender: string; bloodType: string | null;
    conditions: { id: string; name: string; status: string }[]; allergies: { id: string; substance: string; severity: string | null }[]; medications: { id: string; name: string; dose: string | null; frequency: string | null }[];
    latestObservations: { id: string; type: string; valuePrimary: number | null; valueSecondary: number | null; unit: string }[]; };
  observations: { id: string; type: string; valuePrimary: number | null; valueSecondary: number | null; unit: string; context: string | null }[];
  prescription: { id: string; notes: string | null; items: Item[] } | null;
}

const OBS_ICON: Record<string, ReactNode> = {
  BLOOD_PRESSURE: <HeartPulse size={14} />, PULSE: <Activity size={14} />, TEMPERATURE: <Thermometer size={14} />,
  WEIGHT: <Scale size={14} />, HEIGHT: <Ruler size={14} />, BLOOD_GLUCOSE: <Droplets size={14} />, OXYGEN_SATURATION: <Wind size={14} />,
};

const SECTIONS: { titleKey: { ar: string; en: string }; icon: ReactNode; fields: { key: string; labelKey: string; area?: boolean }[] }[] = [
  {
    titleKey: { ar: 'العرض السريري', en: 'Presentation' }, icon: <ClipboardList size={15} />,
    fields: [
      { key: 'chiefComplaint', labelKey: 'vs.chiefComplaint' },
      { key: 'symptoms', labelKey: 'vs.symptoms', area: true },
      { key: 'medicalHistory', labelKey: 'vs.history', area: true },
    ],
  },
  {
    titleKey: { ar: 'الفحص والتقييم', en: 'Examination & assessment' }, icon: <Stethoscope size={15} />,
    fields: [
      { key: 'examinationNotes', labelKey: 'vs.exam', area: true },
      { key: 'assessment', labelKey: 'vs.assessment', area: true },
    ],
  },
  {
    titleKey: { ar: 'التشخيص والخطة', en: 'Diagnosis & plan' }, icon: <FileText size={15} />,
    fields: [
      { key: 'diagnosisText', labelKey: 'vs.diagnosis', area: true },
      { key: 'treatmentPlan', labelKey: 'vs.plan', area: true },
      { key: 'followUpInstructions', labelKey: 'vs.followUp', area: true },
    ],
  },
];

export default function VisitWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useI18n();
  const { data: v, loading, reload } = useApi<VisitDetail>(`/api/visits/${id}`);
  const [form, setForm] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [obsOpen, setObsOpen] = useState(false); const [completeOpen, setCompleteOpen] = useState(false); const [reopenOpen, setReopenOpen] = useState(false); const [reason, setReason] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { if (v) setForm({ chiefComplaint: v.chiefComplaint ?? '', symptoms: v.symptoms ?? '', symptomsStartedAt: v.symptomsStartedAt ?? '', medicalHistory: v.medicalHistory ?? '', examinationNotes: v.examinationNotes ?? '', assessment: v.assessment ?? '', diagnosisText: v.diagnosisText ?? '', treatmentPlan: v.treatmentPlan ?? '', followUpInstructions: v.followUpInstructions ?? '', internalNotes: v.internalNotes ?? '', followUpAt: v.followUpAt ?? '' }); if (v?.internalNotes) setNotesOpen(true); }, [v]);

  if (loading || !v) return <Spinner label={t('common.loading')} />;
  const readOnly = v.status !== 'OPEN';
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setBusy(true); setErr('');
    try { const payload: Record<string, unknown> = { ...form }; Object.keys(payload).forEach((k) => { if (payload[k] === '') payload[k] = undefined; }); payload.followUpAt = form.followUpAt; await api.patch(`/api/visits/${id}`, payload); setSavedAt(new Date().toISOString()); await reload(); toast(t('toast.saved')); }
    catch (e) { setErr(e instanceof ApiError ? e.message : t('common.error')); toast(t('toast.error'), 'error'); } finally { setBusy(false); }
  };
  const complete = async () => { try { await api.post(`/api/visits/${id}/complete`); setCompleteOpen(false); await reload(); toast(t('toast.completed')); } catch (e) { setErr(e instanceof ApiError ? e.message : t('common.error')); toast(t('toast.error'), 'error'); } };
  const reopen = async () => { try { await api.post(`/api/visits/${id}/reopen`, { reason }); setReopenOpen(false); setReason(''); await reload(); toast(t('toast.reopened')); } catch (e) { setErr(e instanceof ApiError ? e.message : t('common.error')); toast(t('toast.error'), 'error'); } };

  return (
    <div className="space-y-5 pb-2">
      <Breadcrumb items={[{ label: t('nav.patients'), href: '/admin/patients' }, { label: v.patient.fullName, href: `/admin/patients/${v.patient.id}` }, { label: v.visitNumber }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="tabular text-[26px] font-bold tracking-[-0.02em] text-ink">{v.visitNumber}</h1>
          <StatusBadge kind="visit" value={v.status} locale={locale} />
        </div>
        <a href={`/admin/visits/${id}/print`} target="_blank" rel="noreferrer"><Button variant="secondary" size="sm"><Printer size={15} />{t('vs.print')}</Button></a>
      </div>

      {err && <Alert tone="error">{err}</Alert>}
      {readOnly && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-line/70 bg-surface-muted/80 px-5 py-3.5 text-sm text-ink-soft">
          <Lock size={15} className="shrink-0 text-ink-faint" />
          {locale === 'ar' ? 'الزيارة مكتملة/مغلقة — للتعديل أعد فتحها.' : 'Visit is closed — reopen to edit.'}
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[312px_1fr]">
        {/* ==== Patient context rail ==== */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-brand-500 to-emerald-400/70" aria-hidden />
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Avatar name={v.patient.fullName} />
                <div className="min-w-0">
                  <Link href={`/admin/patients/${v.patient.id}`} className="block truncate text-sm font-semibold text-ink hover:text-brand-700">{v.patient.fullName}</Link>
                  <p className="tabular text-[11px] text-ink-faint">{v.patient.medicalRecordNumber} · <span dir="ltr">{v.patient.phone}</span></p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="neutral">{t('pt.age')}: {v.patient.age ?? '—'}</Badge>
                {v.patient.bloodType && <Badge tone="red">{v.patient.bloodType}</Badge>}
              </div>
              {v.patient.allergies.length > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200/70 bg-red-50/80 p-2.5 text-xs leading-relaxed text-red-800">
                  <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                  <span><span className="font-semibold">{t('pt.allergyWarn')}:</span> {v.patient.allergies.map((a) => a.substance).join('، ')}</span>
                </div>
              )}
              {v.patient.conditions.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-medium text-ink-faint">{t('pt.conditions')}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">{v.patient.conditions.map((c) => <Badge key={c.id} tone="blue">{c.name}</Badge>)}</div>
                </div>
              )}
              {v.patient.medications.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-medium text-ink-faint">{t('pt.medications')}</p>
                  <ul className="mt-1.5 space-y-1">
                    {v.patient.medications.map((m) => (
                      <li key={m.id} className="flex items-center gap-1.5 text-xs text-ink-soft"><Pill size={11} className="shrink-0 text-ink-faint" />{m.name} {m.dose}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title={t('pt.measurements')} icon={<HeartPulse size={15} />}
              action={!readOnly ? <Button size="sm" variant="soft" onClick={() => setObsOpen(true)}><Plus size={13} />{t('common.add')}</Button> : undefined} />
            <div className="space-y-1 px-4 pb-4 pt-0">
              {v.observations.length === 0 && <p className="rounded-xl border border-dashed border-line-strong/60 py-4 text-center text-xs text-ink-faint">{t('common.none')}</p>}
              {v.observations.map((o) => (
                <div key={o.id} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm transition hover:bg-surface-muted/70">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-muted text-ink-faint">{OBS_ICON[o.type] ?? <Activity size={14} />}</span>
                  <span className="flex-1 truncate text-[13px] text-ink-soft">{OBS_TYPE[o.type]?.[locale] ?? o.type}</span>
                  <span className="tabular text-[13px] font-semibold text-ink">{o.valuePrimary}{o.valueSecondary ? `/${o.valueSecondary}` : ''} <span className="text-[10px] font-normal text-ink-faint">{o.unit}</span></span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ==== Clinical form ==== */}
        <div className="space-y-4">
          {/* Dates */}
          <Card>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <DatePicker label={t('vs.symptomsStart')} value={form.symptomsStartedAt ?? ''} onChange={(symptomsStartedAt) => setForm({ ...form, symptomsStartedAt })} disabled={readOnly} />
              <DatePicker label={t('vs.followUpDate')} value={form.followUpAt ?? ''} onChange={(followUpAt) => setForm({ ...form, followUpAt })} disabled={readOnly} />
            </div>
          </Card>

          {SECTIONS.map((s) => (
            <Card key={s.titleKey.en}>
              <CardHeader title={s.titleKey[locale]} icon={s.icon} />
              <div className="grid gap-4 p-5 pt-1">
                {s.fields.map((f) => (
                  <Field key={f.key} label={t(f.labelKey)}>
                    {f.area ? <Textarea value={form[f.key] ?? ''} onChange={set(f.key)} disabled={readOnly} /> : <Input value={form[f.key] ?? ''} onChange={set(f.key)} disabled={readOnly} />}
                  </Field>
                ))}
              </div>
            </Card>
          ))}

          {/* Internal notes — progressive disclosure */}
          <Card>
            <button type="button" onClick={() => setNotesOpen((o) => !o)} aria-expanded={notesOpen}
              className="flex w-full items-center justify-between px-5 py-4 text-start">
              <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 text-amber-600"><StickyNote size={15} /></span>
                {t('vs.internal')}
                <span className="text-xs font-normal text-ink-faint">{locale === 'ar' ? '(لا يظهر للمريض)' : '(not shown to the patient)'}</span>
              </span>
              <ChevronDown size={17} className={cx('text-ink-faint transition-transform', notesOpen && 'rotate-180')} />
            </button>
            {notesOpen && (
              <div className="px-5 pb-5">
                <Textarea value={form.internalNotes ?? ''} onChange={set('internalNotes')} disabled={readOnly} />
              </div>
            )}
          </Card>

          <PrescriptionCard visitId={id} rx={v.prescription} readOnly={readOnly} onDone={reload} />
        </div>
      </div>

      {/* ==== Sticky action bar ==== */}
      <div className="glass no-print sticky bottom-0 z-30 -mx-4 rounded-t-2xl border-t border-line/60 md:-mx-6 lg:-mx-8">
        <div className="flex h-[68px] items-center justify-between gap-3 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-2 text-xs text-ink-faint">
            <Avatar name={v.patient.fullName} size="sm" className="hidden sm:grid" />
            <span className="hidden truncate sm:block">{v.patient.fullName} · <span className="tabular">{v.visitNumber}</span></span>
            {savedAt && !readOnly && <span className="tabular ms-2 hidden md:block">{locale === 'ar' ? 'آخر حفظ' : 'Last saved'}: {new Date(savedAt).toLocaleTimeString(locale === 'ar' ? 'ar-JO' : 'en-GB')}</span>}
          </div>
          <div className="flex items-center gap-2">
            {readOnly ? (
              <Button onClick={() => setReopenOpen(true)}><RotateCcw size={16} />{t('vs.reopen')}</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={save} disabled={busy}>{busy ? t('common.saving') : t('common.save')}</Button>
                <Button onClick={() => setCompleteOpen(true)} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 size={16} />{t('vs.complete')}</Button>
              </>
            )}
          </div>
        </div>
      </div>

      <AddVisitObservation open={obsOpen} onClose={() => setObsOpen(false)} patientId={v.patient.id} visitId={id} onDone={reload} />
      <ConfirmDialog open={completeOpen} onClose={() => setCompleteOpen(false)} onConfirm={complete} title={t('vs.complete')} message={locale === 'ar' ? 'سيتم إغلاق الزيارة وتصبح للقراءة فقط.' : 'The visit will be closed and become read-only.'} confirmLabel={t('vs.complete')} />
      <Dialog open={reopenOpen} onClose={() => setReopenOpen(false)} title={t('vs.reopen')}>
        <div className="space-y-3"><Field label={t('vs.reopenReason')} required><Input value={reason} onChange={(e) => setReason(e.target.value)} /></Field><div className="flex justify-end gap-2 pt-1"><Button variant="secondary" onClick={() => setReopenOpen(false)}>{t('common.cancel')}</Button><Button disabled={reason.trim().length < 3} onClick={reopen}>{t('vs.reopen')}</Button></div></div>
      </Dialog>
    </div>
  );
}

function AddVisitObservation({ open, onClose, patientId, visitId, onDone }: { open: boolean; onClose: () => void; patientId: string; visitId: string; onDone: () => void }) {
  const { t, locale } = useI18n();
  const [type, setType] = useState('BLOOD_PRESSURE'); const [v1, setV1] = useState(''); const [v2, setV2] = useState(''); const [unit, setUnit] = useState('mmHg'); const [ctx, setCtx] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const isBp = type === 'BLOOD_PRESSURE';
  const submit = async () => { setBusy(true); setErr(''); try { await api.post(`/api/patients/${patientId}/observations`, { type, valuePrimary: Number(v1), valueSecondary: v2 ? Number(v2) : undefined, unit, context: ctx || undefined, visitId }); onClose(); setV1(''); setV2(''); await onDone(); } catch (e) { setErr(e instanceof ApiError ? e.message : 'error'); } finally { setBusy(false); } };
  return (<Dialog open={open} onClose={onClose} title={t('vs.addMeasurement')}><div className="space-y-3">{err && <Alert tone="error">{err}</Alert>}
    <Field label={locale === 'ar' ? 'النوع' : 'Type'}><Select value={type} onChange={(e) => setType(e.target.value)}>{Object.keys(OBS_TYPE).map((k) => <option key={k} value={k}>{OBS_TYPE[k]![locale]}</option>)}</Select></Field>
    <div className="grid grid-cols-2 gap-3"><Field label={isBp ? (locale === 'ar' ? 'الانقباضي' : 'Systolic') : (locale === 'ar' ? 'القيمة' : 'Value')} required><Input type="number" step="0.1" value={v1} onChange={(e) => setV1(e.target.value)} /></Field>{isBp && <Field label={locale === 'ar' ? 'الانبساطي' : 'Diastolic'} required><Input type="number" step="0.1" value={v2} onChange={(e) => setV2(e.target.value)} /></Field>}<Field label={locale === 'ar' ? 'الوحدة' : 'Unit'} required><Input value={unit} onChange={(e) => setUnit(e.target.value)} dir="ltr" /></Field></div>
    <Field label={locale === 'ar' ? 'السياق' : 'Context'}><Input value={ctx} onChange={(e) => setCtx(e.target.value)} /></Field>
    <div className="flex justify-end gap-2 pt-1"><Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button><Button disabled={busy || !v1} onClick={submit}>{t('common.save')}</Button></div>
  </div></Dialog>);
}

function PrescriptionCard({ visitId, rx, readOnly, onDone }: { visitId: string; rx: VisitDetail['prescription']; readOnly: boolean; onDone: () => void }) {
  const { t, locale } = useI18n();
  const [notes, setNotes] = useState(rx?.notes ?? '');
  const [item, setItem] = useState({ medicationName: '', dose: '', frequency: '', duration: '', instructions: '' });
  const [err, setErr] = useState('');
  useEffect(() => setNotes(rx?.notes ?? ''), [rx?.notes]);
  const saveNotes = async () => { try { await api.put(`/api/visits/${visitId}/prescription`, { notes: notes || undefined }); await onDone(); } catch (e) { setErr(e instanceof ApiError ? e.message : 'error'); } };
  const addItem = async () => { if (!item.medicationName) return; try { await api.post(`/api/visits/${visitId}/prescription/items`, { medicationName: item.medicationName, dose: item.dose || undefined, frequency: item.frequency || undefined, duration: item.duration || undefined, instructions: item.instructions || undefined }); setItem({ medicationName: '', dose: '', frequency: '', duration: '', instructions: '' }); await onDone(); } catch (e) { setErr(e instanceof ApiError ? e.message : 'error'); } };
  const delItem = async (idi: string) => { try { await api.del(`/api/prescription-items/${idi}`); await onDone(); } catch { /* ignore */ } };

  return (
    <Card>
      <CardHeader title={t('vs.prescription')} icon={<Pill size={15} />} />
      <div className="space-y-3 p-5 pt-1">
        {err && <Alert tone="error">{err}</Alert>}
        <div className="space-y-2">
          {(rx?.items ?? []).length === 0 && <p className="rounded-xl border border-dashed border-line-strong/60 py-5 text-center text-sm text-ink-faint">{t('common.none')}</p>}
          {(rx?.items ?? []).map((it) => (
            <div key={it.id} className="flex items-center gap-3 rounded-xl border border-line/70 bg-surface-raised p-3 text-sm transition hover:shadow-card">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><Pill size={15} /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{it.medicationName}</p>
                {(it.dose || it.frequency || it.duration) && <p className="text-xs text-ink-faint">{[it.dose, it.frequency, it.duration].filter(Boolean).join(' · ')}</p>}
              </div>
              {!readOnly && <Button size="sm" variant="ghost" className="text-ink-faint hover:bg-red-50 hover:text-red-600" onClick={() => delItem(it.id)}>{t('common.delete')}</Button>}
            </div>
          ))}
        </div>
        {!readOnly && (
          <div className="grid gap-2.5 rounded-xl bg-surface-muted/80 p-3.5 sm:grid-cols-2">
            <Input placeholder={locale === 'ar' ? 'اسم الدواء' : 'Medication'} value={item.medicationName} onChange={(e) => setItem({ ...item, medicationName: e.target.value })} />
            <Input placeholder={locale === 'ar' ? 'الجرعة' : 'Dose'} value={item.dose} onChange={(e) => setItem({ ...item, dose: e.target.value })} />
            <Input placeholder={locale === 'ar' ? 'التكرار' : 'Frequency'} value={item.frequency} onChange={(e) => setItem({ ...item, frequency: e.target.value })} />
            <Input placeholder={locale === 'ar' ? 'المدة' : 'Duration'} value={item.duration} onChange={(e) => setItem({ ...item, duration: e.target.value })} />
            <div className="flex justify-end sm:col-span-2"><Button size="sm" onClick={addItem} disabled={!item.medicationName}><Plus size={14} />{t('common.add')}</Button></div>
          </div>
        )}
        <Field label={t('common.notes')}><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={readOnly} onBlur={!readOnly ? saveNotes : undefined} /></Field>
      </div>
    </Card>
  );
}
