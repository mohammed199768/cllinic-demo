'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClipboardList, Search } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi } from '@/admin/lib/useApi';
import { api, ApiError } from '@/admin/lib/api';
import { Alert, Avatar, Badge, Button, Card, Dialog, EmptyState, Field, Input, PageHeader, Pagination, Segmented, Select, SkeletonRows, Textarea } from '@/admin/components/ui';
import { DateRangePicker, EMPTY_RANGE, type DateRangeValue } from '@/admin/components/date-picker';

interface Row {
  id: string; type: string; status: string; name: string | null; phone: string | null; email: string | null;
  subject: string | null; source: string; createdAt: string;
}
interface ListResponse { data: Row[]; newCount: number; page: number; total: number; totalPages: number; }
interface Detail extends Row { message: string | null; internalNote: string | null; payload: unknown; }

const STATUSES = ['NEW', 'IN_REVIEW', 'CONTACTED', 'RESOLVED', 'ARCHIVED'];

function SubmissionsInner() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'ALL' | 'CHILD_FORM' | 'GENERAL_MESSAGE'>('ALL');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [range, setRange] = useState<DateRangeValue>(EMPTY_RANGE);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(searchParams.get('id'));
  const [note, setNote] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const query = new URLSearchParams({ page: String(page), pageSize: '20' });
  if (tab !== 'ALL') query.set('type', tab);
  if (status) query.set('status', status);
  if (q) query.set('q', q);
  if (range.start) query.set('from', range.start);
  if (range.end) query.set('to', range.end);
  const { data, loading, reload } = useApi<ListResponse>(`/api/admin/submissions?${query}`);
  const { data: detail, reload: reloadDetail } = useApi<Detail>(selected ? `/api/admin/submissions/${selected}` : null);

  useEffect(() => {
    if (detail) { setNote(detail.internalNote ?? ''); setNextStatus(detail.status); }
  }, [detail]);

  const save = async () => {
    if (!selected) return;
    setSaving(true); setError('');
    try {
      await api.patch(`/api/admin/submissions/${selected}`, { status: nextStatus, internalNote: note });
      await Promise.all([reload(), reloadDetail()]);
    } catch (reason) { setError(reason instanceof ApiError ? reason.message : t('common.error')); }
    finally { setSaving(false); }
  };

  const payloadEntries = detail?.payload && typeof detail.payload === 'object' && !Array.isArray(detail.payload)
    ? Object.entries(detail.payload as Record<string, unknown>) : [];

  return (
    <div className="space-y-5">
      <PageHeader title={t('nav.submissions')} subtitle={data ? (locale === 'ar' ? `${data.total} طلب` : `${data.total} submissions`) : undefined} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented value={tab} onChange={(value) => { setTab(value); setPage(1); }} options={[
          { value: 'ALL', label: locale === 'ar' ? 'الكل' : 'All' },
          { value: 'CHILD_FORM', label: locale === 'ar' ? 'نماذج الأطفال' : 'Child Forms' },
          { value: 'GENERAL_MESSAGE', label: locale === 'ar' ? 'الرسائل العامة' : 'General Messages' },
        ]} />
        <Badge tone="blue" dot>{locale === 'ar' ? `${data?.newCount ?? 0} جديد` : `${data?.newCount ?? 0} new`}</Badge>
      </div>

      <Card className="p-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative"><Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-faint" /><Input aria-label={t('common.search')} value={q} onChange={(event) => { setQ(event.target.value); setPage(1); }} className="ps-9" placeholder={t('common.search')} /></div>
          <Select aria-label={t('common.status')} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">{t('common.all')} — {t('common.status')}</option>{STATUSES.map((value) => <option key={value}>{value.replaceAll('_', ' ')}</option>)}</Select>
          <DateRangePicker label={locale === 'ar' ? 'تاريخ الاستلام' : 'Received date'} value={range} onChange={(value) => { setRange(value); setPage(1); }} presets className="sm:col-span-2 lg:col-span-2" />
          <Button variant="secondary" onClick={() => void reload()}>{locale === 'ar' ? 'تحديث' : 'Refresh'}</Button>
        </div>
      </Card>

      <Card>
        {loading ? <SkeletonRows rows={8} cols={5} /> : !data?.data.length ? <div className="p-5"><EmptyState title={t('common.empty')} icon={<ClipboardList size={22} />} /></div> : <>
          <div className="divide-y divide-line/60">
            {data.data.map((row) => <button key={row.id} type="button" onClick={() => setSelected(row.id)} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-start transition hover:bg-surface-muted sm:px-5">
              <Avatar name={row.name ?? row.email ?? row.subject ?? row.type} size="sm" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink">{row.name ?? row.email ?? row.subject ?? '—'}</p><p className="truncate text-xs text-ink-faint">{row.subject ?? row.source} · {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Amman' }).format(new Date(row.createdAt))}</p></div>
              <Badge tone={row.status === 'NEW' ? 'blue' : row.status === 'RESOLVED' ? 'green' : 'gray'} dot>{row.status.replaceAll('_', ' ')}</Badge>
              <Badge tone="violet">{row.type.replaceAll('_', ' ')}</Badge>
            </button>)}
          </div>
          <div className="border-t border-line/60 p-3"><Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} locale={locale} /></div>
        </>}
      </Card>

      <Dialog open={!!selected} onClose={() => { setSelected(null); setError(''); }} title={locale === 'ar' ? 'تفاصيل الطلب' : 'Submission details'} wide>
        {!detail ? <SkeletonRows rows={5} cols={2} /> : <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2"><Badge tone="violet">{detail.type.replaceAll('_', ' ')}</Badge><Badge tone="blue" dot>{detail.status.replaceAll('_', ' ')}</Badge><time className="ms-auto text-xs text-ink-faint">{new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Amman' }).format(new Date(detail.createdAt))}</time></div>
          <dl className="grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2">
            {[['Name', detail.name], ['Phone', detail.phone], ['Email', detail.email], ['Subject', detail.subject], ['Source', detail.source]].map(([label, value]) => value ? <div key={label}><dt className="text-xs text-ink-faint">{label}</dt><dd className="mt-0.5 break-words text-sm font-medium text-ink">{value}</dd></div> : null)}
          </dl>
          {detail.message && <div><p className="text-xs font-medium text-ink-faint">{locale === 'ar' ? 'الرسالة' : 'Message'}</p><p className="mt-1 whitespace-pre-wrap rounded-xl border border-line bg-white p-3 text-sm leading-relaxed text-ink">{detail.message}</p></div>}
          <div><p className="mb-2 text-xs font-medium text-ink-faint">{locale === 'ar' ? 'البيانات المنظمة' : 'Structured payload'}</p><div className="overflow-hidden rounded-xl border border-line"><table className="w-full text-sm"><tbody>{payloadEntries.map(([key, value]) => <tr key={key} className="border-b border-line/60 last:border-0"><th className="w-1/3 bg-surface-muted px-3 py-2 text-start text-xs font-medium text-ink-soft">{key}</th><td className="break-words px-3 py-2 text-ink">{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</td></tr>)}</tbody></table></div></div>
          <div className="grid gap-3 sm:grid-cols-2"><Field label={t('common.status')}><Select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>{STATUSES.map((value) => <option key={value}>{value}</option>)}</Select></Field><Field label={locale === 'ar' ? 'ملاحظة داخلية' : 'Internal note'}><Textarea value={note} onChange={(event) => setNote(event.target.value)} /></Field></div>
          {error && <Alert tone="error">{error}</Alert>}
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setSelected(null)}>{t('common.close')}</Button><Button onClick={() => void save()} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button></div>
        </div>}
      </Dialog>
    </div>
  );
}

export default function SubmissionsPage() { return <Suspense><SubmissionsInner /></Suspense>; }
