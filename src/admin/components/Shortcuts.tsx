'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '../i18n/LocaleProvider';
import { Dialog, Kbd } from './ui';

// Lightweight two-key ("g then x") navigation + help shortcuts.
export function Shortcuts() {
  const { t } = useI18n();
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const pending = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const inField = (el: EventTarget | null) => /input|textarea|select/i.test((el as HTMLElement)?.tagName ?? '') || (el as HTMLElement)?.isContentEditable;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (inField(e.target)) return;
      if (e.key === '?') { e.preventDefault(); setHelpOpen(true); return; }
      const go = (path: string) => { e.preventDefault(); router.push(path); };
      if (pending.current === 'g') {
        pending.current = null;
        if (timer.current) clearTimeout(timer.current);
        switch (e.key.toLowerCase()) {
          case 'd': return go('/admin/dashboard');
          case 'p': return go('/admin/patients');
          case 'b': return go('/admin/bookings');
          case 'v': return go('/admin/visits');
          case 'f': return go('/admin/followups');
        }
        return;
      }
      if (e.key.toLowerCase() === 'g') { pending.current = 'g'; timer.current = setTimeout(() => (pending.current = null), 900); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  const rows: [string[], string][] = [
    [['⌘', 'K'], t('sc.search')],
    [['g', 'd'], t('sc.goDashboard')],
    [['g', 'p'], t('sc.goPatients')],
    [['g', 'b'], t('sc.goBookings')],
    [['g', 'v'], t('sc.goVisits')],
    [['g', 'f'], t('nav.followups')],
    [['?'], t('sc.help')],
    [['Esc'], t('sc.close')],
  ];

  return (
    <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title={t('sc.title')}>
      <div className="divide-y divide-line">
        {rows.map(([keys, label], i) => (
          <div key={i} className="flex items-center justify-between py-2 text-sm">
            <span className="text-ink-soft">{label}</span>
            <span className="flex items-center gap-1">{keys.map((k, j) => <Kbd key={j}>{k}</Kbd>)}</span>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
