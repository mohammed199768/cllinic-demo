'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { UserPlus, Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi, type Paginated } from '@/admin/lib/useApi';
import { Card, SkeletonRows, EmptyState, Button, Input, Pagination, Badge, Avatar, PageHeader, Segmented } from '@/admin/components/ui';
import { GENDER } from '@/admin/i18n/dict';
import { fmtDate } from '@/admin/lib/format';

interface Row { id: string; medicalRecordNumber: string; fullName: string; phone: string; dateOfBirth: string | null; age: number | null; gender: string; lastVisitAt: string | null; openVisits: number; archivedAt: string | null; }

function PatientsInner() {
  const { t, locale } = useI18n();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [status, setStatus] = useState<'active' | 'archived' | 'all'>('active');
  const [page, setPage] = useState(1);
  const query = new URLSearchParams({ page: String(page), pageSize: '20', status });
  if (q) query.set('q', q);
  const { data, loading } = useApi<Paginated<Row>>(`/api/patients?${query.toString()}`);
  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-5">
      <PageHeader title={t('nav.patients')}
        subtitle={data ? (locale === 'ar' ? `${data.total} مريض` : `${data.total} patients`) : undefined}
        actions={<Link href="/admin/patients/new"><Button><UserPlus size={16} />{t('pt.new')}</Button></Link>} />

      <Card className="p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-faint" style={{ insetInlineStart: 12 }} />
            <Input placeholder={t('pt.searchPh')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="ps-9" />
          </div>
          <Segmented value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[
            { value: 'active', label: locale === 'ar' ? 'نشط' : 'Active' },
            { value: 'archived', label: t('pt.archived') },
            { value: 'all', label: t('common.all') },
          ]} />
        </div>
      </Card>

      <Card>
        {loading ? <SkeletonRows rows={8} cols={6} /> : !data || data.data.length === 0 ? (
          <div className="p-5">
            <EmptyState title={t('common.empty')} icon={<Users size={22} strokeWidth={1.75} />}
              hint={locale === 'ar' ? 'جرّب تعديل البحث، أو أنشئ ملف مريض جديد.' : 'Try a different search, or create a new patient record.'}
              action={<Link href="/admin/patients/new"><Button size="sm" variant="secondary"><UserPlus size={14} />{t('pt.new')}</Button></Link>} />
          </div>
        ) : (
          <>
            <div className="divide-y divide-line/60">
              {data.data.map((p) => (
                <Link key={p.id} href={`/admin/patients/${p.id}`} className="group flex items-center gap-4 px-4 py-3.5 transition hover:bg-surface-muted/70 sm:px-5">
                  <Avatar name={p.fullName} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="truncate text-sm font-semibold text-ink group-hover:text-brand-700">{p.fullName}</span>
                      {p.archivedAt && <Badge tone="gray">{t('pt.archived')}</Badge>}
                      {p.openVisits > 0 && <Badge tone="blue" dot>{p.openVisits} {locale === 'ar' ? 'زيارة مفتوحة' : 'open'}</Badge>}
                    </div>
                    <p className="tabular mt-0.5 truncate text-xs text-ink-faint">
                      {p.medicalRecordNumber} · <span dir="ltr">{p.phone}</span>
                      {p.age != null && <> · {p.age} {locale === 'ar' ? 'سنة' : 'yrs'}</>}
                      {GENDER[p.gender]?.[locale] && <> · {GENDER[p.gender]![locale]}</>}
                    </p>
                  </div>
                  <div className="hidden text-end sm:block">
                    <p className="text-[11px] text-ink-faint">{t('pt.lastVisit')}</p>
                    <p className="tabular text-xs font-medium text-ink-soft">{p.lastVisitAt ? fmtDate(p.lastVisitAt, locale) : '—'}</p>
                  </div>
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

export default function PatientsPage() { return <Suspense><PatientsInner /></Suspense>; }
