'use client';
import { cloneElement, isValidElement, useEffect, useId, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Inbox, AlertTriangle } from 'lucide-react';
import { BOOKING_STATUS, VISIT_STATUS } from '../i18n/dict';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ============================= Buttons ============================= */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'; size?: 'sm' | 'md' | 'lg' };
export function Button({ variant = 'primary', size = 'md', className, ...p }: BtnProps) {
  const base = 'inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 active:scale-[.97] disabled:opacity-50 disabled:pointer-events-none';
  const sizes = { sm: 'h-9 px-3.5 text-[13px]', md: 'h-11 px-4 text-sm', lg: 'h-12 px-5 text-[15px]' };
  const variants = {
    primary: 'bg-brand-600 text-white shadow-[0_1px_2px_rgba(15,31,48,.2),inset_0_1px_0_rgba(255,255,255,.12)] hover:bg-brand-700',
    secondary: 'bg-white text-ink border border-line-strong/70 shadow-[0_1px_2px_rgba(15,31,48,.05)] hover:bg-surface-muted hover:border-line-strong',
    soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    ghost: 'text-brand-700 hover:bg-brand-50',
    danger: 'bg-red-600 text-white shadow-[0_1px_2px_rgba(127,29,29,.25)] hover:bg-red-700',
  };
  return <button className={cx(base, sizes[size], variants[variant], className)} {...p} />;
}

export function IconButton({ label, className, children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button aria-label={label} title={label}
      className={cx('inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft transition hover:bg-surface-muted hover:text-ink active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400', className)} {...p}>
      {children}
    </button>
  );
}

/* ============================= Fields ============================= */
export function Field({ label, error, required, hint, children, htmlFor }: { label?: string; error?: string; required?: boolean; hint?: string; children: ReactNode; htmlFor?: string }) {
  const generatedId = useId();
  const element = isValidElement(children) ? children as ReactElement<{ id?: string }> : null;
  const controlId = htmlFor ?? element?.props.id ?? (label ? generatedId : undefined);
  const control = element && controlId && !htmlFor && !element.props.id ? cloneElement(element, { id: controlId }) : children;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={controlId} className="block text-[13px] font-medium text-ink-soft">
          {label} {required && <span className="text-red-500" aria-hidden>•</span>}
        </label>
      )}
      {control}
      {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
const inputCls = 'w-full h-11 rounded-xl border border-line bg-white px-3.5 text-sm text-ink shadow-inner-soft placeholder:text-ink-faint transition-colors focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-400/15 disabled:bg-surface-muted disabled:text-ink-faint';
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(inputCls, p.className)} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cx('w-full min-h-[96px] rounded-xl border border-line bg-white p-3.5 text-sm leading-relaxed text-ink shadow-inner-soft placeholder:text-ink-faint transition-colors focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-400/15 disabled:bg-surface-muted disabled:text-ink-faint', p.className)} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cx(inputCls, 'cursor-pointer pe-8', p.className)} />;

/* ============================= Surfaces ============================= */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('rounded-2xl border border-line/70 bg-white shadow-card', className)}>{children}</div>;
}
export function CardHeader({ title, action, icon }: { title: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4">
      <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-ink">
        {icon && <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>}
        {title}
      </h3>
      {action}
    </div>
  );
}

/* ============================= Page header ============================= */
export function PageHeader({ title, subtitle, actions, eyebrow }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-xs font-medium text-ink-faint">{eyebrow}</div>}
        <h1 className="truncate text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle && <div className="mt-1 text-sm text-ink-faint">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ============================= Avatar ============================= */
const AVATAR_HUES = ['bg-brand-100 text-brand-800', 'bg-emerald-100 text-emerald-800', 'bg-violet-100 text-violet-800', 'bg-amber-100 text-amber-900', 'bg-sky-100 text-sky-800', 'bg-rose-100 text-rose-800'];
export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const sizes = { sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-[13px]', lg: 'h-14 w-14 text-lg' };
  return <span className={cx('grid shrink-0 place-items-center rounded-full font-semibold', sizes[size], AVATAR_HUES[h % AVATAR_HUES.length], className)} aria-hidden>{initials}</span>;
}

/* ============================= Badges & status ============================= */
type Tone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'violet';
export function Badge({ children, tone = 'neutral', dot }: { children: ReactNode; tone?: Tone; dot?: boolean }) {
  const tones: Record<Tone, string> = {
    neutral: 'bg-surface-muted text-ink-soft ring-line/80', blue: 'bg-brand-50 text-brand-700 ring-brand-200/70',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70', amber: 'bg-amber-50 text-amber-800 ring-amber-200/70',
    red: 'bg-red-50 text-red-700 ring-red-200/70', gray: 'bg-gray-100 text-gray-600 ring-gray-200/80',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200/70',
  };
  const dots: Record<Tone, string> = { neutral: 'bg-ink-faint', blue: 'bg-brand-500', green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500', gray: 'bg-gray-400', violet: 'bg-violet-500' };
  return (
    <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset', tones[tone])}>
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', dots[tone])} aria-hidden />}
      {children}
    </span>
  );
}
export const BOOKING_TONE: Record<string, Tone> = { NEW: 'blue', CONFIRMED: 'amber', ARRIVED: 'green', CONVERTED_TO_VISIT: 'violet', CANCELLED: 'red', NO_SHOW: 'gray' };
const VISIT_TONE: Record<string, Tone> = { OPEN: 'blue', COMPLETED: 'green', CANCELLED: 'gray' };
export function StatusBadge({ kind, value, locale }: { kind: 'booking' | 'visit'; value: string; locale: 'ar' | 'en' }) {
  if (kind === 'booking') return <Badge dot tone={BOOKING_TONE[value] ?? 'neutral'}>{BOOKING_STATUS[value]?.[locale] ?? value}</Badge>;
  return <Badge dot tone={VISIT_TONE[value] ?? 'neutral'}>{VISIT_STATUS[value]?.[locale] ?? value}</Badge>;
}

/* ============================= Segmented control ============================= */
export function Segmented<T extends string>({ options, value, onChange, className }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cx('inline-flex items-center gap-0.5 rounded-xl bg-ink/[.05] p-1', className)} role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={cx('inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-medium transition-all',
            value === o.value ? 'bg-white text-ink shadow-[0_1px_3px_rgba(15,31,48,.1)]' : 'text-ink-faint hover:text-ink-soft')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ============================= Feedback ============================= */
export function Spinner({ label }: { label?: string }) {
  return <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-faint"><span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />{label}</div>;
}
export function EmptyState({ title, hint, icon, action }: { title: string; hint?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong/70 bg-surface-raised/60 px-6 py-12 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-surface-muted text-ink-faint">{icon ?? <Inbox size={22} strokeWidth={1.75} />}</div>
      <p className="text-sm font-semibold text-ink-soft">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-faint">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
export function Alert({ tone = 'info', children }: { tone?: 'info' | 'error' | 'warn' | 'success'; children: ReactNode }) {
  const tones = { info: 'bg-brand-50 text-brand-800 border-brand-200/80', error: 'bg-red-50 text-red-800 border-red-200/80', warn: 'bg-amber-50 text-amber-900 border-amber-200/80', success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80' };
  return <div className={cx('rounded-xl border px-4 py-3 text-sm leading-relaxed', tones[tone])} role={tone === 'error' ? 'alert' : undefined}>{children}</div>;
}

/* ============================= Pagination ============================= */
export function Pagination({ page, totalPages, onChange, locale }: { page: number; totalPages: number; onChange: (p: number) => void; locale: 'ar' | 'en' }) {
  if (totalPages <= 1) return null;
  const Prev = locale === 'ar' ? ChevronRight : ChevronLeft;
  const Next = locale === 'ar' ? ChevronLeft : ChevronRight;
  return (
    <div className="flex items-center justify-between gap-2 pt-1 text-sm">
      <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}><Prev size={15} />{locale === 'ar' ? 'السابق' : 'Prev'}</Button>
      <span className="tabular text-xs text-ink-faint">{locale === 'ar' ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}</span>
      <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>{locale === 'ar' ? 'التالي' : 'Next'}<Next size={15} /></Button>
    </div>
  );
}

/* ============================= Dialog ============================= */
export function Dialog({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/35 p-4 pt-[10vh] backdrop-blur-[3px]"
          role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', stiffness: 480, damping: 34 }}
            className={cx('w-full rounded-3xl border border-white/60 bg-white shadow-pop', wide ? 'max-w-3xl' : 'max-w-lg')} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pb-2 pt-5">
              <h3 className="text-lg font-semibold tracking-[-0.01em] text-ink">{title}</h3>
              <IconButton label="Close" onClick={onClose} className="h-9 w-9 -me-2"><X size={17} /></IconButton>
            </div>
            <div className="px-6 pb-6 pt-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================= Tabs (segmented) ============================= */
export function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="scrollbar-none -mx-1 overflow-x-auto px-1" role="tablist">
      <div className="inline-flex min-w-full items-center gap-0.5 rounded-2xl bg-ink/[.05] p-1 sm:min-w-0">
        {tabs.map((tb) => (
          <button key={tb.key} role="tab" aria-selected={active === tb.key} onClick={() => onChange(tb.key)}
            className={cx('h-10 whitespace-nowrap rounded-xl px-4 text-sm font-medium transition-all',
              active === tb.key ? 'bg-white text-ink shadow-[0_1px_3px_rgba(15,31,48,.1)]' : 'text-ink-faint hover:text-ink-soft')}>
            {tb.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================= Confirm ============================= */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel, danger }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel: string; danger?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="flex items-start gap-3">
        <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', danger ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600')}><AlertTriangle size={19} /></span>
        <p className="pt-2 text-sm leading-relaxed text-ink-soft">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>{'إلغاء / Cancel'}</Button>
        <Button variant={danger ? 'danger' : 'primary'} disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}>{confirmLabel}</Button>
      </div>
    </Dialog>
  );
}

/* ============================= Skeletons ============================= */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-lg bg-ink/[.06]', className)} />;
}
export function SkeletonRows({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-line/70" aria-hidden>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          {Array.from({ length: cols - 1 }).map((__, c) => (
            <Skeleton key={c} className={cx('h-4', c === 0 ? 'w-32' : c === cols - 2 ? 'ms-auto w-16' : 'w-24')} />
          ))}
        </div>
      ))}
    </div>
  );
}
export function SkeletonCards({ n = 6 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: n }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
    </div>
  );
}

/* ============================= Breadcrumb ============================= */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-ink-faint">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-line-strong">/</span>}
          {it.href ? <a href={it.href} className="transition hover:text-brand-700">{it.label}</a> : <span className="font-medium text-ink-soft">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

/* ============================= Kbd ============================= */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex min-w-[1.4rem] items-center justify-center rounded-md border border-line bg-white px-1.5 py-0.5 text-[11px] font-medium text-ink-faint shadow-[0_1px_0_rgba(15,31,48,.08)]">{children}</kbd>;
}
