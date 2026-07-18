'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, LayoutList, Columns3, Phone, CalendarDays, ChevronLeft, ChevronRight, CalendarClock, CalendarPlus } from 'lucide-react';
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi, type Paginated } from '@/admin/lib/useApi';
import { api, ApiError } from '@/admin/lib/api';
import { Card, SkeletonRows, StatusBadge, EmptyState, Button, Input, Select, Textarea, Field, Dialog, Pagination, ConfirmDialog, Alert, Avatar, Segmented, PageHeader, cx, Skeleton } from '@/admin/components/ui';
import { useToast } from '@/admin/components/Toast';
import { BOOKING_STATUS } from '@/admin/i18n/dict';
import { fmtDate } from '@/admin/lib/format';
import { DatePicker, DateRangePicker, DateTimePicker, EMPTY_RANGE, type DateRangeValue } from '@/admin/components/date-picker';

interface Row { id: string; publicReference: string; fullName: string; phone: string; requestedService: string; requestedDate: string; requestedTime: string | null; source: string; status: string; patientId: string | null; }

const BOARD_COLS = ['NEW', 'CONFIRMED', 'ARRIVED', 'CONVERTED_TO_VISIT', 'CANCELLED', 'NO_SHOW'] as const;
const COL_ACCENT: Record<string, string> = {
  NEW: 'bg-brand-500', CONFIRMED: 'bg-amber-500', ARRIVED: 'bg-emerald-500',
  CONVERTED_TO_VISIT: 'bg-violet-500', CANCELLED: 'bg-red-400', NO_SHOW: 'bg-gray-400',
};
/* Legal drag transitions — mirrors existing backend workflow, no new logic */
const ALLOWED: Record<string, string[]> = {
  NEW: ['CONFIRMED', 'ARRIVED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['ARRIVED', 'CANCELLED', 'NO_SHOW'],
  ARRIVED: ['CANCELLED'],
};

function BookingCardBody({ b, locale }: { b: Row; locale: 'ar' | 'en' }) {
  return (
    <>
      <div className="flex items-center gap-2.5">
        <Avatar name={b.fullName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-ink">{b.fullName}</p>
          <p className="tabular text-[11px] font-medium text-brand-700">{b.publicReference}</p>
        </div>
      </div>
      <div className="mt-2.5 space-y-1 text-[11.5px] text-ink-faint">
        <p className="truncate">{b.requestedService}</p>
        <p className="flex items-center gap-1.5"><CalendarDays size={11} /><span className="tabular">{fmtDate(b.requestedDate, locale)}{b.requestedTime ? ` · ${b.requestedTime}` : ''}</span></p>
        <p className="flex items-center gap-1.5"><Phone size={11} /><span className="tabular" dir="ltr">{b.phone}</span></p>
      </div>
    </>
  );
}

function DraggableCard({ b, locale, draggable }: { b: Row; locale: 'ar' | 'en'; draggable: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: b.id, disabled: !draggable });
  const router = useRouter();
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      onClick={() => { if (!isDragging) router.push(`/admin/bookings/${b.id}`); }}
      className={cx('rounded-xl border border-line/70 bg-white p-3 shadow-[0_1px_2px_rgba(15,31,48,.05)] transition-all',
        draggable ? 'cursor-grab touch-none hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card active:cursor-grabbing' : 'cursor-pointer hover:border-brand-300',
        isDragging && 'opacity-30')}>
      <BookingCardBody b={b} locale={locale} />
    </div>
  );
}

function BoardColumn({ status, items, locale, isTarget, valid }: { status: string; items: Row[]; locale: 'ar' | 'en'; isTarget: boolean; valid: boolean }) {
  const droppable = status !== 'CONVERTED_TO_VISIT' && status !== 'NEW';
  const { setNodeRef, isOver } = useDroppable({ id: status, disabled: !droppable });
  return (
    <div ref={setNodeRef}
      className={cx('flex w-[248px] shrink-0 flex-col rounded-2xl border bg-surface-muted/60 transition-all',
        isOver && valid ? 'border-brand-400 bg-brand-50/60 ring-2 ring-brand-300/50' : 'border-line/60',
        isTarget && !valid && 'opacity-45')}>
      <div className="flex items-center gap-2 px-3.5 pb-2 pt-3.5">
        <span className={cx('h-2 w-2 rounded-full', COL_ACCENT[status])} aria-hidden />
        <span className="text-[13px] font-semibold text-ink">{BOOKING_STATUS[status]?.[locale] ?? status}</span>
        <span className="tabular ms-auto rounded-full bg-ink/[.06] px-2 py-0.5 text-[11px] font-semibold text-ink-soft">{items.length}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2.5 pt-1" style={{ maxHeight: 'calc(100vh - 320px)', minHeight: 96 }}>
        {items.length === 0 && (
          <div className="grid h-24 place-items-center rounded-xl border border-dashed border-line-strong/60 text-[11px] text-ink-faint">
            {locale === 'ar' ? 'لا حجوزات' : 'No bookings'}
          </div>
        )}
        {items.map((b) => <DraggableCard key={b.id} b={b} locale={locale} draggable={!!ALLOWED[b.status]?.length} />)}
      </div>
    </div>
  );
}

function BookingsInner() {
  const { t, locale } = useI18n();
  const sp = useSearchParams();
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'board'>('list');
  const [status, setStatus] = useState(sp.get('status') ?? '');
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [period, setPeriod] = useState<'day' | 'range'>('day');
  const [range, setRange] = useState<DateRangeValue>(EMPTY_RANGE);
  const [linked, setLinked] = useState('all');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: string; target: string } | null>(null);
  const [dragged, setDragged] = useState<Row | null>(null);
  const [err, setErr] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [create, setCreate] = useState({ fullName: '', phone: '', requestedService: '', requestedDate: '', requestedTime: '', durationMinutes: '30', internalNotes: '' });

  useEffect(() => { try { const v = localStorage.getItem('our_clinic_bookings_view'); if (v === 'board' || v === 'list') setView(v); } catch { /* ignore */ } }, []);
  const switchView = (v: 'list' | 'board') => { setView(v); try { localStorage.setItem('our_clinic_bookings_view', v); } catch { /* ignore */ } };

  const query = new URLSearchParams({ page: String(view === 'board' ? 1 : page), pageSize: view === 'board' ? '100' : '20', linked });
  if (status && view === 'list') query.set('status', status);
  if (q) query.set('q', q);
  if (period === 'day' && date) query.set('date', date);
  if (period === 'range' && range.start) query.set('from', range.start);
  if (period === 'range' && range.end) query.set('to', range.end);
  const { data, loading, reload } = useApi<Paginated<Row>>(`/api/bookings?${query.toString()}`);

  const grouped = useMemo(() => {
    const g: Record<string, Row[]> = Object.fromEntries(BOARD_COLS.map((c) => [c, []]));
    (data?.data ?? []).forEach((b) => { (g[b.status] ?? (g[b.status] = [])).push(b); });
    return g;
  }, [data]);

  const applyTransition = async (id: string, target: string) => {
    setErr('');
    try {
      if (target === 'CONFIRMED') await api.patch(`/api/bookings/${id}/status`, { status: 'CONFIRMED' });
      else if (target === 'ARRIVED') await api.post(`/api/bookings/${id}/arrive`);
      else await api.patch(`/api/bookings/${id}/status`, { status: target });
      await reload();
      toast(t('toast.statusChanged'));
    } catch {
      setErr(t('common.error'));
      toast(t('toast.error'), 'error');
    }
    setConfirm(null);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const onDragStart = (e: DragStartEvent) => setDragged(data?.data.find((b) => b.id === e.active.id) ?? null);
  const onDragEnd = (e: DragEndEvent) => {
    const b = dragged; setDragged(null);
    const target = e.over?.id ? String(e.over.id) : null;
    if (!b || !target || target === b.status) return;
    if (!ALLOWED[b.status]?.includes(target)) {
      if (target === 'CONVERTED_TO_VISIT') toast(locale === 'ar' ? 'افتح الحجز لتحويله إلى زيارة' : 'Open the booking to convert it to a visit', 'info');
      return;
    }
    if (target === 'CANCELLED' || target === 'NO_SHOW') { setConfirm({ id: b.id, target }); return; }
    void applyTransition(b.id, target);
  };

  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight;

  const saveCreate = async (overrideConflicts = false) => {
    setCreating(true); setErr('');
    try {
      await api.post('/api/bookings', { ...create, durationMinutes: Number(create.durationMinutes), source: 'ADMIN', overrideConflicts });
      setCreateOpen(false);
      setCreate({ fullName: '', phone: '', requestedService: '', requestedDate: '', requestedTime: '', durationMinutes: '30', internalNotes: '' });
      await reload(); toast(t('toast.created'));
    } catch (error) {
      if (error instanceof ApiError && error.code === 'CONFLICT' && !overrideConflicts) {
        const confirmed = window.confirm(locale === 'ar' ? 'يوجد تعارض مع موعد آخر. هل تريد إنشاء الحجز رغم التعارض؟' : 'This appointment conflicts with another booking. Create it anyway?');
        if (confirmed) { setCreating(false); return saveCreate(true); }
      }
      setErr(error instanceof ApiError ? error.message : t('common.error'));
    } finally { setCreating(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title={t('nav.bookings')}
        subtitle={data ? (locale === 'ar' ? `${data.total} حجز` : `${data.total} bookings`) : undefined}
        actions={<>
          <Button onClick={() => setCreateOpen(true)}><CalendarPlus size={16} />{t('bk.new')}</Button>
          <Segmented value={view} onChange={switchView} options={[
            { value: 'list', label: <><LayoutList size={15} />{locale === 'ar' ? 'قائمة' : 'List'}</> },
            { value: 'board', label: <><Columns3 size={15} />{locale === 'ar' ? 'لوحة' : 'Board'}</> },
          ]} />
        </>} />

      {/* Filter toolbar */}
      <Card className="p-3">
        <div className="mb-2"><Segmented value={period} onChange={setPeriod} options={[
          { value: 'day', label: locale === 'ar' ? 'يوم' : 'Day' },
          { value: 'range', label: locale === 'ar' ? 'نطاق زمني' : 'Date range' },
        ]} /></div>
        <div className={cx('grid gap-2 sm:grid-cols-2', view === 'list' ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-faint" style={{ insetInlineStart: 12 }} />
            <Input placeholder={t('common.search')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="ps-9" />
          </div>
          {view === 'list' && (
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">{t('common.all')} — {t('common.status')}</option>
              {Object.keys(BOOKING_STATUS).map((s) => <option key={s} value={s}>{BOOKING_STATUS[s]![locale]}</option>)}
            </Select>
          )}
          {period === 'day' ? <DatePicker label={t('common.date')} value={date} onChange={(value) => { setDate(value); setPage(1); }} /> : (
            <DateRangePicker label={locale === 'ar' ? 'النطاق الزمني' : 'Date range'} value={range} onChange={(value) => { setRange(value); setPage(1); }} presets />
          )}
          <Select value={linked} onChange={(e) => { setLinked(e.target.value); setPage(1); }}>
            <option value="all">{t('common.all')}</option>
            <option value="linked">{locale === 'ar' ? 'مرتبط بمريض' : 'Linked'}</option>
            <option value="unlinked">{locale === 'ar' ? 'غير مرتبط' : 'Unlinked'}</option>
          </Select>
        </div>
      </Card>

      {err && <Alert tone="error">{err}</Alert>}

      {view === 'board' ? (
        loading ? (
          <div className="flex gap-3 overflow-x-auto pb-2">{BOARD_COLS.map((c) => <Skeleton key={c} className="h-72 w-[248px] shrink-0 rounded-2xl" />)}</div>
        ) : (
          <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragged(null)}>
            <div className="flex gap-3 overflow-x-auto pb-3">
              {BOARD_COLS.map((c) => (
                <BoardColumn key={c} status={c} items={grouped[c] ?? []} locale={locale}
                  isTarget={!!dragged} valid={!!dragged && (ALLOWED[dragged.status]?.includes(c) || dragged.status === c)} />
              ))}
            </div>
            <DragOverlay dropAnimation={{ duration: 180 }}>
              {dragged && (
                <div className="w-[224px] rotate-2 rounded-xl border border-brand-300 bg-white p-3 shadow-pop">
                  <BookingCardBody b={dragged} locale={locale} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )
      ) : (
        <Card>
          {loading ? <SkeletonRows rows={8} cols={6} /> : !data || data.data.length === 0 ? (
            <div className="p-5"><EmptyState title={t('common.empty')} icon={<CalendarClock size={22} strokeWidth={1.75} />} hint={locale === 'ar' ? 'جرّب تعديل الفلاتر أو البحث.' : 'Try adjusting the filters or search.'} /></div>
          ) : (
            <>
              <div className="divide-y divide-line/60">
                {data.data.map((b) => (
                  <div key={b.id} className="group flex flex-wrap items-center gap-4 px-4 py-3 transition hover:bg-surface-muted/70 sm:px-5">
                    <Avatar name={b.fullName} />
                    <div className="min-w-[12rem] flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                        <Link href={`/admin/bookings/${b.id}`} className="truncate text-sm font-semibold text-ink hover:text-brand-700">{b.fullName}</Link>
                        <span className="tabular text-xs font-medium text-brand-700">{b.publicReference}</span>
                      </div>
                      <p className="tabular mt-0.5 truncate text-xs text-ink-faint">
                        {b.requestedService} · {fmtDate(b.requestedDate, locale)}{b.requestedTime ? ` · ${b.requestedTime}` : ''} · <span dir="ltr">{b.phone}</span>
                      </p>
                    </div>
                    <div className="hidden md:block"><StatusBadge kind="booking" value={b.status} locale={locale} /></div>
                    <div className="flex items-center gap-1">
                      {b.status === 'NEW' && <Button size="sm" variant="soft" onClick={() => applyTransition(b.id, 'CONFIRMED')}>{t('bk.confirm')}</Button>}
                      {(b.status === 'NEW' || b.status === 'CONFIRMED') && <Button size="sm" variant="soft" onClick={() => applyTransition(b.id, 'ARRIVED')}>{t('bk.arrive')}</Button>}
                      {(b.status === 'NEW' || b.status === 'CONFIRMED' || b.status === 'ARRIVED') && (
                        <Button size="sm" variant="ghost" className="text-ink-faint hover:bg-red-50 hover:text-red-600" onClick={() => setConfirm({ id: b.id, target: 'CANCELLED' })}>{t('common.cancel')}</Button>
                      )}
                      <Link href={`/admin/bookings/${b.id}`} aria-label={t('common.open')}
                        className="grid h-9 w-9 place-items-center rounded-xl text-ink-faint transition hover:bg-white hover:text-brand-700 hover:shadow-card">
                        <Chevron size={17} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-line/60 p-3"><Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} locale={locale} /></div>
            </>
          )}
        </Card>
      )}

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm && applyTransition(confirm.id, confirm.target)}
        title={t('common.confirm')}
        message={confirm?.target === 'NO_SHOW'
          ? (locale === 'ar' ? 'تسجيل هذا الحجز كعدم حضور؟' : 'Mark this booking as a no-show?')
          : (locale === 'ar' ? 'هل تريد إلغاء هذا الحجز؟' : 'Cancel this booking?')}
        confirmLabel={confirm?.target === 'NO_SHOW' ? (BOOKING_STATUS['NO_SHOW']?.[locale] ?? 'No-show') : t('common.cancel')} danger />

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title={t('bk.new')} wide>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t('common.name')} required><Input autoComplete="name" value={create.fullName} onChange={(event) => setCreate({ ...create, fullName: event.target.value })} /></Field>
            <Field label={t('common.phone')} required><Input autoComplete="tel" dir="ltr" value={create.phone} onChange={(event) => setCreate({ ...create, phone: event.target.value })} /></Field>
            <Field label={t('common.service')} required><Input value={create.requestedService} onChange={(event) => setCreate({ ...create, requestedService: event.target.value })} /></Field>
            <DateTimePicker
              dateLabel={t('common.date')}
              timeLabel={t('common.time')}
              value={{ date: create.requestedDate, time: create.requestedTime }}
              onChange={(value) => setCreate({ ...create, requestedDate: value.date, requestedTime: value.time })}
              required
              allowClear={false}
              className="grid gap-3 sm:col-span-2 sm:grid-cols-2"
            />
            <Field label={locale === 'ar' ? 'المدة (دقيقة)' : 'Duration (minutes)'} required><Input type="number" min={10} max={480} value={create.durationMinutes} onChange={(event) => setCreate({ ...create, durationMinutes: event.target.value })} /></Field>
          </div>
          <Field label={locale === 'ar' ? 'ملاحظات داخلية' : 'Internal notes'}><Textarea value={create.internalNotes} onChange={(event) => setCreate({ ...create, internalNotes: event.target.value })} /></Field>
          {err && <Alert tone="error">{err}</Alert>}
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button><Button onClick={() => void saveCreate()} disabled={creating || !create.fullName || !create.phone || !create.requestedService || !create.requestedDate || !create.requestedTime}>{creating ? t('common.saving') : t('common.save')}</Button></div>
        </div>
      </Dialog>
    </div>
  );
}

export default function BookingsPage() {
  return <Suspense><BookingsInner /></Suspense>;
}
