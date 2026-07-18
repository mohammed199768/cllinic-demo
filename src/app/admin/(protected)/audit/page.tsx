'use client';
import { useState } from 'react';
import { Search, ScrollText } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { useApi, type Paginated } from '@/admin/lib/useApi';
import { Card, Spinner, EmptyState, Input, Select, Pagination, Badge, PageHeader } from '@/admin/components/ui';
import { fmtDateTime } from '@/admin/lib/format';

interface Row { id: string; action: string; entityType: string; entityId: string | null; description: string; admin: string | null; createdAt: string; }
const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'ARCHIVE', 'RESTORE', 'LOGIN', 'LOGOUT', 'STATUS_CHANGE', 'CONVERT_BOOKING', 'COMPLETE_VISIT', 'RESET_DEMO'];
const ACTION_TONE: Record<string, 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'violet'> = {
  CREATE: 'green', UPDATE: 'blue', DELETE: 'red', ARCHIVE: 'gray', RESTORE: 'amber',
  LOGIN: 'gray', LOGOUT: 'gray', STATUS_CHANGE: 'amber', CONVERT_BOOKING: 'violet', COMPLETE_VISIT: 'green', RESET_DEMO: 'red',
};

export default function AuditPage() {
  const { t, locale } = useI18n();
  const [action, setAction] = useState(''); const [q, setQ] = useState(''); const [page, setPage] = useState(1);
  const query = new URLSearchParams({ page: String(page), pageSize: '30' });
  if (action) query.set('action', action); if (q) query.set('q', q);
  const { data, loading } = useApi<Paginated<Row>>(`/api/audit?${query.toString()}`);

  return (
    <div className="space-y-5">
      <PageHeader title={t('nav.audit')} />
      <Card className="p-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search size={15} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-faint" style={{ insetInlineStart: 12 }} />
            <Input placeholder={t('common.search')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="ps-9" />
          </div>
          <Select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}><option value="">{t('common.all')}</option>{ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</Select>
        </div>
      </Card>
      <Card>
        {loading ? <Spinner /> : !data || data.data.length === 0 ? (
          <div className="p-5"><EmptyState title={t('common.empty')} icon={<ScrollText size={22} strokeWidth={1.75} />} /></div>
        ) : (
          <>
            <div className="divide-y divide-line/60">
              {data.data.map((r) => (
                <div key={r.id} className="flex items-start gap-3.5 px-4 py-3 sm:px-5">
                  <Badge tone={ACTION_TONE[r.action] ?? 'blue'} dot>{r.action}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-ink">{r.description}</p>
                    <p className="tabular mt-0.5 text-[11px] text-ink-faint">{r.entityType} · {r.admin ?? '—'} · {fmtDateTime(r.createdAt, locale)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line/60 p-3"><Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} locale={locale} /></div>
          </>
        )}
      </Card>
    </div>
  );
}
