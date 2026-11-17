import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { ThemePreference } from '../theme/colors';

const TOKEN = 'pawprint.token';
const ONBOARDING = 'pawprint.onboarding';
const THEME = 'pawprint.theme';
const ACTIVE_PET = 'pawprint.activePet';
const USER = 'pawprint.user';
const BIOMETRIC = 'pawprint.biometric';
const NOTIFICATIONS = 'pawprint.notifications';

export interface CachedUser {
  id: string;
  name: string;
  email: string;
}

export interface NotificationPrefs {
  vaccination: boolean;
  appointment: boolean;
  sync: boolean;
  leadDays: number;
}

export const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  vaccination: true,
  appointment: true,
  sync: true,
  leadDays: 7,
};

export const tokenStore = Platform.OS === 'web'
  ? {
      get: async () => localStorage.getItem(TOKEN),
      set: async (token: string) => { localStorage.setItem(TOKEN, token); },
      clear: async () => { localStorage.removeItem(TOKEN); },
    }
  : {
      get: () => SecureStore.getItemAsync(TOKEN),
      set: (token: string) => SecureStore.setItemAsync(TOKEN, token),
      clear: () => SecureStore.deleteItemAsync(TOKEN),
    };

export async function getOnboarded(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDING)) === '1';
}

export async function setOnboarded() {
  await AsyncStorage.setItem(ONBOARDING, '1');
}

export async function getThemePreference(): Promise<ThemePreference> {
  const value = await AsyncStorage.getItem(THEME);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

export async function setThemePreference(value: ThemePreference) {
  await AsyncStorage.setItem(THEME, value);
}

export async function getActivePetId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_PET);
}

export async function setActivePetId(id: string | null) {
  if (id) await AsyncStorage.setItem(ACTIVE_PET, id);
  else await AsyncStorage.removeItem(ACTIVE_PET);
}

export async function getCachedUser(): Promise<CachedUser | null> {
  const raw = await AsyncStorage.getItem(USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedUser;
  } catch {
    return null;
  }
}

export async function setCachedUser(user: CachedUser | null) {
  if (user) await AsyncStorage.setItem(USER, JSON.stringify(user));
  else await AsyncStorage.removeItem(USER);
}

export async function getBiometricEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(BIOMETRIC)) === '1';
}

export async function setBiometricEnabled(enabled: boolean) {
  await AsyncStorage.setItem(BIOMETRIC, enabled ? '1' : '0');
}

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  const raw = await AsyncStorage.getItem(NOTIFICATIONS);
  if (!raw) return DEFAULT_NOTIFICATIONS;
  try {
    return { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export async function setNotificationPrefs(prefs: NotificationPrefs) {
  await AsyncStorage.setItem(NOTIFICATIONS, JSON.stringify(prefs));
}
