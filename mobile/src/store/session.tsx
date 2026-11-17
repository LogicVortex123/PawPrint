import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { api, errorMessage, setAuthToken } from '../api/client';
import { clearAllRecords, getDb } from '../db/database';
import {
  getBiometricEnabled,
  getCachedUser,
  getOnboarded,
  setBiometricEnabled,
  setCachedUser,
  setOnboarded,
  tokenStore,
  type CachedUser,
} from '../settings/storage';

interface SessionValue {
  ready: boolean;
  onboarded: boolean;
  user: CachedUser | null;
  locked: boolean;
  completeOnboarding: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  unlock: () => Promise<string | null>;
  setBiometric: (enabled: boolean) => Promise<string | null>;
  biometricEnabled: boolean;
}

const SessionContext = createContext<SessionValue | null>(null);

async function remember(token: string, user: CachedUser) {
  await tokenStore.set(token);
  setAuthToken(token);
  await setCachedUser(user);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboardedState] = useState(false);
  const [user, setUser] = useState<CachedUser | null>(null);
  const [locked, setLocked] = useState(false);
  const [biometricEnabled, setBiometricState] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await getDb();
        const [done, cached, token, biometric] = await Promise.all([
          getOnboarded(),
          getCachedUser(),
          tokenStore.get(),
          getBiometricEnabled(),
        ]);
        if (cancelled) return;
        setOnboardedState(done);
        setBiometricState(biometric);
        if (token) {
          setAuthToken(token);
          setUser(cached);
          setLocked(biometric);
          try {
            const response = await api.get('/auth/me');
            const next = {
              id: String(response.data.id),
              name: response.data.name as string,
              email: response.data.email as string,
            };
            await setCachedUser(next);
            if (!cancelled) setUser(next);
          } catch {
            // Offline or a sleeping server: keep the saved session so records stay usable.
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setOnboarded();
    setOnboardedState(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email: email.trim(), password });
    const next = response.data.user as CachedUser;
    try {
      await clearAllRecords();
    } catch {
      // The account is already created. A locked local database must not undo the login.
    }
    await remember(response.data.token as string, next);
    setUser(next);
    setLocked(false);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name: name.trim(), email: email.trim(), password });
    const next = response.data.user as CachedUser;
    try {
      await clearAllRecords();
    } catch {
      // The account is already created. A locked local database must not undo the login.
    }
    await remember(response.data.token as string, next);
    setUser(next);
    setLocked(false);
  }, []);

  const signOut = useCallback(async () => {
    await tokenStore.clear();
    setAuthToken(null);
    await setCachedUser(null);
    await clearAllRecords();
    setUser(null);
    setLocked(false);
  }, []);

  const unlock = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock PawPrint',
      cancelLabel: 'Cancel',
    });
    if (result.success) {
      setLocked(false);
      return null;
    }
    return 'Authentication was cancelled.';
  }, []);

  const setBiometric = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const hardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hardware || !enrolled) return 'Set up Face ID or a fingerprint on this phone first.';
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirm it is you' });
      if (!result.success) return 'Biometric lock was not turned on.';
    }
    await setBiometricEnabled(enabled);
    setBiometricState(enabled);
    return null;
  }, []);

  const value = useMemo<SessionValue>(() => ({
    ready,
    onboarded,
    user,
    locked,
    completeOnboarding,
    signIn,
    signUp,
    signOut,
    unlock,
    setBiometric,
    biometricEnabled,
  }), [ready, onboarded, user, locked, completeOnboarding, signIn, signUp, signOut, unlock, setBiometric, biometricEnabled]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}

export { errorMessage };
