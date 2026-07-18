'use client';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cx } from './ui';

type Tone = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; tone: Tone }
interface Ctx { toast: (message: string, tone?: Tone) => void }

const ToastContext = createContext<Ctx | null>(null);
let seq = 0;

const ICON = { success: CheckCircle2, error: AlertTriangle, info: Info };
const ICON_TONE = { success: 'text-emerald-500', error: 'text-red-500', info: 'text-brand-500' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((message: string, tone: Tone = 'success') => {
    const id = ++seq;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => remove(id), 3400);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="no-print pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4" role="region" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICON[t.tone];
            return (
              <motion.div key={t.id} layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line/60 bg-white/95 px-4 py-3 shadow-lift backdrop-blur">
                <Icon size={19} className={cx('shrink-0', ICON_TONE[t.tone])} />
                <span className="flex-1 text-sm font-medium text-ink">{t.message}</span>
                <button onClick={() => remove(t.id)} className="shrink-0 rounded-lg p-1 text-ink-faint transition hover:bg-surface-muted" aria-label="Dismiss"><X size={14} /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): Ctx {
  const ctx = useContext(ToastContext);
  return ctx ?? { toast: () => undefined };
}
