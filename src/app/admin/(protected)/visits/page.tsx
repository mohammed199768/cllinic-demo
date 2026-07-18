'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi, type Paginated } from '@/admin/lib/useApi';
import { Card, SkeletonRows, EmptyState, StatusBadge, Input, Select, Pagination, PageHeader } from '@/admin/components/ui';
import { VISIT_STATUS } from '@/admin/i18n/dict';
import { fmtDate } from '@/admin/lib/format';

interface Row { id: string; visitNumber: string; patientName: string | null; medicalRecordNumber: string | null; visitDate: string; status: string; chiefComplaint: string | null; bookingReference: string | null; }

function VisitsInner() {
  const { t, locale } = useI18n();
  const sp = useSearchParams();
  const [status, setStatus] = useState(sp.get('status') ?? '');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const query = new URLSearchParams({ page: String(page), pageSize: '20' });
  if (status) query.set('status', status); if (q) query.set('q', q);
  const { data, loading } = useApi<Paginated<Row>>(`/api/visits?${query.toString()}`);
  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-5">
      <PageHeader title={t('nav.visits')} subtitle={data ? (locale === 'ar' ? `${data.total} زيارة` : `${data.total} visits`) : undefined} />
      <Card className="p-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search size={15} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-faint" style={{ insetInlineStart: 12 }} />
            <Input placeholder={t('common.search')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="ps-9" />
          </div>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">{t('common.all')}</option>{Object.keys(VISIT_STATUS).map((s) => <option key={s} value={s}>{VISIT_STATUS[s]![locale]}</option>)}</Select>
        </div>
      </Card>
      <Card>
        {loading ? <SkeletonRows rows={8} cols={5} /> : !data || data.data.length === 0 ? (
          <div className="p-5"><EmptyState title={t('common.empty')} icon={<Stethoscope size={22} strokeWidth={1.75} />} hint={locale === 'ar' ? 'تُنشأ الزيارات من تحويل الحجوزات.' : 'Visits are created by converting bookings.'} /></div>
        ) : (
          <>
            <div className="divide-y divide-line/60">
              {data.data.map((v) => (
                <Link key={v.id} href={`/admin/visits/${v.id}`} className="group flex items-center gap-4 px-4 py-3.5 transition hover:bg-surface-muted/70 sm:px-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Stethoscope size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                      <span className="text-sm font-semibold text-ink group-hover:text-brand-700">{v.patientName ?? '—'}</span>
                      <span className="tabular text-xs font-medium text-brand-700">{v.visitNumber}</span>
                    </div>
                    <p className="tabular mt-0.5 truncate text-xs text-ink-faint">
                      {fmtDate(v.visitDate, locale)}{v.chiefComplaint ? ` · ${v.chiefComplaint}` : ''}{v.medicalRecordNumber ? ` · ${v.medicalRecordNumber}` : ''}
                    </p>
                  </div>
                  <StatusBadge kind="visit" value={v.status} locale={locale} />
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
export default function VisitsPage() { return <Suspense><VisitsInner /></Suspense>; }
