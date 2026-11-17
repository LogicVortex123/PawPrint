export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'https://pawprint-2.onrender.com'
).replace(/\/$/, '');

export function fileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('file:')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
