// Tiny fetch wrapper so components don't need to deal with headers and error parsing.
// All requests go to the backend base URL defined in VITE_API_URL (falls back to
// localhost:5000 during development).

import { clearAccountData } from './storage';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  token?: string | null;
};

// Shared response handling for JSON and multipart requests
async function handleResponse<T>(res: Response, sentToken: boolean): Promise<T> {
  // DELETE endpoints reply 204 with no body — nothing to parse
  const data = res.status === 204 ? undefined : await res.json().catch(() => undefined);

  if (!res.ok) {
    // Backend returns { error: { message: '...' } }
    const message = data?.error?.message || 'Something went wrong';

    // If the token has expired or is invalid, clear the session and send
    // the user back to login — prevents them from being stuck in a broken
    // "authenticated but every request fails" state. Only for requests that
    // carried a token: a wrong password on /auth/login is also a 401, and
    // reloading there would wipe the error message the user needs to see.
    if (res.status === 401 && sentToken) {
      clearAccountData();
      // Hard redirect clears all in-memory Zustand state as well
      window.location.href = '/login';
    }

    throw new Error(message);
  }

  return data as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(res, !!token);
}

// multipart/form-data POST for file uploads (documents, pet photos). The browser
// sets the multipart Content-Type boundary itself, so no Content-Type header here.
export async function apiUpload<T>(path: string, formData: FormData, token: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse<T>(res, true);
}

// Turns a stored "/uploads/..." path into a full URL; leaves absolute and local paths alone
export function fileUrl(path?: string): string | undefined {
  if (!path) return undefined;
  return path.startsWith('/uploads/') ? `${API_BASE_URL}${path}` : path;
}
