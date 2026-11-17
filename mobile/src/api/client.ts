import axios, { type AxiosError } from 'axios';
import { API_BASE_URL } from './config';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<{ error?: { message?: string } }>).response?.data;
    if (data?.error?.message) return data.error.message;
    if (!error.response) {
      return 'The PawPrint server did not answer. It sleeps when unused and can take a minute to wake. Try again.';
    }
  }
  if (error instanceof Error && error.message.includes('Access Handle')) {
    return 'The offline database is open in another browser tab. Close the other PawPrint tabs, refresh this page, and try again.';
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

export async function uploadForm(path: string, form: FormData, token: string): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) as { error?: { message?: string } } : {};
  if (!response.ok) {
    throw new Error(body.error?.message || 'Upload failed');
  }
  return body;
}
