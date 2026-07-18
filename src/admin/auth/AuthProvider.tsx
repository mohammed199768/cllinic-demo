'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api, AUTH_UNAUTHORIZED_EVENT } from '../lib/api';
import { useI18n } from '../i18n/LocaleProvider';
import { clearDemoSession } from '@ourclinic/local-data/admin-adapter';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
  lastLoginAt: string | null;
}

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated'; user: null };

type AuthContextValue = AuthState & {
  logout: () => Promise<void>;
};
type AuthenticatedAuthContextValue = Extract<AuthContextValue, { status: 'authenticated' }>;

const AuthContext = createContext<AuthContextValue | null>(null);
function clearClientAuthState(): void {
  clearDemoSession();
}

function safeReturnPath(pathname: string): string {
  return pathname.startsWith('/admin/') && pathname !== '/admin/login' ? pathname : '/admin/today';
}

function AuthLoading() {
  const { locale } = useI18n();
  return (
    <div className="grid min-h-screen place-items-center bg-surface-canvas" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm text-ink-faint">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" aria-hidden />
        <span>{locale === 'ar' ? 'جارٍ التحقق من تسجيل الدخول…' : 'Checking authentication…'}</span>
      </div>
    </div>
  );
}

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });
  const redirectingRef = useRef(false);
  const logoutPromiseRef = useRef<Promise<void> | null>(null);
  const authCheckPromiseRef = useRef<Promise<{ user: AuthUser }> | null>(null);

  const becomeUnauthenticated = useCallback((preserveReturnPath: boolean) => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    clearClientAuthState();
    setState({ status: 'unauthenticated', user: null });
    const destination = preserveReturnPath
      ? `/admin/login?next=${encodeURIComponent(safeReturnPath(pathnameRef.current))}`
      : '/admin/login';
    router.replace(destination);
  }, [router]);

  useEffect(() => {
    let active = true;
    authCheckPromiseRef.current ??= api.get<{ user: AuthUser }>('/api/auth/me');
    void authCheckPromiseRef.current.then((response) => {
      if (!active) return;
      redirectingRef.current = false;
      setState({ status: 'authenticated', user: response.user });
    }).catch(() => {
      if (active) becomeUnauthenticated(true);
    });
    return () => { active = false; };
  }, [becomeUnauthenticated]);

  useEffect(() => {
    const onUnauthorized = () => becomeUnauthenticated(true);
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, [becomeUnauthenticated]);

  const logout = useCallback(() => {
    if (logoutPromiseRef.current) return logoutPromiseRef.current;
    const operation = (async () => {
      try {
        await api.post('/api/auth/logout');
      } catch {
        // An expired server session is already logged out from the client's perspective.
      } finally {
        becomeUnauthenticated(false);
      }
    })();
    logoutPromiseRef.current = operation;
    void operation.finally(() => { logoutPromiseRef.current = null; });
    return operation;
  }, [becomeUnauthenticated]);

  const value = useMemo<AuthContextValue>(() => ({ ...state, logout }), [logout, state]);

  if (state.status !== 'authenticated') return <AuthLoading />;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AuthProvider = DemoAuthProvider;

export function useAuth(): AuthenticatedAuthContextValue {
  const value = useContext(AuthContext);
  if (!value || value.status !== 'authenticated') throw new Error('useAuth must be used inside an authenticated AuthProvider');
  return value;
}
