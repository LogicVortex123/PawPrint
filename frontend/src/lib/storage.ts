// localStorage helpers. Every read/write is wrapped in try/catch because storage
// can be unavailable (private browsing, blocked site data) or full — the app must
// keep working without it, just without the saved data.

const PREFIX = 'pawprint-';

export const StorageKeys = {
  token: `${PREFIX}token`,
  user: `${PREFIX}user`,
  theme: `${PREFIX}theme`,
  favoriteClinics: `${PREFIX}favorite-clinics`,
  recordsCache: `${PREFIX}records-cache`,
  selectedPet: `${PREFIX}selected-pet`,
  recentSearches: `${PREFIX}recent-searches`,
  draftPrefix: `${PREFIX}draft:`,
} as const;

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage blocked — saved data is a convenience, not required
  }
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // see writeJson
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// Everything tied to the signed-in account: session, cached records, selected
// pet, form drafts and recent searches. Theme and saved clinics are browser
// preferences and stay. Called on logout and when the session expires.
export function clearAccountData(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(StorageKeys.draftPrefix)) keys.push(key);
    }
    keys.forEach(removeKey);
  } catch {
    // ignore
  }
  [StorageKeys.token, StorageKeys.user, StorageKeys.recordsCache, StorageKeys.selectedPet, StorageKeys.recentSearches].forEach(removeKey);
}
