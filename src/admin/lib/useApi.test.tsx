import { StrictMode } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useApi } from './useApi';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('./api', () => ({
  api: { get: mocks.get },
  ApiError: class ApiError extends Error {},
}));

function Probe({ path }: { path: string }) {
  const { data, loading } = useApi<{ value: string }>(path);
  return <output>{loading ? 'loading' : data?.value}</output>;
}

beforeEach(() => mocks.get.mockReset());
afterEach(() => cleanup());

describe('useApi initial request lifecycle', () => {
  it('issues one initial GET per path under React Strict Mode', async () => {
    mocks.get.mockImplementation((path: string) => Promise.resolve({ value: path }));
    const view = render(<StrictMode><Probe path="/api/bookings" /></StrictMode>);

    await waitFor(() => expect(screen.getByText('/api/bookings')).toBeTruthy());
    expect(mocks.get).toHaveBeenCalledTimes(1);

    view.rerender(<StrictMode><Probe path="/api/dashboard/summary" /></StrictMode>);
    await waitFor(() => expect(screen.getByText('/api/dashboard/summary')).toBeTruthy());
    expect(mocks.get).toHaveBeenCalledTimes(2);
  });
});
