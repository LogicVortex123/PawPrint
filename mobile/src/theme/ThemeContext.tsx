import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { getThemePreference, setThemePreference } from '../settings/storage';
import { darkColors, lightColors, type ThemeColors, type ThemePreference } from './colors';

const ThemeContext = createContext<{
  colors: ThemeColors;
  dark: boolean;
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => void;
}>({
  colors: lightColors,
  dark: false,
  preference: 'system',
  setPreference: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    void getThemePreference().then(setPreferenceState);
  }, []);

  const setPreference = useCallback((value: ThemePreference) => {
    setPreferenceState(value);
    void setThemePreference(value);
  }, []);

  const dark = preference === 'system' ? system === 'dark' : preference === 'dark';
  const value = useMemo(
    () => ({ colors: dark ? darkColors : lightColors, dark, preference, setPreference }),
    [dark, preference, setPreference],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
