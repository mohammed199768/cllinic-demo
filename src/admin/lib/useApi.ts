'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from './api';

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestedPathRef = useRef<string | null>(null);

  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      setData(await api.get<T>(path));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'error');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (!path || requestedPathRef.current === path) return;
    requestedPathRef.current = path;
    void reload();
  }, [path, reload]);
  return { data, loading, error, reload, setData };
}

export interface Paginated<T> { data: T[]; page: number; pageSize: number; total: number; totalPages: number }
