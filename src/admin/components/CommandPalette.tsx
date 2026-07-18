'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, CalendarClock, Stethoscope, ArrowLeft, CornerDownLeft } from 'lucide-react';
import { useI18n } from '../i18n/LocaleProvider';
import { api } from '../lib/api';
import { cx, Kbd } from './ui';

interface Item { id: string; group: string; label: string; sub?: string; href: string; icon: 'patient' | 'booking' | 'visit' | 'action'; }
interface PatientSearchItem { id: string; fullName: string; medicalRecordNumber: string; phone: string; }
interface BookingSearchItem { id: string; fullName: string; publicReference: string; requestedService: string; }
interface VisitSearchItem { id: string; patientName?: string | null; visitNumber: string; }
const ICONS = { patient: User, booking: CalendarClock, visit: Stethoscope, action: ArrowLeft };

export function CommandPalette() {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const actions: Item[] = useMemo(() => [
    { id: 'a-dash', group: t('cmd.actions'), label: t('nav.dashboard'), href: '/admin/dashboard', icon: 'action' },
    { id: 'a-newp', group: t('cmd.actions'), label: t('pt.new'), href: '/admin/patients/new', icon: 'action' },
    { id: 'a-pat', group: t('cmd.actions'), label: t('nav.patients'), href: '/admin/patients', icon: 'action' },
    { id: 'a-bk', group: t('cmd.actions'), label: t('nav.bookings'), href: '/admin/bookings', icon: 'action' },
    { id: 'a-vs', group: t('cmd.actions'), label: t('nav.visits'), href: '/admin/visits', icon: 'action' },
    { id: 'a-fu', group: t('cmd.actions'), label: t('nav.followups'), href: '/admin/followups', icon: 'action' },
  ], [t]);

  const close = useCallback(() => { setOpen(false); setQ(''); setItems([]); setActive(0); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmd = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const slash = e.key === '/' && !/input|textarea|select/i.test((e.target as HTMLElement)?.tagName ?? '');
      if (cmd || slash) { e.preventDefault(); setOpen(true); }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('our-clinic:command', onOpen as EventListener);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('our-clinic:command', onOpen as EventListener); };
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 20); }, [open]);

  useEffect(() => {
    const filteredActions = q ? actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase())) : actions;
    if (q.trim().length < 2) { setItems(filteredActions); setActive(0); return; }
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const enc = encodeURIComponent(q.trim());
        const [pats, bks, vis] = await Promise.all([
          api.get<{ data: PatientSearchItem[] }>(`/api/patients?q=${enc}&pageSize=5`).catch(() => ({ data: [] })),
          api.get<{ data: BookingSearchItem[] }>(`/api/bookings?q=${enc}&pageSize=5`).catch(() => ({ data: [] })),
          api.get<{ data: VisitSearchItem[] }>(`/api/visits?q=${enc}&pageSize=5`).catch(() => ({ data: [] })),
        ]);
        const results: Item[] = [
          ...pats.data.map((p) => ({ id: 'p' + p.id, group: t('cmd.patients'), label: p.fullName, sub: `${p.medicalRecordNumber} · ${p.phone}`, href: `/admin/patients/${p.id}`, icon: 'patient' as const })),
          ...bks.data.map((b) => ({ id: 'b' + b.id, group: t('cmd.bookings'), label: b.fullName, sub: `${b.publicReference} · ${b.requestedService}`, href: `/admin/bookings/${b.id}`, icon: 'booking' as const })),
          ...vis.data.map((v) => ({ id: 'v' + v.id, group: t('cmd.visits'), label: v.patientName ?? v.visitNumber, sub: v.visitNumber, href: `/admin/visits/${v.id}`, icon: 'visit' as const })),
        ];
        setItems([...filteredActions, ...results]);
        setActive(0);
      } finally { setLoading(false); }
    }, 200);
  }, [q, actions, t]);

  const go = (it: Item) => { close(); router.push(it.href); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (items[active]) go(items[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  };

  if (!open) return null;
  let lastGroup = '';
  return (
    <div className="no-print fixed inset-0 z-[70] flex items-start justify-center bg-ink/35 p-4 pt-[12vh] backdrop-blur-[3px]" onClick={close} role="dialog" aria-modal="true" aria-label={t('cmd.placeholder')}>
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-pop backdrop-blur-xl animate-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 border-b border-line/70 px-5">
          <Search size={18} className="text-ink-faint" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown}
            placeholder={t('cmd.placeholder')} className="h-14 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint" />
          {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />}
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink-faint">{q.trim().length < 2 ? t('cmd.hint') : t('cmd.noResults')}</p>}
          {items.map((it, i) => {
            const showGroup = it.group !== lastGroup; lastGroup = it.group;
            const Icon = ICONS[it.icon];
            return (
              <div key={it.id}>
                {showGroup && <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{it.group}</p>}
                <button onMouseEnter={() => setActive(i)} onClick={() => go(it)}
                  className={cx('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors', i === active ? 'bg-brand-600/[.09] text-brand-800' : 'text-ink hover:bg-surface-muted')}>
                  <Icon size={16} className="shrink-0 text-ink-faint" />
                  <span className="flex-1 truncate text-sm">{it.label}{it.sub && <span className="ms-2 text-xs text-ink-faint">{it.sub}</span>}</span>
                  {i === active && <CornerDownLeft size={14} className="text-ink-faint" />}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 border-t border-line/70 bg-surface-raised/70 px-5 py-2.5 text-[11px] text-ink-faint">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> {t('cmd.nav')}</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> {t('cmd.open')}</span>
          <span className="flex items-center gap-1 ms-auto"><Kbd>Esc</Kbd></span>
        </div>
      </div>
    </div>
  );
}
