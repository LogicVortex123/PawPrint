// Tiny fetch wrapper so components don't need to deal with headers and error parsing.
// All requests go to the backend base URL defined in VITE_API_URL (falls back to
// localhost:5000 during development).

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    // Backend returns { error: { message: '...' } }
    const message = data?.error?.message || 'Something went wrong';
    throw new Error(message);
  }

  return data as T;
}
