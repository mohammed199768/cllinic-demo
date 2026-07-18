import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearDemoSession, DEMO_EMAIL, DEMO_PASSWORD } from '@ourclinic/local-data/admin-adapter';

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  clearDemoSession();
});

afterEach(() => vi.restoreAllMocks());

describe('Admin local API handling', () => {
  it('signals protected unauthorized requests once without a network request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { api, AUTH_UNAUTHORIZED_EVENT } = await import('./api');
    const unauthorized = vi.fn();
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, unauthorized);

    await Promise.allSettled([
      api.get('/api/dashboard/summary'),
      api.get('/api/bookings'),
      api.get('/api/patients'),
    ]);

    expect(unauthorized).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
    window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, unauthorized);
    vi.unstubAllGlobals();
  });

  it('logs in locally and returns the demo user without fetch or cookies', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { api } = await import('./api');

    const result = await api.post<{ user: { email: string } }>('/api/auth/login', { email: DEMO_EMAIL, password: DEMO_PASSWORD });
    expect(result.user.email).toBe(DEMO_EMAIL);
    expect(localStorage.getItem('our_clinic_session')).toBe('active');
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
