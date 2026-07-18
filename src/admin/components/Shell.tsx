'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, CalendarClock, Users, Stethoscope, ScrollText, Settings, LogOut, Search, Menu, CalendarCheck, PanelRightClose, PanelRightOpen, X, ClipboardList, ChartNoAxesCombined } from 'lucide-react';
import { useI18n } from '../i18n/LocaleProvider';
import { cx, Kbd, Avatar, IconButton } from './ui';
import { useAuth } from '../auth/AuthProvider';

const NAV_MAIN = [
  { href: '/admin/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/admin/today', key: 'nav.today', icon: CalendarCheck },
  { href: '/admin/bookings', key: 'nav.bookings', icon: CalendarClock },
  { href: '/admin/submissions', key: 'nav.submissions', icon: ClipboardList },
  { href: '/admin/reports', key: 'nav.reports', icon: ChartNoAxesCombined },
  { href: '/admin/patients', key: 'nav.patients', icon: Users },
  { href: '/admin/visits', key: 'nav.visits', icon: Stethoscope },
  { href: '/admin/followups', key: 'nav.followups', icon: CalendarCheck },
];
const NAV_SYSTEM = [
  { href: '/admin/audit', key: 'nav.audit', icon: ScrollText },
  { href: '/admin/settings', key: 'nav.settings', icon: Settings },
];

function NavList({ items, pathname, collapsed, onNavigate, t }: {
  items: typeof NAV_MAIN; pathname: string; collapsed: boolean; onNavigate: () => void; t: (k: string) => string;
}) {
  return (
    <div className="space-y-1">
      {items.map((n) => {
        const active = pathname.startsWith(n.href);
        const Icon = n.icon;
        return (
          <Link key={n.href} href={n.href} onClick={onNavigate} title={collapsed ? t(n.key) : undefined}
            className={cx('group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-150',
              collapsed && 'justify-center px-0',
              active ? 'bg-brand-600/[.09] text-brand-800' : 'text-ink-soft hover:bg-ink/[.04] hover:text-ink')}>
            {active && <span className="absolute inset-y-2.5 start-0 w-1 rounded-full bg-brand-600" aria-hidden />}
            <Icon size={19} strokeWidth={active ? 2.2 : 1.9} className={cx('shrink-0 transition-colors', active ? 'text-brand-700' : 'text-ink-faint group-hover:text-ink-soft')} />
            {!collapsed && <span className="truncate">{t(n.key)}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const { user: me, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { try { setCollapsed(localStorage.getItem('our_clinic_sidebar') === '1'); } catch { /* ignore */ } }, []);
  const toggleCollapse = () => { setCollapsed((v) => { try { localStorage.setItem('our_clinic_sidebar', v ? '0' : '1'); } catch { /* ignore */ } return !v; }); };

  const sidebarInner = (
    <div className="flex h-full flex-col rounded-2xl border border-line/70 bg-white/85 shadow-card backdrop-blur-md">
      {/* Brand */}
      <div className={cx('flex items-center gap-2.5 px-4 pb-2 pt-4', collapsed && 'justify-center px-0')}>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 text-xl font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_2px_6px_rgba(18,38,60,.25)]" aria-hidden>+</div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-[-0.01em] text-ink">{t('appShort')}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">{locale === 'ar' ? 'إدارة العيادة' : 'Clinic Suite'}</p>
          </div>
        )}
        <IconButton label={collapsed ? 'Expand' : 'Collapse'} onClick={toggleCollapse}
          className={cx('hidden h-8 w-8 md:inline-flex', collapsed ? 'absolute -end-0 top-4 hidden' : 'ms-auto')}>
          <PanelRightClose size={15} className={locale === 'ar' ? '' : 'rotate-180'} />
        </IconButton>
        <button className="ms-auto rounded-lg p-2 text-ink-faint hover:bg-surface-muted md:hidden" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <NavList items={NAV_MAIN} pathname={pathname} collapsed={collapsed} onNavigate={() => setOpen(false)} t={t} />
        <p className={cx('mb-1 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-ink-faint/80', collapsed && 'text-center')}>{collapsed ? '·' : (locale === 'ar' ? 'النظام' : 'System')}</p>
        <NavList items={NAV_SYSTEM} pathname={pathname} collapsed={collapsed} onNavigate={() => setOpen(false)} t={t} />
      </nav>

      {collapsed && (
        <div className="flex justify-center pb-2">
          <IconButton label="Expand" onClick={toggleCollapse} className="h-8 w-8"><PanelRightOpen size={15} className={locale === 'ar' ? '' : 'rotate-180'} /></IconButton>
        </div>
      )}

      {/* User */}
      <div className={cx('m-3 mt-0 flex items-center gap-2.5 rounded-xl border border-line/60 bg-surface-raised p-2.5', collapsed && 'justify-center border-0 bg-transparent p-1')}>
        <Avatar name={me?.name ?? '—'} size="sm" />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">{me?.name ?? '—'}</p>
            <p className="truncate text-[11px] text-ink-faint" dir="ltr">{me?.email ?? ''}</p>
          </div>
        )}
        {!collapsed && <IconButton label={t('common.logout')} onClick={() => void logout()} className="h-9 w-9 text-ink-faint hover:text-red-600"><LogOut size={16} /></IconButton>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className={cx('no-print sticky top-0 hidden h-screen shrink-0 p-3 pe-0 transition-[width] duration-200 md:block', collapsed ? 'w-[86px]' : 'w-[264px]')}>
          {sidebarInner}
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="no-print fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] md:hidden" onClick={() => setOpen(false)} />
              <motion.aside
                initial={{ x: locale === 'ar' ? 280 : -280 }} animate={{ x: 0 }} exit={{ x: locale === 'ar' ? 280 : -280 }}
                transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                className={cx('no-print fixed inset-y-0 z-50 w-[280px] p-3 md:hidden', locale === 'ar' ? 'right-0' : 'left-0')}>
                {sidebarInner}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="no-print glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line/60 px-4 md:px-6">
            <button className="rounded-xl p-2.5 text-ink-soft hover:bg-surface-muted md:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu size={19} /></button>
            <button type="button" onClick={() => window.dispatchEvent(new Event('our-clinic:command'))}
              className="group flex h-11 min-w-0 flex-1 max-w-lg items-center gap-2.5 rounded-2xl border border-line/80 bg-white/80 px-4 text-sm text-ink-faint shadow-[0_1px_2px_rgba(15,31,48,.04)] transition hover:border-brand-300 hover:shadow-card">
              <Search size={16} className="text-ink-faint transition group-hover:text-brand-600" />
              <span className="flex-1 truncate text-start">{t('cmd.placeholder')}</span>
              <span className="hidden items-center gap-0.5 sm:flex"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
            </button>
            <div className="ms-auto flex items-center gap-1.5">
              <div className="inline-flex items-center rounded-xl bg-ink/[.05] p-1" role="group" aria-label="Language">
                {(['ar', 'en'] as const).map((l) => (
                  <button key={l} onClick={() => setLocale(l)}
                    className={cx('h-8 rounded-lg px-3 text-[13px] font-medium transition-all',
                      locale === l ? 'bg-white text-ink shadow-[0_1px_3px_rgba(15,31,48,.1)]' : 'text-ink-faint hover:text-ink-soft')}>
                    {l === 'ar' ? 'عربي' : 'EN'}
                  </button>
                ))}
              </div>
              <IconButton label={t('common.logout')} onClick={() => void logout()} className="hidden sm:inline-flex"><LogOut size={17} /></IconButton>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1280px] flex-1 p-4 md:p-6 lg:p-8">
            <div className="animate-rise">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
