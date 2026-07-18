'use client';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { CalendarClock, UserPlus, Stethoscope, CalendarCheck, ChevronLeft, ChevronRight, GripVertical, Users, Activity, ClipboardCheck, Inbox } from 'lucide-react';
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi } from '@/admin/lib/useApi';
import { useAuth } from '@/admin/auth/AuthProvider';
import { CardHeader, SkeletonCards, Skeleton, StatusBadge, EmptyState, Button, Badge, Avatar, cx } from '@/admin/components/ui';
import { fmtDate } from '@/admin/lib/format';
import { BOOKING_STATUS } from '@/admin/i18n/dict';
import { differenceInCalendarDays, formatDateValue, todayInAmman } from '@/admin/components/date-picker';
import type { DashboardSummary } from '@ourclinic/contracts';

/* ---------------- KPI card ---------------- */
function Stat({ label, value, href, icon, tint }: { label: string; value: number; href: string; icon: ReactNode; tint: string }) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-2xl border border-line/70 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className={cx('mb-3 grid h-9 w-9 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105', tint)}>{icon}</div>
      <p className="tabular text-[26px] font-bold leading-none tracking-[-0.02em] text-ink">{value}</p>
      <p className="mt-1.5 truncate text-xs font-medium text-ink-faint">{label}</p>
    </Link>
  );
}

/* ---------------- Sortable bento widget ---------------- */
function Widget({ id, span, children, dragLabel }: { id: string; span: string; children: ReactNode; dragLabel: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx('group/widget relative', span, isDragging && 'z-30')}>
      <div className={cx('h-full rounded-2xl border border-line/70 bg-white shadow-card transition-shadow', isDragging && 'rotate-[.4deg] shadow-lift ring-2 ring-brand-300/60')}>
        <button {...attributes} {...listeners} aria-label={dragLabel} title={dragLabel}
          className="absolute end-3 top-3.5 z-10 cursor-grab touch-none rounded-lg p-1.5 text-ink-faint/0 transition hover:bg-surface-muted active:cursor-grabbing group-hover/widget:text-ink-faint focus-visible:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
          <GripVertical size={15} />
        </button>
        {children}
      </div>
    </div>
  );
}

const FLOW = ['NEW', 'CONFIRMED', 'ARRIVED', 'CONVERTED_TO_VISIT'] as const;
const DEFAULT_ORDER = ['flow', 'recent-bookings', 'followups', 'recent-visits', 'services'];
const SPANS: Record<string, string> = {
  flow: 'lg:col-span-6', 'recent-bookings': 'lg:col-span-4', followups: 'lg:col-span-2',
  'recent-visits': 'lg:col-span-3', services: 'lg:col-span-3',
};

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { data, loading } = useApi<DashboardSummary>('/api/dashboard/summary');
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('our_clinic_dash_order') ?? 'null');
      if (Array.isArray(saved) && DEFAULT_ORDER.every((k) => saved.includes(k))) setOrder(saved);
    } catch { /* ignore */ }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((o) => {
      const next = arrayMove(o, o.indexOf(String(active.id)), o.indexOf(String(over.id)));
      try { localStorage.setItem('our_clinic_dash_order', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const todayValue = todayInAmman();
  const today = formatDateValue(todayValue, locale, 'full');
  const dragLabel = locale === 'ar' ? 'اسحب لإعادة الترتيب' : 'Drag to reorder';

  const followChip = useCallback((at: string) => {
    const d = differenceInCalendarDays(at.slice(0, 10), todayValue);
    if (d < 0) return <Badge tone="red" dot>{locale === 'ar' ? `متأخر ${-d} ي` : `${-d}d overdue`}</Badge>;
    if (d === 0) return <Badge tone="amber" dot>{locale === 'ar' ? 'اليوم' : 'Today'}</Badge>;
    if (d === 1) return <Badge tone="blue" dot>{locale === 'ar' ? 'غدًا' : 'Tomorrow'}</Badge>;
    return <Badge tone="blue">{locale === 'ar' ? `بعد ${d} ي` : `in ${d}d`}</Badge>;
  }, [locale, todayValue]);

  const widgets: Record<string, ReactNode> = useMemo(() => {
    if (!data) return {};
    const Arrow = locale === 'ar' ? ChevronLeft : ChevronRight;
    return {
      flow: (
        <>
          <CardHeader title={t('dash.flow')} icon={<Activity size={15} />} />
          <div className="grid grid-cols-2 gap-2 p-5 pt-1 sm:grid-cols-4">
            {FLOW.map((st, i) => {
              const count = data.bookingFlow.find((f) => f.status === st)?.count ?? 0;
              return (
                <Link key={st} href={`/admin/bookings?status=${st}`}
                  className="group/step relative rounded-xl border border-line/70 bg-surface-raised px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-faint">{BOOKING_STATUS[st]![locale]}</span>
                    {i < FLOW.length - 1 && <Arrow size={14} className="text-line-strong transition group-hover/step:text-brand-400" />}
                  </div>
                  <p className="tabular mt-1 text-2xl font-bold tracking-[-0.02em] text-ink">{count}</p>
                  <span className={cx('absolute inset-x-4 bottom-0 h-0.5 rounded-t-full', i === 3 ? 'bg-violet-400/70' : i === 2 ? 'bg-emerald-400/80' : 'bg-brand-400/70')} aria-hidden />
                </Link>
              );
            })}
          </div>
        </>
      ),
      'recent-bookings': (
        <>
          <CardHeader title={t('dash.recentBookings')} icon={<CalendarClock size={15} />}
            action={<Link href="/admin/bookings" className="me-8 text-xs font-medium text-brand-700 hover:text-brand-800">{t('dash.viewAll')}</Link>} />
          <div className="divide-y divide-line/60 pb-2">
            {data.recentBookings.length === 0 && <div className="p-5 pt-2"><EmptyState title={t('common.empty')} /></div>}
            {data.recentBookings.map((b) => (
              <Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-surface-muted/70">
                <Avatar name={b.fullName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{b.fullName}</p>
                  <p className="tabular truncate text-xs text-ink-faint">{b.publicReference} · {b.requestedService} · {fmtDate(b.requestedDate, locale)}</p>
                </div>
                <StatusBadge kind="booking" value={b.status} locale={locale} />
              </Link>
            ))}
          </div>
        </>
      ),
      followups: (
        <>
          <CardHeader title={t('dash.followups')} icon={<CalendarCheck size={15} />}
            action={<Link href="/admin/followups" className="me-8 text-xs font-medium text-brand-700 hover:text-brand-800">{t('dash.viewAll')}</Link>} />
          <div className="divide-y divide-line/60 pb-2">
            {data.upcomingFollowUps.length === 0 && <div className="p-5 pt-2"><EmptyState title={t('dash.noFollowups')} icon={<CalendarCheck size={22} strokeWidth={1.75} />} /></div>}
            {data.upcomingFollowUps.map((f) => (
              <Link key={f.visitId} href={`/admin/visits/${f.visitId}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-surface-muted/70">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{f.patientName}</p>
                  <p className="tabular text-xs text-ink-faint">{f.visitNumber} · {fmtDate(f.followUpAt, locale)}</p>
                </div>
                {followChip(f.followUpAt)}
              </Link>
            ))}
          </div>
        </>
      ),
      'recent-visits': (
        <>
          <CardHeader title={t('dash.recentVisits')} icon={<Stethoscope size={15} />}
            action={<Link href="/admin/visits" className="me-8 text-xs font-medium text-brand-700 hover:text-brand-800">{t('dash.viewAll')}</Link>} />
          <div className="divide-y divide-line/60 pb-2">
            {data.recentVisits.length === 0 && <div className="p-5 pt-2"><EmptyState title={t('common.empty')} /></div>}
            {data.recentVisits.map((v) => (
              <Link key={v.id} href={`/admin/visits/${v.id}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-surface-muted/70">
                <Avatar name={v.patientName ?? v.visitNumber} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{v.patientName}</p>
                  <p className="tabular text-xs text-ink-faint">{v.visitNumber} · {fmtDate(v.visitDate, locale)}</p>
                </div>
                <StatusBadge kind="visit" value={v.status} locale={locale} />
              </Link>
            ))}
          </div>
        </>
      ),
      services: (
        <>
          <CardHeader title={t('dash.services')} icon={<ClipboardCheck size={15} />} />
          <div className="space-y-3 p-5 pt-1">
            {data.serviceDistribution.length === 0 && <EmptyState title={t('common.empty')} />}
            {data.serviceDistribution.map((s, i) => {
              const max = Math.max(...data.serviceDistribution.map((x) => x.count), 1);
              return (
                <div key={s.service} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-[13px] text-ink-soft">{s.service}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/[.05]">
                    <div className={cx('h-full rounded-full transition-all duration-500', i === 0 ? 'bg-brand-500' : i === 1 ? 'bg-brand-400' : 'bg-brand-300')} style={{ width: `${(s.count / max) * 100}%` }} />
                  </div>
                  <span className="tabular w-7 shrink-0 text-end text-[13px] font-semibold text-ink">{s.count}</span>
                </div>
              );
            })}
          </div>
        </>
      ),
    };
  }, [data, followChip, locale, t]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-faint">{today}</p>
          <h1 className="mt-0.5 text-[28px] font-bold leading-tight tracking-[-0.02em] text-ink">
            {locale === 'ar' ? `${t('dash.greeting')}، ${user.name.split(' ')[0]} 👋` : `${t('dash.greeting')}, ${user.name.split(' ')[0]} 👋`}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/patients/new"><Button variant="secondary"><UserPlus size={16} />{t('pt.new')}</Button></Link>
          <Link href="/admin/bookings"><Button><CalendarClock size={16} />{t('nav.bookings')}</Button></Link>
        </div>
      </div>

      {loading || !data ? (
        <>
          <SkeletonCards />
          <div className="grid gap-4 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
        </>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Stat label={t('dash.todayBookings')} value={data.counts.todayBookings} href="/admin/bookings" icon={<CalendarClock size={17} className="text-brand-600" />} tint="bg-brand-50" />
            <Stat label={t('dash.newBookings')} value={data.counts.newBookings} href="/admin/bookings?status=NEW" icon={<Inbox size={17} className="text-sky-600" />} tint="bg-sky-50" />
            <Stat label={t('dash.arrived')} value={data.counts.arrivedBookings} href="/admin/bookings?status=ARRIVED" icon={<Users size={17} className="text-emerald-600" />} tint="bg-emerald-50" />
            <Stat label={t('dash.openVisits')} value={data.counts.openVisits} href="/admin/visits?status=OPEN" icon={<Stethoscope size={17} className="text-amber-600" />} tint="bg-amber-50" />
            <Stat label={t('dash.completedToday')} value={data.counts.completedVisitsToday} href="/admin/visits?status=COMPLETED" icon={<ClipboardCheck size={17} className="text-emerald-600" />} tint="bg-emerald-50" />
            <Stat label={t('dash.activePatients')} value={data.counts.activePatients} href="/admin/patients" icon={<Activity size={17} className="text-violet-600" />} tint="bg-violet-50" />
          </div>

          {/* Reorderable bento */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                {order.map((id) => (
                  <Widget key={id} id={id} span={SPANS[id] ?? 'lg:col-span-3'} dragLabel={dragLabel}>
                    {widgets[id]}
                  </Widget>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
