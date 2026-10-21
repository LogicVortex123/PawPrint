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
  notifiedReminders: `${PREFIX}notified-reminders`,
  chat: `${PREFIX}chat`,
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

// A signed-in user is normally sent from the home page to their dashboard.
// Choosing "Home page" from the app sets this for the tab so they can look
// around the public pages; opening the dashboard again clears it.
const BROWSE_HOME_KEY = `${PREFIX}browse-home`;

export function isBrowsingHome(): boolean {
  try {
    return sessionStorage.getItem(BROWSE_HOME_KEY) === '1';
  } catch {
    return false;
  }
}

export function setBrowsingHome(on: boolean): void {
  try {
    if (on) sessionStorage.setItem(BROWSE_HOME_KEY, '1');
    else sessionStorage.removeItem(BROWSE_HOME_KEY);
  } catch {
    // Without storage the home page just keeps redirecting to the dashboard
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
  [StorageKeys.token, StorageKeys.user, StorageKeys.recordsCache, StorageKeys.selectedPet, StorageKeys.recentSearches, StorageKeys.notifiedReminders, StorageKeys.chat].forEach(removeKey);
  setBrowsingHome(false);
}
