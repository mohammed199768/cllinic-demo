'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton, cx } from '../ui';
import type { Locale } from '../../i18n/dict';
import { dateLabel } from './date-labels';

interface PickerDialogProps {
  open: boolean;
  title: string;
  locale: Locale;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: ReactNode;
}

interface Placement {
  mobile: boolean;
  style: CSSProperties;
}

export function PickerDialog({ open, title, locale, triggerRef, onClose, children }: PickerDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [placement, setPlacement] = useState<Placement>({ mobile: true, style: {} });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const mobile = window.innerWidth < 640;
      if (mobile) {
        setPlacement({ mobile: true, style: {} });
        return;
      }
      const rect = triggerRef.current?.getBoundingClientRect();
      const width = Math.min(384, window.innerWidth - 32);
      const estimatedHeight = 560;
      const top = rect
        ? (rect.bottom + estimatedHeight + 12 <= window.innerHeight ? rect.bottom + 8 : Math.max(16, rect.top - estimatedHeight - 8))
        : 80;
      const preferredLeft = rect ? (locale === 'ar' ? rect.right - width : rect.left) : (window.innerWidth - width) / 2;
      const left = Math.min(Math.max(16, preferredLeft), window.innerWidth - width - 16);
      const maxHeight = Math.max(0, window.innerHeight - top - 16);
      setPlacement({ mobile: false, style: { top, left, width, maxHeight } });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const previousOverflow = document.body.style.overflow;
    if (window.innerWidth < 640) document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [locale, open, triggerRef]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      const preferred = panelRef.current?.querySelector<HTMLElement>('[data-calendar-focus="true"]');
      (preferred ?? panelRef.current)?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  if (!mounted || !open) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
    if (!focusable.length) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return createPortal(
    <div
      className={cx('fixed inset-0 z-[100]', placement.mobile ? 'flex items-end bg-ink/40 p-2 backdrop-blur-[2px]' : 'bg-transparent')}
      onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        style={placement.style}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        className={cx(
          'overflow-hidden border border-line/80 bg-white shadow-pop focus:outline-none',
          placement.mobile
            ? 'max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-3xl'
            : 'fixed max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl',
        )}
      >
        <div className="flex min-h-14 items-center justify-between border-b border-line/60 px-4 py-2">
          <h2 id={titleId} className="text-[15px] font-semibold text-ink">{title}</h2>
          <IconButton label={dateLabel('common.close', locale)} onClick={onClose} className="h-10 w-10"><X size={17} /></IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
