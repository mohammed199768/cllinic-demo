'use client';

import { localAdminRequest, LocalApiError } from '@ourclinic/local-data/admin-adapter';
export const AUTH_UNAUTHORIZED_EVENT = 'our-clinic:auth-unauthorized';

const AUTH_ENDPOINTS = new Set(['/api/auth/login', '/api/auth/me', '/api/auth/logout']);
let unauthorizedSignaled = false;

export interface ApiFieldErrors { [k: string]: string[] }
export class ApiError extends Error {
  code: string;
  fieldErrors?: ApiFieldErrors;
  status: number;
  constructor(status: number, code: string, message: string, fieldErrors?: ApiFieldErrors) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : undefined;
  try {
    const data = await localAdminRequest<T>(method, path, body);
    if (path === '/api/auth/login' || path === '/api/auth/me') unauthorizedSignaled = false;
    return data;
  } catch (reason) {
    const local = reason instanceof LocalApiError
      ? reason
      : new LocalApiError(500, 'LOCAL_DATA_ERROR', reason instanceof Error ? reason.message : 'Request failed');
    if (local.status === 401 && !AUTH_ENDPOINTS.has(path) && !unauthorizedSignaled && typeof window !== 'undefined') {
      unauthorizedSignaled = true;
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }
    throw new ApiError(local.status, local.code, local.message, local.fieldErrors);
  }
}

export const api = {
  get: <T,>(p: string) => request<T>(p),
  post: <T,>(p: string, body?: unknown) => request<T>(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T,>(p: string, body?: unknown) => request<T>(p, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  put: <T,>(p: string, body?: unknown) => request<T>(p, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: <T,>(p: string) => request<T>(p, { method: 'DELETE' }),
};
