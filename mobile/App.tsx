import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { DataProvider } from './src/store/data';
import { SessionProvider } from './src/store/session';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function Shell() {
  const { dark } = useTheme();
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <DataProvider>
          <RootNavigator />
          <StatusBar style={dark ? 'light' : 'dark'} />
        </DataProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}
