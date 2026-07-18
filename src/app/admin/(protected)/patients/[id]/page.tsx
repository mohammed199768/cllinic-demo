'use client';
import { use, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Stethoscope, HeartPulse, Activity, Thermometer, Scale, Ruler, Droplets, Wind, CalendarClock, Pill, ShieldAlert, ClipboardList, History, Plus } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi } from '@/admin/lib/useApi';
import { api, ApiError } from '@/admin/lib/api';
import { Card, CardHeader, Spinner, EmptyState, Button, Tabs, Badge, StatusBadge, Dialog, Field, Input, Select, Alert, ConfirmDialog, Avatar, Breadcrumb, cx } from '@/admin/components/ui';
import { GENDER, OBS_TYPE } from '@/admin/i18n/dict';
import { fmtDate, fmtDateTime } from '@/admin/lib/format';
import { todayInAmman } from '@/admin/components/date-picker';

interface Obs { id: string; type: string; measuredAt: string; valuePrimary: number | null; valueSecondary: number | null; unit: string; context: string | null; }
interface PatientDetail {
  id: string; medicalRecordNumber: string; fullName: string; phone: string; secondaryPhone: string | null;
  dateOfBirth: string | null; age: number | null; gender: string; bloodType: string | null; generalNotes: string | null; archivedAt: string | null; createdAt: string;
  conditions: { id: string; name: string; status: string; diagnosedAt: string | null; notes: string | null }[];
  allergies: { id: string; substance: string; reaction: string | null; severity: string | null; notes: string | null }[];
  medications: { id: string; name: string; dose: string | null; unit: string | null; frequency: string | null; route: string | null; active: boolean }[];
  latestObservations: Obs[]; observationHistory: Obs[];
  visits: { id: string; visitNumber: string; visitDate: string; status: string; chiefComplaint: string | null; completedAt: string | null }[];
  bookings: { id: string; publicReference: string; requestedService: string; requestedDate: string; status: string }[];
}

const OBS_ICON: Record<string, ReactNode> = {
  BLOOD_PRESSURE: <HeartPulse size={16} />, PULSE: <Activity size={16} />, TEMPERATURE: <Thermometer size={16} />,
  WEIGHT: <Scale size={16} />, HEIGHT: <Ruler size={16} />, BLOOD_GLUCOSE: <Droplets size={16} />, OXYGEN_SATURATION: <Wind size={16} />,
};
const OBS_TINT: Record<string, string> = {
  BLOOD_PRESSURE: 'bg-rose-50 text-rose-600', PULSE: 'bg-brand-50 text-brand-600', TEMPERATURE: 'bg-amber-50 text-amber-600',
  WEIGHT: 'bg-violet-50 text-violet-600', HEIGHT: 'bg-sky-50 text-sky-600', BLOOD_GLUCOSE: 'bg-emerald-50 text-emerald-600', OXYGEN_SATURATION: 'bg-cyan-50 text-cyan-600',
};

export default function PatientProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useI18n();
  const router = useRouter();
  const { data: p, loading, reload } = useApi<PatientDetail>(`/api/patients/${id}`);
  const [tab, setTab] = useState('overview');
  const [obsOpen, setObsOpen] = useState(false);
  const [condOpen, setCondOpen] = useState(false);
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [medOpen, setMedOpen] = useState(false);
  const [delObs, setDelObs] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const timeline = useMemo(() => {
    if (!p) return [];
    const items: { at: string; text: string; kind: 'created' | 'booking' | 'visit' | 'obs' }[] = [];
    items.push({ at: p.createdAt, text: locale === 'ar' ? 'تم إنشاء ملف المريض' : 'Patient record created', kind: 'created' });
    p.bookings.forEach((b) => items.push({ at: b.requestedDate, text: `${locale === 'ar' ? 'حجز' : 'Booking'} ${b.publicReference}`, kind: 'booking' }));
    p.visits.forEach((v) => items.push({ at: v.visitDate, text: `${locale === 'ar' ? 'زيارة' : 'Visit'} ${v.visitNumber}`, kind: 'visit' }));
    p.observationHistory.slice(0, 10).forEach((o) => items.push({ at: o.measuredAt, text: `${OBS_TYPE[o.type]?.[locale] ?? o.type}: ${o.valuePrimary}${o.valueSecondary ? '/' + o.valueSecondary : ''} ${o.unit}`, kind: 'obs' }));
    return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 15);
  }, [p, locale]);

  if (loading) return <Spinner label={t('common.loading')} />;
  if (!p) return <EmptyState title={t('common.error')} />;

  const startVisit = async () => {
    setErr('');
    try {
      const today = todayInAmman();
      const bk = await api.post<{ id: string }>('/api/bookings', { fullName: p.fullName, phone: p.phone, requestedService: locale === 'ar' ? 'زيارة مباشرة' : 'Walk-in visit', requestedDate: today });
      const res = await api.post<{ visitId: string }>(`/api/bookings/${bk.id}/convert-to-visit`, { patientMode: 'existing', existingPatientId: p.id });
      router.push(`/admin/visits/${res.visitId}`);
    } catch (e) { setErr(e instanceof ApiError ? e.message : t('common.error')); }
  };

  const openVisit = p.visits.find((v) => v.status === 'OPEN');
  const tabs = [
    { key: 'overview', label: t('pt.overview') },
    { key: 'visits', label: t('nav.visits') },
    { key: 'measurements', label: t('pt.measurements') },
    { key: 'conditions', label: t('pt.conditions') },
    { key: 'medications', label: t('pt.medications') },
    { key: 'bookings', label: t('nav.bookings') },
  ];

  const TL_DOT = { created: 'bg-ink-faint', booking: 'bg-brand-400', visit: 'bg-emerald-500', obs: 'bg-violet-400' };

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: t('nav.patients'), href: '/admin/patients' }, { label: p.fullName }]} />
      {err && <Alert tone="error">{err}</Alert>}

      {/* Patient header */}
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-brand-500 via-brand-400 to-emerald-400/70" aria-hidden />
        <div className="flex flex-wrap items-center gap-4 p-5">
          <Avatar name={p.fullName} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-[-0.02em] text-ink">{p.fullName}</h1>
              {p.archivedAt && <Badge tone="gray">{t('pt.archived')}</Badge>}
              {openVisit && <Badge tone="blue" dot>{locale === 'ar' ? 'زيارة مفتوحة' : 'Open visit'}</Badge>}
            </div>
            <p className="tabular mt-1 text-sm text-ink-faint">{p.medicalRecordNumber} · <span dir="ltr">{p.phone}</span></p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="neutral">{t('pt.age')}: {p.age ?? '—'}</Badge>
              {GENDER[p.gender]?.[locale] && <Badge tone="neutral">{GENDER[p.gender]![locale]}</Badge>}
              {p.bloodType && <Badge tone="red">{p.bloodType}</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/patients/${id}/edit`}><Button variant="secondary"><Pencil size={15} />{t('common.edit')}</Button></Link>
            {openVisit
              ? <Link href={`/admin/visits/${openVisit.id}`}><Button><Stethoscope size={16} />{locale === 'ar' ? 'متابعة الزيارة' : 'Resume visit'}</Button></Link>
              : <Button onClick={startVisit}><Stethoscope size={16} />{locale === 'ar' ? 'بدء زيارة' : 'Start visit'}</Button>}
          </div>
        </div>
        {p.allergies.length > 0 && (
          <div className="flex items-center gap-2.5 border-t border-red-100 bg-red-50/70 px-5 py-3 text-sm text-red-800">
            <ShieldAlert size={16} className="shrink-0" />
            <span><span className="font-semibold">{t('pt.allergyWarn')}:</span> {p.allergies.map((a) => a.substance).join('، ')}</span>
          </div>
        )}
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader title={t('pt.measurements')} icon={<HeartPulse size={15} />}
              action={<Button size="sm" variant="soft" onClick={() => setObsOpen(true)}><Plus size={14} />{t('common.add')}</Button>} />
            <div className="grid grid-cols-2 gap-3 p-5 pt-1 sm:grid-cols-3">
              {p.latestObservations.length === 0 && <div className="col-span-full"><EmptyState title={t('common.none')} icon={<HeartPulse size={22} strokeWidth={1.75} />} hint={locale === 'ar' ? 'أضف أول قياس لهذا المريض.' : 'Add the first measurement for this patient.'} /></div>}
              {p.latestObservations.map((o) => (
                <div key={o.id} className="rounded-xl border border-line/70 bg-surface-raised p-3.5 transition hover:shadow-card">
                  <span className={cx('mb-2.5 grid h-8 w-8 place-items-center rounded-lg', OBS_TINT[o.type] ?? 'bg-surface-muted text-ink-faint')}>{OBS_ICON[o.type] ?? <Activity size={16} />}</span>
                  <p className="tabular text-lg font-bold leading-none tracking-[-0.01em] text-ink">
                    {o.valuePrimary}{o.valueSecondary ? `/${o.valueSecondary}` : ''} <span className="text-[11px] font-medium text-ink-faint">{o.unit}</span>
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-ink-faint">{OBS_TYPE[o.type]?.[locale] ?? o.type}</p>
                  <p className="tabular mt-0.5 text-[10px] text-ink-faint/80">{fmtDate(o.measuredAt, locale)}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader title={t('pt.timeline')} icon={<History size={15} />} />
            <ol className="relative ms-5 space-y-0 border-s border-line px-5 pb-5 pt-1">
              {timeline.map((it, i) => (
                <li key={i} className="relative pb-4 last:pb-0">
                  <span className={cx('absolute -start-[26px] top-1 h-3 w-3 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,31,48,.08)]', TL_DOT[it.kind])} aria-hidden />
                  <p className="text-[13px] font-medium leading-snug text-ink">{it.text}</p>
                  <p className="tabular mt-0.5 text-[11px] text-ink-faint">{fmtDateTime(it.at, locale)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}

      {tab === 'visits' && (
        <Card>
          {p.visits.length === 0 ? <div className="p-5"><EmptyState title={t('common.empty')} icon={<Stethoscope size={22} strokeWidth={1.75} />} /></div> : (
            <div className="divide-y divide-line/60">
              {p.visits.map((v) => (
                <Link key={v.id} href={`/admin/visits/${v.id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-surface-muted/70">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Stethoscope size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="tabular text-sm font-semibold text-ink">{v.visitNumber}</p>
                    <p className="tabular truncate text-xs text-ink-faint">{fmtDate(v.visitDate, locale)}{v.chiefComplaint ? ` · ${v.chiefComplaint}` : ''}</p>
                  </div>
                  <StatusBadge kind="visit" value={v.status} locale={locale} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'measurements' && (
        <Card>
          <CardHeader title={t('pt.measurements')} icon={<HeartPulse size={15} />} action={<Button size="sm" onClick={() => setObsOpen(true)}><Plus size={14} />{t('vs.addMeasurement')}</Button>} />
          {p.observationHistory.length === 0 ? <div className="p-5 pt-1"><EmptyState title={t('common.empty')} icon={<HeartPulse size={22} strokeWidth={1.75} />} /></div> : (
            <div className="divide-y divide-line/60">
              {p.observationHistory.map((o) => (
                <div key={o.id} className="flex items-center gap-3.5 px-5 py-3">
                  <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', OBS_TINT[o.type] ?? 'bg-surface-muted text-ink-faint')}>{OBS_ICON[o.type] ?? <Activity size={16} />}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      {OBS_TYPE[o.type]?.[locale] ?? o.type}
                      <span className="tabular ms-2 font-bold">{o.valuePrimary}{o.valueSecondary ? `/${o.valueSecondary}` : ''} <span className="text-xs font-medium text-ink-faint">{o.unit}</span></span>
                      {o.context && <span className="ms-2 text-xs text-ink-faint">({o.context})</span>}
                    </p>
                    <p className="tabular text-[11px] text-ink-faint">{fmtDateTime(o.measuredAt, locale)}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-ink-faint hover:bg-red-50 hover:text-red-600" onClick={() => setDelObs(o.id)}>{t('common.delete')}</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'conditions' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title={t('pt.conditions')} icon={<ClipboardList size={15} />} action={<Button size="sm" variant="soft" onClick={() => setCondOpen(true)}><Plus size={14} />{t('common.add')}</Button>} />
            <div className="divide-y divide-line/60">
              {p.conditions.length === 0 && <div className="p-5 pt-1"><EmptyState title={t('common.none')} /></div>}
              {p.conditions.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0"><p className="text-sm font-medium text-ink">{c.name}</p><Badge tone={c.status === 'ACTIVE' ? 'amber' : c.status === 'RESOLVED' ? 'green' : 'neutral'} dot>{c.status}</Badge></div>
                  <Button size="sm" variant="ghost" className="text-ink-faint" onClick={() => api.del(`/api/conditions/${c.id}`).then(reload)}>{locale === 'ar' ? 'أرشفة' : 'Archive'}</Button>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title={t('pt.allergies')} icon={<ShieldAlert size={15} />} action={<Button size="sm" variant="soft" onClick={() => setAllergyOpen(true)}><Plus size={14} />{t('common.add')}</Button>} />
            <div className="divide-y divide-line/60">
              {p.allergies.length === 0 && <div className="p-5 pt-1"><EmptyState title={t('common.none')} /></div>}
              {p.allergies.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0"><p className="text-sm font-medium text-ink">{a.substance}</p><p className="text-xs text-ink-faint">{a.reaction} {a.severity ? `· ${a.severity}` : ''}</p></div>
                  <Button size="sm" variant="ghost" className="text-ink-faint" onClick={() => api.del(`/api/allergies/${a.id}`).then(reload)}>{locale === 'ar' ? 'أرشفة' : 'Archive'}</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'medications' && (
        <Card>
          <CardHeader title={t('pt.medications')} icon={<Pill size={15} />} action={<Button size="sm" variant="soft" onClick={() => setMedOpen(true)}><Plus size={14} />{t('common.add')}</Button>} />
          <div className="divide-y divide-line/60">
            {p.medications.length === 0 && <div className="p-5 pt-1"><EmptyState title={t('common.none')} icon={<Pill size={22} strokeWidth={1.75} />} /></div>}
            {p.medications.map((m) => (
              <div key={m.id} className="flex items-center gap-3.5 px-5 py-3.5">
                <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', m.active ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-muted text-ink-faint')}><Pill size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">{m.name} {!m.active && <Badge tone="gray">{locale === 'ar' ? 'متوقف' : 'inactive'}</Badge>}</p>
                  <p className="text-xs text-ink-faint">{[m.dose, m.unit, m.frequency, m.route].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => api.patch(`/api/medications/${m.id}`, { active: !m.active }).then(reload)}>{m.active ? (locale === 'ar' ? 'إيقاف' : 'Deactivate') : (locale === 'ar' ? 'تفعيل' : 'Activate')}</Button>
                  <Button size="sm" variant="ghost" className="text-ink-faint" onClick={() => api.del(`/api/medications/${m.id}`).then(reload)}>{locale === 'ar' ? 'أرشفة' : 'Archive'}</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'bookings' && (
        <Card>
          {p.bookings.length === 0 ? <div className="p-5"><EmptyState title={t('common.empty')} icon={<CalendarClock size={22} strokeWidth={1.75} />} /></div> : (
            <div className="divide-y divide-line/60">
              {p.bookings.map((b) => (
                <Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-surface-muted/70">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><CalendarClock size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="tabular text-sm font-semibold text-ink">{b.publicReference}</p>
                    <p className="tabular truncate text-xs text-ink-faint">{b.requestedService} · {fmtDate(b.requestedDate, locale)}</p>
                  </div>
                  <StatusBadge kind="booking" value={b.status} locale={locale} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}

      <AddObservation open={obsOpen} onClose={() => setObsOpen(false)} patientId={id} onDone={reload} />
      <AddCondition open={condOpen} onClose={() => setCondOpen(false)} patientId={id} onDone={reload} />
      <AddAllergy open={allergyOpen} onClose={() => setAllergyOpen(false)} patientId={id} onDone={reload} />
      <AddMedication open={medOpen} onClose={() => setMedOpen(false)} patientId={id} onDone={reload} />
      <ConfirmDialog open={!!delObs} onClose={() => setDelObs(null)} onConfirm={async () => { if (delObs) { await api.del(`/api/observations/${delObs}`); setDelObs(null); await reload(); } }} title={t('common.delete')} message={locale === 'ar' ? 'حذف هذا القياس؟' : 'Delete this measurement?'} confirmLabel={t('common.delete')} danger />
    </div>
  );
}

function useAdd(patientId: string, path: string, onClose: () => void, onDone: () => void) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const submit = async (payload: Record<string, unknown>) => { setBusy(true); setErr(''); try { await api.post(`/api/patients/${patientId}/${path}`, payload); onClose(); await onDone(); } catch (e) { setErr(e instanceof ApiError ? e.message : 'error'); } finally { setBusy(false); } };
  return { busy, err, submit };
}

function AddObservation({ open, onClose, patientId, onDone }: { open: boolean; onClose: () => void; patientId: string; onDone: () => void }) {
  const { t, locale } = useI18n();
  const [type, setType] = useState('BLOOD_PRESSURE'); const [v1, setV1] = useState(''); const [v2, setV2] = useState(''); const [unit, setUnit] = useState('mmHg'); const [ctx, setCtx] = useState('');
  const { busy, err, submit } = useAdd(patientId, 'observations', onClose, onDone);
  const isBp = type === 'BLOOD_PRESSURE';
  return (
    <Dialog open={open} onClose={onClose} title={t('vs.addMeasurement')}>
      <div className="space-y-3">
        {err && <Alert tone="error">{err}</Alert>}
        <Field label={locale === 'ar' ? 'النوع' : 'Type'}><Select value={type} onChange={(e) => setType(e.target.value)}>{Object.keys(OBS_TYPE).map((k) => <option key={k} value={k}>{OBS_TYPE[k]![locale]}</option>)}</Select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={isBp ? (locale === 'ar' ? 'الانقباضي' : 'Systolic') : (locale === 'ar' ? 'القيمة' : 'Value')} required><Input type="number" step="0.1" value={v1} onChange={(e) => setV1(e.target.value)} /></Field>
          {isBp && <Field label={locale === 'ar' ? 'الانبساطي' : 'Diastolic'} required><Input type="number" step="0.1" value={v2} onChange={(e) => setV2(e.target.value)} /></Field>}
          <Field label={locale === 'ar' ? 'الوحدة' : 'Unit'} required><Input value={unit} onChange={(e) => setUnit(e.target.value)} dir="ltr" /></Field>
        </div>
        <Field label={locale === 'ar' ? 'السياق' : 'Context'}><Input value={ctx} onChange={(e) => setCtx(e.target.value)} /></Field>
        <div className="flex justify-end gap-2 pt-1"><Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button><Button disabled={busy} onClick={() => submit({ type, valuePrimary: Number(v1), valueSecondary: v2 ? Number(v2) : undefined, unit, context: ctx || undefined })}>{t('common.save')}</Button></div>
      </div>
    </Dialog>
  );
}
function AddCondition({ open, onClose, patientId, onDone }: { open: boolean; onClose: () => void; patientId: string; onDone: () => void }) {
  const { t } = useI18n(); const [name, setName] = useState(''); const [status, setStatus] = useState('ACTIVE'); const { busy, err, submit } = useAdd(patientId, 'conditions', onClose, onDone);
  return (<Dialog open={open} onClose={onClose} title={t('pt.conditions')}><div className="space-y-3">{err && <Alert tone="error">{err}</Alert>}<Field label={t('common.name')} required><Input value={name} onChange={(e) => setName(e.target.value)} /></Field><Field label={t('common.status')}><Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="ACTIVE">ACTIVE</option><option value="CONTROLLED">CONTROLLED</option><option value="RESOLVED">RESOLVED</option><option value="UNKNOWN">UNKNOWN</option></Select></Field><div className="flex justify-end gap-2 pt-1"><Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button><Button disabled={busy || !name} onClick={() => submit({ name, status })}>{t('common.add')}</Button></div></div></Dialog>);
}
function AddAllergy({ open, onClose, patientId, onDone }: { open: boolean; onClose: () => void; patientId: string; onDone: () => void }) {
  const { t, locale } = useI18n(); const [substance, setSubstance] = useState(''); const [reaction, setReaction] = useState(''); const [severity, setSeverity] = useState(''); const { busy, err, submit } = useAdd(patientId, 'allergies', onClose, onDone);
  return (<Dialog open={open} onClose={onClose} title={t('pt.allergies')}><div className="space-y-3">{err && <Alert tone="error">{err}</Alert>}<Field label={locale === 'ar' ? 'المادة' : 'Substance'} required><Input value={substance} onChange={(e) => setSubstance(e.target.value)} /></Field><Field label={locale === 'ar' ? 'التفاعل' : 'Reaction'}><Input value={reaction} onChange={(e) => setReaction(e.target.value)} /></Field><Field label={locale === 'ar' ? 'الشدة (تُدخل يدويًا)' : 'Severity (manual)'}><Input value={severity} onChange={(e) => setSeverity(e.target.value)} /></Field><div className="flex justify-end gap-2 pt-1"><Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button><Button disabled={busy || !substance} onClick={() => submit({ substance, reaction: reaction || undefined, severity: severity || undefined })}>{t('common.add')}</Button></div></div></Dialog>);
}
function AddMedication({ open, onClose, patientId, onDone }: { open: boolean; onClose: () => void; patientId: string; onDone: () => void }) {
  const { t, locale } = useI18n(); const [name, setName] = useState(''); const [dose, setDose] = useState(''); const [frequency, setFrequency] = useState(''); const { busy, err, submit } = useAdd(patientId, 'medications', onClose, onDone);
  return (<Dialog open={open} onClose={onClose} title={t('pt.medications')}><div className="space-y-3">{err && <Alert tone="error">{err}</Alert>}<Field label={t('common.name')} required><Input value={name} onChange={(e) => setName(e.target.value)} /></Field><div className="grid grid-cols-2 gap-3"><Field label={locale === 'ar' ? 'الجرعة' : 'Dose'}><Input value={dose} onChange={(e) => setDose(e.target.value)} /></Field><Field label={locale === 'ar' ? 'التكرار' : 'Frequency'}><Input value={frequency} onChange={(e) => setFrequency(e.target.value)} /></Field></div><div className="flex justify-end gap-2 pt-1"><Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button><Button disabled={busy || !name} onClick={() => submit({ name, dose: dose || undefined, frequency: frequency || undefined, active: true })}>{t('common.add')}</Button></div></div></Dialog>);
}
