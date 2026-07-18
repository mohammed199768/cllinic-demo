'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi, type Paginated } from '@/admin/lib/useApi';
import { Card, SkeletonRows, EmptyState, StatusBadge, Pagination, Badge, PageHeader, Segmented, Avatar } from '@/admin/components/ui';
import { fmtDate } from '@/admin/lib/format';
import { differenceInCalendarDays, todayInAmman } from '@/admin/components/date-picker';

interface Row { id: string; visitNumber: string; patientName: string | null; medicalRecordNumber: string | null; status: string; chiefComplaint: string | null; followUpAt: string | null; }

export default function FollowUpsPage() {
  const { t, locale } = useI18n();
  const [scope, setScope] = useState<'due' | 'scheduled'>('due');
  const [page, setPage] = useState(1);
  const { data, loading } = useApi<Paginated<Row>>(`/api/visits?followUp=${scope}&order=asc&page=${page}&pageSize=20`);
  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight;

  const dueChip = (at: string | null) => {
    if (!at) return null;
    const d = differenceInCalendarDays(at.slice(0, 10), todayInAmman());
    if (d < 0) return <Badge tone="red" dot>{locale === 'ar' ? `متأخر ${-d} ي` : `${-d}d overdue`}</Badge>;
    if (d === 0) return <Badge tone="amber" dot>{locale === 'ar' ? 'اليوم' : 'Today'}</Badge>;
    if (d === 1) return <Badge tone="blue" dot>{locale === 'ar' ? 'غدًا' : 'Tomorrow'}</Badge>;
    return <Badge tone="blue">{fmtDate(at, locale)}</Badge>;
  };

  return (
    <div className="space-y-5">
      <PageHeader title={t('nav.followups')}
        actions={
          <Segmented value={scope} onChange={(v) => { setScope(v); setPage(1); }} options={[
            { value: 'due', label: t('dash.followups') },
            { value: 'scheduled', label: locale === 'ar' ? 'كل المجدولة' : 'All scheduled' },
          ]} />
        } />

      <Card>
        {loading ? <SkeletonRows rows={6} cols={4} /> : !data || data.data.length === 0 ? (
          <div className="p-5"><EmptyState title={t('dash.noFollowups')} icon={<CalendarCheck size={22} strokeWidth={1.75} />} hint={locale === 'ar' ? 'حدد تاريخ متابعة من شاشة الزيارة.' : 'Set a follow-up date from the visit screen.'} /></div>
        ) : (
          <>
            <div className="divide-y divide-line/60">
              {data.data.map((v) => (
                <Link key={v.id} href={`/admin/visits/${v.id}`} className="group flex items-center gap-4 px-4 py-3.5 transition hover:bg-surface-muted/70 sm:px-5">
                  <Avatar name={v.patientName ?? v.visitNumber} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                      <span className="text-sm font-semibold text-ink group-hover:text-brand-700">{v.patientName ?? '—'}</span>
                      <span className="tabular text-xs font-medium text-brand-700">{v.visitNumber}</span>
                    </div>
                    <p className="tabular mt-0.5 truncate text-xs text-ink-faint">{v.medicalRecordNumber}{v.chiefComplaint ? ` · ${v.chiefComplaint}` : ''}</p>
                  </div>
                  {dueChip(v.followUpAt)}
                  <div className="hidden sm:block"><StatusBadge kind="visit" value={v.status} locale={locale} /></div>
                  <Chevron size={17} className="shrink-0 text-line-strong transition group-hover:text-brand-500" />
                </Link>
              ))}
            </div>
            <div className="border-t border-line/60 p-3"><Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} locale={locale} /></div>
          </>
        )}
      </Card>
    </div>
  );
}
