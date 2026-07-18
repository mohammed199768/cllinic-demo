import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocaleProvider } from '../i18n/LocaleProvider';
import { AuthProvider, useAuth } from './AuthProvider';

const mocks = vi.hoisted(() => {
  const replace = vi.fn();
  return {
    get: vi.fn(),
    post: vi.fn(),
    replace,
    pathname: '/admin/dashboard',
    router: { replace },
  };
});

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => mocks.router,
}));

vi.mock('../lib/api', () => ({
  AUTH_UNAUTHORIZED_EVENT: 'our-clinic:auth-unauthorized',
  api: { get: mocks.get, post: mocks.post },
}));

const user = {
  id: 'admin-1',
  name: 'Test Admin',
  email: 'admin@example.test',
  role: 'ADMIN' as const,
  lastLoginAt: null,
};

function ProtectedProbe() {
  const auth = useAuth();
  return (
    <div data-testid="protected">
      <span>{auth.status}</span>
      <span>{auth.user.name}</span>
      <button onClick={() => void auth.logout()}>Log out now</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <LocaleProvider>
      <AuthProvider><ProtectedProbe /></AuthProvider>
    </LocaleProvider>,
  );
}

beforeEach(() => {
  mocks.get.mockReset();
  mocks.post.mockReset();
  mocks.replace.mockReset();
  mocks.pathname = '/admin/dashboard';
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => cleanup());

describe('AuthProvider', () => {
  it('shows only the full-page auth check while /auth/me is pending', () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    renderProvider();

    expect(screen.getByRole('status').textContent).toMatch(/Checking authentication|التحقق/);
    expect(screen.queryByTestId('protected')).toBeNull();
    expect(mocks.get).toHaveBeenCalledWith('/api/auth/me');
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('clears stale client auth state and redirects on /auth/me failure without calling logout', async () => {
    localStorage.setItem('our_clinic_auth', 'stale');
    sessionStorage.setItem('our_clinic_user', 'stale');
    mocks.get.mockRejectedValue(new Error('401'));
    renderProvider();

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/admin/login?next=%2Fadmin%2Fdashboard'));
    expect(localStorage.getItem('our_clinic_auth')).toBeNull();
    expect(sessionStorage.getItem('our_clinic_user')).toBeNull();
    expect(screen.queryByTestId('protected')).toBeNull();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('mounts protected content only after /auth/me succeeds', async () => {
    mocks.get.mockResolvedValue({ user });
    renderProvider();

    expect((await screen.findByTestId('protected')).textContent).toContain('authenticated');
    expect(screen.getByTestId('protected').textContent).toContain('Test Admin');
    expect(mocks.get).toHaveBeenCalledTimes(1);
  });

  it('handles repeated unauthorized events once and unmounts protected content', async () => {
    mocks.get.mockResolvedValue({ user });
    renderProvider();
    await screen.findByTestId('protected');

    fireEvent(window, new Event('our-clinic:auth-unauthorized'));
    fireEvent(window, new Event('our-clinic:auth-unauthorized'));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledTimes(1));
    expect(mocks.replace).toHaveBeenCalledWith('/admin/login?next=%2Fadmin%2Fdashboard');
    expect(screen.queryByTestId('protected')).toBeNull();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('clears local auth and redirects once even when logout returns 401', async () => {
    mocks.get.mockResolvedValue({ user });
    mocks.post.mockRejectedValue(new Error('401'));
    renderProvider();
    await screen.findByTestId('protected');

    const logoutButton = screen.getByRole('button', { name: 'Log out now' });
    fireEvent.click(logoutButton);
    fireEvent.click(logoutButton);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/admin/login'));
    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(mocks.post).toHaveBeenCalledWith('/api/auth/logout');
    expect(screen.queryByTestId('protected')).toBeNull();
  });
});
