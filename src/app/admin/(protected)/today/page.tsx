'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Activity, CalendarCheck, ClipboardList, Phone } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi } from '@/admin/lib/useApi';
import { api, ApiError } from '@/admin/lib/api';
import { Alert, Avatar, Badge, Button, Card, CardHeader, EmptyState, PageHeader, SkeletonRows, StatusBadge } from '@/admin/components/ui';
import { DatePicker, formatDateValue, todayInAmman } from '@/admin/components/date-picker';

interface Appointment {
  id: string; publicReference: string; fullName: string; phone: string; requestedService: string;
  date: string; time: string; scheduledStartAt: string; status: string; source: string;
}
interface DailyReport {
  totals: Record<string, number>;
  appointments: Appointment[];
  submissions: Array<{ id: string; type: string; status: string; name: string | null; subject: string | null; createdAt: string }>;
  events: Array<{ id: string; eventType: string; actorName: string | null; createdAt: string }>;
}

export default function TodayPage() {
  const { locale, t } = useI18n();
  const [date, setDate] = useState(todayInAmman);
  const [error, setError] = useState('');
  const { data, loading, reload } = useApi<DailyReport>(`/api/admin/reports/daily?date=${date}`);
  const selectedDateLabel = formatDateValue(date, locale, 'full');

  const setStatus = async (booking: Appointment, status: string) => {
    setError('');
    try {
      if (status === 'ARRIVED') await api.post(`/api/bookings/${booking.id}/arrive`);
      else await api.patch(`/api/bookings/${booking.id}/status`, { status });
      await reload();
    } catch (reason) { setError(reason instanceof ApiError ? reason.message : t('common.error')); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title={t('nav.today')} subtitle={selectedDateLabel} actions={<DatePicker label={t('common.date')} value={date} onChange={setDate} required allowClear={false} className="w-full sm:w-72" />} />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ['scheduledBookings', locale === 'ar' ? 'المواعيد' : 'Appointments'],
          ['confirmedBookings', locale === 'ar' ? 'تم تأكيدها' : 'Confirmed'],
          ['arrivals', locale === 'ar' ? 'الحضور' : 'Arrivals'],
          ['noShows', locale === 'ar' ? 'عدم الحضور' : 'No-shows'],
          ['cancellations', locale === 'ar' ? 'الملغاة' : 'Cancelled'],
          ['allSubmissions', locale === 'ar' ? 'طلبات الموقع' : 'Submissions'],
        ].map(([key, label]) => <Card key={key} className="p-4"><p className="tabular text-2xl font-bold text-ink">{data?.totals[key] ?? 0}</p><p className="mt-1 text-xs text-ink-faint">{label}</p></Card>)}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title={locale === 'ar' ? 'المواعيد حسب الوقت' : 'Appointments by time'} icon={<CalendarCheck size={15} />} />
          {loading ? <SkeletonRows rows={5} cols={5} /> : !data?.appointments.length ? <div className="p-5"><EmptyState title={locale === 'ar' ? 'لا مواعيد لهذا اليوم' : 'No appointments for this day'} /></div> : (
            <div className="divide-y divide-line/60">
              {data.appointments.map((booking) => (
                <div key={booking.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <time className="tabular w-12 font-semibold text-brand-700" dateTime={booking.scheduledStartAt}>{booking.time}</time>
                  <Avatar name={booking.fullName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/bookings/${booking.id}`} className="text-sm font-semibold text-ink hover:text-brand-700">{booking.fullName}</Link>
                    <p className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint"><span>{booking.requestedService}</span><span>·</span><Phone size={11} /><span dir="ltr">{booking.phone}</span></p>
                  </div>
                  <StatusBadge kind="booking" value={booking.status} locale={locale} />
                  <div className="flex flex-wrap gap-1.5">
                    {booking.status === 'NEW' && <Button size="sm" variant="soft" onClick={() => void setStatus(booking, 'CONFIRMED')}>{t('bk.confirm')}</Button>}
                    {(booking.status === 'NEW' || booking.status === 'CONFIRMED') && <Button size="sm" variant="soft" onClick={() => void setStatus(booking, 'ARRIVED')}>{t('bk.arrive')}</Button>}
                    {(booking.status === 'NEW' || booking.status === 'CONFIRMED') && <Button size="sm" variant="ghost" onClick={() => void setStatus(booking, 'NO_SHOW')}>{t('bk.noShow')}</Button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title={t('nav.submissions')} icon={<ClipboardList size={15} />} action={<Link href="/admin/submissions" className="text-xs font-medium text-brand-700">{t('common.open')}</Link>} />
            <div className="divide-y divide-line/60">
              {!data?.submissions.length && <div className="p-4"><EmptyState title={t('common.empty')} /></div>}
              {data?.submissions.slice(0, 6).map((submission) => <Link key={submission.id} href={`/admin/submissions?id=${submission.id}`} className="flex items-center gap-2 px-4 py-3 hover:bg-surface-muted"><Badge tone="blue" dot>{submission.type.replaceAll('_', ' ')}</Badge><span className="min-w-0 flex-1 truncate text-sm text-ink">{submission.name ?? submission.subject ?? '—'}</span></Link>)}
            </div>
          </Card>
          <Card>
            <CardHeader title={locale === 'ar' ? 'النشاط التشغيلي' : 'Operational activity'} icon={<Activity size={15} />} />
            <div className="divide-y divide-line/60">
              {!data?.events.length && <div className="p-4"><EmptyState title={t('common.empty')} /></div>}
              {data?.events.slice(-8).reverse().map((event) => <div key={event.id} className="px-4 py-3"><p className="text-xs font-semibold text-ink">{event.eventType.replaceAll('_', ' ')}</p><p className="mt-0.5 text-[11px] text-ink-faint">{event.actorName ?? (locale === 'ar' ? 'الموقع العام' : 'Public website')} · {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-GB', { timeStyle: 'short', timeZone: 'Asia/Amman' }).format(new Date(event.createdAt))}</p></div>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
