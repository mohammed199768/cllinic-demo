'use client';
import { useState } from 'react';
import { Activity as Timeline, BarChart3, Download, Printer } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi } from '@/admin/lib/useApi';
import { Alert, Badge, Button, Card, CardHeader, EmptyState, PageHeader, Segmented, SkeletonCards } from '@/admin/components/ui';
import { DatePicker, DateRangePicker, todayInAmman, type DateRangeValue } from '@/admin/components/date-picker';

interface Report {
  range: { from: string; to: string; timezone: string };
  totals: Record<string, number>;
  bookingStatusBreakdown: Array<{ status: string; count: number }>;
  bookingSourceBreakdown: Array<{ source: string; count: number }>;
  submissionBreakdown: Array<{ type: string; count: number }>;
  attendance: Array<{ publicReference: string; fullName: string; time: string; status: string }>;
  noShowList: Array<{ publicReference: string; fullName: string; time: string }>;
  events: Array<{ id: string; eventType: string; actorName: string | null; createdAt: string }>;
}

function csvCell(value: unknown) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }

export default function ReportsPage() {
  const { locale, t } = useI18n();
  const [mode, setMode] = useState<'daily' | 'range'>('daily');
  const [date, setDate] = useState(todayInAmman);
  const [range, setRange] = useState<DateRangeValue>(() => ({ start: todayInAmman(), end: todayInAmman() }));
  const path = mode === 'daily' ? `/api/admin/reports/daily?date=${date}` : `/api/admin/reports/range?from=${range.start}&to=${range.end}`;
  const { data, loading, error } = useApi<Report>(path);

  const exportCsv = () => {
    if (!data) return;
    const rows = [['Metric', 'Value'], ...Object.entries(data.totals)];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `our-clinic-report-${data.range.from}-${data.range.to}.csv`; link.click(); URL.revokeObjectURL(url);
  };
  const label = (key: string) => ({
    newBookings: locale === 'ar' ? 'حجوزات جديدة' : 'New bookings', scheduledBookings: locale === 'ar' ? 'المواعيد' : 'Scheduled',
    confirmedBookings: locale === 'ar' ? 'المؤكدة' : 'Confirmed', arrivals: locale === 'ar' ? 'الحضور' : 'Arrivals',
    noShows: locale === 'ar' ? 'عدم الحضور' : 'No-shows', cancellations: locale === 'ar' ? 'الإلغاءات' : 'Cancellations',
    convertedToVisits: locale === 'ar' ? 'تحولت لزيارة' : 'Converted', completedVisits: locale === 'ar' ? 'زيارات مكتملة' : 'Completed visits',
    newPatients: locale === 'ar' ? 'مرضى جدد' : 'New patients', childSubmissions: locale === 'ar' ? 'نماذج أطفال' : 'Child forms',
    generalMessages: locale === 'ar' ? 'رسائل عامة' : 'General messages', allSubmissions: locale === 'ar' ? 'إجمالي الطلبات' : 'All submissions',
    relatedPeople: locale === 'ar' ? 'أشخاص مرتبطون' : 'Related people',
  } as Record<string, string>)[key] ?? key;

  return (
    <div className="space-y-5">
      <PageHeader title={t('nav.reports')} subtitle={locale === 'ar' ? 'إحصاءات فعلية من قاعدة البيانات' : 'Live database statistics'} actions={<><Button variant="secondary" onClick={() => window.print()}><Printer size={16} />{locale === 'ar' ? 'طباعة' : 'Print'}</Button><Button onClick={exportCsv} disabled={!data}><Download size={16} />CSV</Button></>} />
      <Card className="no-print p-3"><div className="flex flex-wrap items-end gap-3"><Segmented value={mode} onChange={setMode} options={[{ value: 'daily', label: locale === 'ar' ? 'ملخص يومي' : 'Daily summary' }, { value: 'range', label: locale === 'ar' ? 'نطاق زمني' : 'Date range' }]} />{mode === 'daily' ? <DatePicker label={t('common.date')} value={date} onChange={setDate} required allowClear={false} className="w-full sm:w-72" /> : <DateRangePicker label={locale === 'ar' ? 'النطاق الزمني' : 'Date range'} value={range} onChange={setRange} required allowClear={false} presets className="w-full sm:min-w-80 sm:flex-1" />}</div></Card>
      {error && <Alert tone="error">{error}</Alert>}
      {loading || !data ? <SkeletonCards /> : <>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{Object.entries(data.totals).map(([key, value]) => <Card key={key} className="p-4"><p className="tabular text-2xl font-bold text-ink">{value}</p><p className="mt-1 text-xs text-ink-faint">{label(key)}</p></Card>)}</div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            [locale === 'ar' ? 'حالات الحجز' : 'Booking status', data.bookingStatusBreakdown, 'status'],
            [locale === 'ar' ? 'مصادر الحجز' : 'Booking sources', data.bookingSourceBreakdown, 'source'],
            [locale === 'ar' ? 'طلبات الموقع' : 'Submissions', data.submissionBreakdown, 'type'],
          ].map(([title, rows, key]) => {
            const items = rows as Array<Record<string, string | number>>; const max = Math.max(1, ...items.map((item) => Number(item.count)));
            return <Card key={String(title)}><CardHeader title={String(title)} icon={<BarChart3 size={15} />} /><div className="space-y-3 p-5 pt-1">{!items.length && <EmptyState title={t('common.empty')} />}{items.map((item) => <div key={String(item[String(key)])}><div className="mb-1 flex justify-between gap-2 text-xs"><span className="text-ink-soft">{String(item[String(key)]).replaceAll('_', ' ')}</span><span className="tabular font-semibold text-ink">{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-ink/[.06]" aria-label={`${item[String(key)]}: ${item.count}`}><div className="h-full rounded-full bg-brand-500" style={{ width: `${Number(item.count) / max * 100}%` }} /></div></div>)}</div></Card>;
          })}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader title={locale === 'ar' ? 'الحضور مقابل عدم الحضور' : 'Attendance versus no-show'} /><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-surface-muted text-start text-xs text-ink-faint"><th className="px-4 py-2 text-start">{t('common.reference')}</th><th className="px-4 py-2 text-start">{t('common.name')}</th><th className="px-4 py-2 text-start">{t('common.time')}</th><th className="px-4 py-2 text-start">{t('common.status')}</th></tr></thead><tbody>{[...data.attendance, ...data.noShowList.map((row) => ({ ...row, status: 'NO_SHOW' }))].map((row) => <tr key={`${row.publicReference}-${row.status}`} className="border-t border-line/60"><td className="tabular px-4 py-2">{row.publicReference}</td><td className="px-4 py-2">{row.fullName}</td><td className="tabular px-4 py-2">{row.time}</td><td className="px-4 py-2"><Badge tone={row.status === 'NO_SHOW' ? 'gray' : 'green'} dot>{row.status.replaceAll('_', ' ')}</Badge></td></tr>)}</tbody></table>{!data.attendance.length && !data.noShowList.length && <div className="p-4"><EmptyState title={t('common.empty')} /></div>}</div></Card>
          <Card><CardHeader title={locale === 'ar' ? 'الخط الزمني التشغيلي' : 'Operational timeline'} icon={<Timeline size={15} />} /><div className="max-h-96 divide-y divide-line/60 overflow-y-auto">{!data.events.length && <div className="p-4"><EmptyState title={t('common.empty')} /></div>}{data.events.map((event) => <div key={event.id} className="flex items-start gap-3 px-4 py-3"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-ink">{event.eventType.replaceAll('_', ' ')}</p><p className="text-xs text-ink-faint">{event.actorName ?? (locale === 'ar' ? 'الموقع العام' : 'Public website')}</p></div><time className="tabular text-xs text-ink-faint">{new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Amman' }).format(new Date(event.createdAt))}</time></div>)}</div></Card>
        </div>
      </>}
    </div>
  );
}
