// The browser's own calendar day as 'YYYY-MM-DD'. Sent to the API for
// medication doses so "today" is the owner's today, not the server's.
export function todayKey(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDaysToKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d + days));
}

// Same day N months later, clamped to the month's last day (31 Jan + 1 month → 28/29 Feb)
export function addMonthsToKey(key: string, months: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const target = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return todayKey(new Date(target.getFullYear(), target.getMonth(), Math.min(d, lastDay)));
}

// ISO timestamp → the local calendar day 'YYYY-MM-DD'
export function isoToDateKey(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? todayKey() : todayKey(d);
}

// 'YYYY-MM-DD' → "12 Jan 2026" without timezone shifts
export function formatDateKey(key: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', opts);
}
