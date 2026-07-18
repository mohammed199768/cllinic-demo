'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/admin/i18n/LocaleProvider';
import { api, ApiError } from '@/admin/lib/api';
import { Button, Field, Input, Alert } from '@/admin/components/ui';
import { DEMO_EMAIL, DEMO_PASSWORD, hasDemoSession } from '@ourclinic/local-data/admin-adapter';

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/admin/') || raw === '/admin/login') return '/admin/today';
  return raw.startsWith('//') ? '/admin/today' : raw;
}

function LoginForm() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasDemoSession()) router.replace(safeNext(params.get('next')));
  }, [params, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/api/auth/login', { email: email.trim(), password });
      router.replace(safeNext(params.get('next')));
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) setError(locale === 'ar' ? 'محاولات كثيرة، حاول لاحقًا.' : 'Too many attempts, try again later.');
      else setError(t('login.failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden p-4">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-surface-canvas">
        <div className="absolute -top-40 start-[10%] h-[480px] w-[480px] rounded-full bg-brand-400/15 blur-3xl" />
        <div className="absolute -bottom-52 end-[5%] h-[520px] w-[520px] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-rise">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-700 text-2xl font-semibold text-white shadow-lift" aria-hidden>+</div>
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{t('appShort')}</p>
              <p className="text-[11px] text-ink-faint">{locale === 'ar' ? 'إدارة العيادة' : 'Clinic Suite'}</p>
            </div>
          </div>
          <button onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')} className="rounded-xl bg-white/70 px-3 py-2 text-[13px] font-medium text-ink-soft shadow-card transition hover:text-ink">{t('common.language')}</button>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-7 shadow-pop backdrop-blur-xl">
          <h1 className="text-xl font-bold tracking-[-0.02em] text-ink">{t('login.title')}</h1>
          <p className="mb-6 mt-1 text-[13px] text-ink-faint">{t('appName')}</p>
          <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50/80 px-4 py-3 text-xs text-ink-soft">
            <p className="font-semibold text-brand-800">{locale === 'ar' ? 'دخول تجريبي فقط' : 'Demo-only authentication'}</p>
            <p className="mt-1" dir="ltr">{DEMO_EMAIL} · {DEMO_PASSWORD}</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {error && <Alert tone="error">{error}</Alert>}
            <Field label={t('login.email')} htmlFor="email" required>
              <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
            </Field>
            <Field label={t('login.password')} htmlFor="password" required>
              <div className="relative">
                <Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" className="pe-11" />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute inset-y-0 my-auto grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:text-ink-soft" style={{ insetInlineEnd: 6 }} aria-label={show ? t('login.hide') : t('login.show')}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? t('common.loading') : t('login.submit')}</Button>
          </form>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-faint">
          <ShieldCheck size={13} aria-hidden /> {locale === 'ar' ? 'بوابة عرض تجريبية محلية' : 'Local demo admin portal'}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
