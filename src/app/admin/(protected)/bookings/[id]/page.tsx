'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, UserRound, UserPlus, ArrowUpRight, Stethoscope, CalendarDays, Phone, MessageSquareText, Link2, Sparkles, Pencil, History } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi } from '@/admin/lib/useApi';
import { api, ApiError } from '@/admin/lib/api';
import { Card, CardHeader, Spinner, StatusBadge, Button, Dialog, Field, Input, Select, Textarea, Alert, Badge, EmptyState, Breadcrumb, PageHeader, Avatar, Segmented, cx } from '@/admin/components/ui';
import { fmtDate } from '@/admin/lib/format';
import { useToast } from '@/admin/components/Toast';
import { BOOKING_STATUS } from '@/admin/i18n/dict';
import type { MatchCandidate } from '@ourclinic/contracts';
import { DatePicker, DateTimePicker, todayInAmman } from '@/admin/components/date-picker';

interface BookingDetail {
  id: string; publicReference: string; fullName: string; phone: string; requestedService: string;
  requestedDate: string; requestedTime: string | null; source: string; status: string; message: string | null;
  durationMinutes: number; internalNotes: string | null; scheduledStartAt: string; scheduledEndAt: string;
  patient: { id: string; medicalRecordNumber: string; fullName: string; phone: string } | null;
  visit: { id: string; visitNumber: string; status: string } | null;
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return { firstName: parts[0] ?? '', middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : (parts[1] ?? ''), lastName: parts.length > 1 ? parts[parts.length - 1]! : '' };
}

const JOURNEY = ['NEW', 'CONFIRMED', 'ARRIVED', 'CONVERTED_TO_VISIT'] as const;

function Journey({ status, locale }: { status: string; locale: 'ar' | 'en' }) {
  const terminal = status === 'CANCELLED' || status === 'NO_SHOW';
  const idx = JOURNEY.indexOf(status as (typeof JOURNEY)[number]);
  return (
    <div className="flex flex-wrap items-center gap-y-3">
      {JOURNEY.map((st, i) => {
        const done = idx >= 0 && i < idx;
        const current = i === idx;
        return (
          <div key={st} className="flex items-center">
            <div className="flex items-center gap-2">
              <span className={cx('grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold transition-colors',
                done ? 'bg-emerald-500 text-white' : current ? 'bg-brand-600 text-white shadow-[0_0_0_4px_rgba(54,128,194,.18)]' : 'bg-ink/[.06] text-ink-faint')}>
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span className={cx('text-[13px] font-medium', current ? 'text-ink' : done ? 'text-ink-soft' : 'text-ink-faint')}>
                {BOOKING_STATUS[st]?.[locale] ?? st}
              </span>
            </div>
            {i < JOURNEY.length - 1 && <span className={cx('mx-3 h-px w-8 sm:w-12', i < idx ? 'bg-emerald-400' : 'bg-line-strong')} aria-hidden />}
          </div>
        );
      })}
      {terminal && <span className="ms-4"><StatusBadge kind="booking" value={status} locale={locale} /></span>}
    </div>
  );
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useI18n();
  const router = useRouter();
  const { data: b, loading, reload } = useApi<BookingDetail>(`/api/bookings/${id}`);
  const { data: matchData, reload: reloadMatches } = useApi<{ matches: MatchCandidate[] }>(`/api/bookings/${id}/matches`);
  const { data: historyData, reload: reloadHistory } = useApi<{ data: Array<{ id: string; eventType: string; actorName: string | null; createdAt: string }> }>(`/api/bookings/${id}/history`);
  const [convertOpen, setConvertOpen] = useState(false);
  const [mode, setMode] = useState<'existing' | 'create'>('existing');
  const [selected, setSelected] = useState<string | null>(null);
  const [np, setNp] = useState({ firstName: '', middleName: '', lastName: '', phone: '', gender: 'UNSPECIFIED', dateOfBirth: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [edit, setEdit] = useState({ requestedDate: '', requestedTime: '', durationMinutes: '30', internalNotes: '' });
  const { toast } = useToast();

  if (loading) return <Spinner label={t('common.loading')} />;
  if (!b) return <EmptyState title={t('common.error')} />;

  const converted = b.status === 'CONVERTED_TO_VISIT';
  const inactive = b.status === 'CANCELLED' || b.status === 'NO_SHOW';
  const strengthTone = (s: string) => (s === 'strong' ? 'green' : s === 'medium' ? 'amber' : 'gray') as 'green' | 'amber' | 'gray';

  const openConvert = () => {
    setErr('');
    const s = splitName(b.fullName);
    setNp({ ...s, phone: b.phone, gender: 'UNSPECIFIED', dateOfBirth: '' });
    setSelected(b.patient?.id ?? matchData?.matches[0]?.patientId ?? null);
    setMode(b.patient ? 'existing' : (matchData && matchData.matches.length > 0 ? 'existing' : 'create'));
    setConvertOpen(true);
  };

  const doAction = async (fn: () => Promise<unknown>) => { setErr(''); try { await fn(); await reload(); await reloadMatches(); toast(t('toast.done')); } catch (e) { setErr(e instanceof ApiError ? e.message : t('common.error')); toast(t('toast.error'), 'error'); } };

  const openEdit = () => {
    setEdit({ requestedDate: b.requestedDate, requestedTime: b.requestedTime ?? '', durationMinutes: String(b.durationMinutes), internalNotes: b.internalNotes ?? '' });
    setEditOpen(true); setErr('');
  };
  const saveEdit = async (overrideConflicts = false) => {
    setBusy(true); setErr('');
    try {
      await api.patch(`/api/bookings/${id}`, { ...edit, durationMinutes: Number(edit.durationMinutes), overrideConflicts });
      await Promise.all([reload(), reloadHistory()]);
      setEditOpen(false); toast(t('toast.done'));
    } catch (error) {
      if (error instanceof ApiError && error.code === 'CONFLICT' && !overrideConflicts) {
        const confirmed = window.confirm(locale === 'ar' ? 'يوجد تعارض مع موعد آخر. هل تريد الحفظ رغم التعارض؟' : 'This appointment conflicts with another booking. Save anyway?');
        if (confirmed) { setBusy(false); return saveEdit(true); }
      }
      setErr(error instanceof ApiError ? error.message : t('common.error'));
    } finally { setBusy(false); }
  };

  const convert = async () => {
    setBusy(true); setErr('');
    try {
      const payload = mode === 'existing' ? { patientMode: 'existing', existingPatientId: selected } : { patientMode: 'create', newPatient: np };
      const res = await api.post<{ visitId: string }>(`/api/bookings/${id}/convert-to-visit`, payload);
      toast(t('toast.created'));
      router.push(`/admin/visits/${res.visitId}`);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : t('common.error'));
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: t('nav.bookings'), href: '/admin/bookings' }, { label: b.publicReference }]} />

      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1.5"><Sparkles size={12} />{b.source}</span>}
        title={<span className="tabular">{b.publicReference}</span>}
        subtitle={b.fullName}
        actions={
          <>
            {!converted && !inactive && <Button variant="secondary" onClick={openEdit}><Pencil size={16} />{t('common.edit')}</Button>}
            {!converted && (b.status === 'NEW' || b.status === 'CONFIRMED') && (
              <Button variant="secondary" onClick={() => doAction(() => api.post(`/api/bookings/${id}/arrive`))}><Check size={16} />{t('bk.arrive')}</Button>
            )}
            {!converted && <Button size="md" onClick={openConvert} disabled={inactive}><Stethoscope size={16} />{t('bk.convert')}</Button>}
            {converted && b.visit && <Link href={`/admin/visits/${b.visit.id}`}><Button><ArrowUpRight size={16} />{b.visit.visitNumber}</Button></Link>}
          </>
        } />

      {err && <Alert tone="error">{err}</Alert>}

      {/* Journey */}
      <Card className="px-5 py-4">
        <Journey status={b.status} locale={locale} />
      </Card>

      {converted && b.patient && b.visit && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-5 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-white"><Check size={18} strokeWidth={2.5} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-emerald-900">{locale === 'ar' ? 'تم تحويل الحجز إلى زيارة' : 'Booking converted to a visit'}</p>
            <p className="text-xs text-emerald-700">{b.patient.fullName} · <span className="tabular">{b.patient.medicalRecordNumber}</span></p>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/patients/${b.patient.id}`}><Button size="sm" variant="secondary"><UserRound size={14} />{b.patient.medicalRecordNumber}</Button></Link>
            <Link href={`/admin/visits/${b.visit.id}`}><Button size="sm"><Stethoscope size={14} />{b.visit.visitNumber}</Button></Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Booking summary */}
        <Card className="lg:col-span-3">
          <CardHeader title={locale === 'ar' ? 'تفاصيل الحجز' : 'Booking details'} icon={<CalendarDays size={15} />} />
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 pt-1 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Avatar name={b.fullName} />
              <div><dt className="text-xs text-ink-faint">{t('common.name')}</dt><dd className="font-medium text-ink">{b.fullName}</dd></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-muted text-ink-faint"><Phone size={16} /></span>
              <div><dt className="text-xs text-ink-faint">{t('common.phone')}</dt><dd className="tabular font-medium text-ink" dir="ltr">{b.phone}</dd></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-muted text-ink-faint"><Stethoscope size={16} /></span>
              <div><dt className="text-xs text-ink-faint">{t('common.service')}</dt><dd className="font-medium text-ink">{b.requestedService}</dd></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-muted text-ink-faint"><CalendarDays size={16} /></span>
              <div><dt className="text-xs text-ink-faint">{t('common.date')}</dt><dd className="tabular font-medium text-ink">{fmtDate(b.requestedDate, locale)}{b.requestedTime ? ` · ${b.requestedTime}` : ''}</dd></div>
            </div>
            {b.message && (
              <div className="sm:col-span-2">
                <div className="flex items-start gap-3 rounded-xl bg-surface-muted/80 p-4">
                  <MessageSquareText size={16} className="mt-0.5 shrink-0 text-ink-faint" />
                  <div><dt className="text-xs text-ink-faint">{t('bk.message')}</dt><dd className="mt-0.5 leading-relaxed text-ink">{b.message}</dd></div>
                </div>
              </div>
            )}
          </dl>
        </Card>

        {/* Patient matches */}
        <Card className="lg:col-span-2">
          <CardHeader title={t('bk.matches')} icon={<UserRound size={15} />} />
          <div className="space-y-2 p-4 pt-1">
            {!matchData ? <Spinner /> : matchData.matches.length === 0 ? (
              <EmptyState title={locale === 'ar' ? 'لا توجد مطابقات' : 'No matches'}
                icon={<UserPlus size={22} strokeWidth={1.75} />}
                hint={locale === 'ar' ? 'يمكنك إنشاء مريض جديد عند التحويل.' : 'You can create a new patient on conversion.'} />
            ) : matchData.matches.map((m) => (
              <div key={m.patientId + m.reasonCode} className="rounded-xl border border-line/70 bg-surface-raised p-3.5 transition hover:border-brand-300 hover:shadow-card">
                <div className="flex items-center gap-2.5">
                  <Avatar name={m.fullName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">{m.fullName}</p>
                    <p className="tabular text-[11px] text-ink-faint">{m.medicalRecordNumber} · <span dir="ltr">{m.phone}</span></p>
                  </div>
                  <Badge tone={strengthTone(m.strength)} dot>{locale === 'ar' ? m.reasonLabelAr : m.reasonLabelEn}</Badge>
                </div>
                {m.lastVisitAt && <p className="tabular mt-1.5 text-[11px] text-ink-faint">{t('pt.lastVisit')}: {fmtDate(m.lastVisitAt, locale)}</p>}
                <div className="mt-2.5 flex justify-end gap-1.5">
                  <Link href={`/admin/patients/${m.patientId}`}><Button size="sm" variant="ghost">{t('common.open')}</Button></Link>
                  {!converted && !inactive && (
                    <Button size="sm" variant="secondary" onClick={() => doAction(() => api.post(`/api/bookings/${id}/link-patient`, { patientId: m.patientId }))}><Link2 size={13} />{t('bk.linkPatient')}</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title={locale === 'ar' ? 'سجل الحجز' : 'Booking history'} icon={<History size={15} />} />
        <div className="divide-y divide-line/60">
          {!historyData?.data.length && <div className="p-5"><EmptyState title={t('common.empty')} /></div>}
          {historyData?.data.map((event) => (
            <div key={event.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
              <Badge tone="blue" dot>{event.eventType.replaceAll('_', ' ')}</Badge>
              <span className="text-ink-soft">{event.actorName ?? (locale === 'ar' ? 'الموقع العام' : 'Public website')}</span>
              <time className="tabular ms-auto text-xs text-ink-faint" dateTime={event.createdAt}>{new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Amman' }).format(new Date(event.createdAt))}</time>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title={locale === 'ar' ? 'تعديل الموعد' : 'Edit appointment'}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <DateTimePicker
              dateLabel={t('common.date')}
              timeLabel={t('common.time')}
              value={{ date: edit.requestedDate, time: edit.requestedTime }}
              onChange={(value) => setEdit({ ...edit, requestedDate: value.date, requestedTime: value.time })}
              required
              allowClear={false}
              className="grid gap-3 sm:col-span-2 sm:grid-cols-2"
            />
            <Field label={locale === 'ar' ? 'المدة (دقيقة)' : 'Duration (minutes)'} required><Input type="number" min={10} max={480} value={edit.durationMinutes} onChange={(event) => setEdit({ ...edit, durationMinutes: event.target.value })} /></Field>
          </div>
          <Field label={locale === 'ar' ? 'ملاحظات داخلية' : 'Internal notes'}><Textarea value={edit.internalNotes} onChange={(event) => setEdit({ ...edit, internalNotes: event.target.value })} /></Field>
          {err && <Alert tone="error">{err}</Alert>}
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setEditOpen(false)}>{t('common.cancel')}</Button><Button onClick={() => void saveEdit()} disabled={busy || !edit.requestedDate || !edit.requestedTime}>{busy ? t('common.saving') : t('common.save')}</Button></div>
        </div>
      </Dialog>

      {/* Convert dialog */}
      <Dialog open={convertOpen} onClose={() => setConvertOpen(false)} title={t('bk.convert')} wide>
        <div className="space-y-4">
          <Segmented value={mode} onChange={setMode} options={[
            { value: 'existing', label: <><UserRound size={14} />{t('bk.selectPatient')}</> },
            { value: 'create', label: <><UserPlus size={14} />{t('bk.createPatient')}</> },
          ]} />

          {mode === 'existing' ? (
            <div className="space-y-2">
              {(!matchData || matchData.matches.length === 0) && <Alert tone="warn">{locale === 'ar' ? 'لا توجد مطابقات — أنشئ مريضًا جديدًا.' : 'No matches — create a new patient.'}</Alert>}
              {matchData?.matches.map((m) => (
                <label key={m.patientId}
                  className={cx('flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all',
                    selected === m.patientId ? 'border-brand-400 bg-brand-50/60 ring-2 ring-brand-300/40' : 'border-line hover:border-line-strong hover:bg-surface-muted/60')}>
                  <input type="radio" name="pt" className="sr-only" checked={selected === m.patientId} onChange={() => setSelected(m.patientId)} />
                  <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition', selected === m.patientId ? 'border-brand-600 bg-brand-600' : 'border-line-strong bg-white')}>
                    {selected === m.patientId && <Check size={12} strokeWidth={3.5} className="text-white" />}
                  </span>
                  <Avatar name={m.fullName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{m.fullName}</p>
                    <p className="tabular text-xs text-ink-faint">{m.medicalRecordNumber} · <span dir="ltr">{m.phone}</span></p>
                  </div>
                  <Badge tone={strengthTone(m.strength)} dot>{locale === 'ar' ? m.reasonLabelAr : m.reasonLabelEn}</Badge>
                </label>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('pt.firstName')} required><Input value={np.firstName} onChange={(e) => setNp({ ...np, firstName: e.target.value })} /></Field>
              <Field label={t('pt.middleName')} required><Input value={np.middleName} onChange={(e) => setNp({ ...np, middleName: e.target.value })} /></Field>
              <Field label={t('pt.lastName')} required><Input value={np.lastName} onChange={(e) => setNp({ ...np, lastName: e.target.value })} /></Field>
              <Field label={t('common.phone')} required><Input value={np.phone} onChange={(e) => setNp({ ...np, phone: e.target.value })} dir="ltr" /></Field>
              <DatePicker label={t('pt.dob')} value={np.dateOfBirth} onChange={(dateOfBirth) => setNp({ ...np, dateOfBirth })} minDate="1900-01-01" maxDate={todayInAmman()} />
              <Field label={t('pt.gender')}>
                <Select value={np.gender} onChange={(e) => setNp({ ...np, gender: e.target.value })}>
                  <option value="UNSPECIFIED">—</option><option value="MALE">{locale === 'ar' ? 'ذكر' : 'Male'}</option><option value="FEMALE">{locale === 'ar' ? 'أنثى' : 'Female'}</option>
                </Select>
              </Field>
            </div>
          )}

          {err && <Alert tone="error">{err}</Alert>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setConvertOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={convert} disabled={busy || (mode === 'existing' && !selected)}><Stethoscope size={16} />{busy ? t('common.loading') : t('bk.convert')}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
