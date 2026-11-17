import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Button, Muted, Title } from '../components/ui';
import type { AppointmentParamList, AuthParamList, HealthParamList, PetsParamList, TabParamList } from './types';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen, RegisterScreen } from '../screens/AuthScreens';
import { HomeScreen } from '../screens/HomeScreen';
import { PetFormScreen, PetListScreen } from '../screens/PetScreens';
import { DocumentFormScreen, HealthScreen, VaccinationFormScreen, WeightFormScreen } from '../screens/HealthScreens';
import { AppointmentFormScreen, AppointmentListScreen } from '../screens/AppointmentScreens';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useSession } from '../store/session';
import { useTheme } from '../theme/ThemeContext';
import { useState } from 'react';

const AuthStack = createNativeStackNavigator<AuthParamList>();
const PetsStack = createNativeStackNavigator<PetsParamList>();
const HealthStack = createNativeStackNavigator<HealthParamList>();
const AppointmentStack = createNativeStackNavigator<AppointmentParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

function PetsNavigator() {
  return (
    <PetsStack.Navigator>
      <PetsStack.Screen name="PetList" component={PetListScreen} options={{ title: 'Pets' }} />
      <PetsStack.Screen name="PetForm" component={PetFormScreen} options={{ title: 'Pet' }} />
    </PetsStack.Navigator>
  );
}

function HealthNavigator() {
  return (
    <HealthStack.Navigator>
      <HealthStack.Screen name="HealthHome" component={HealthScreen} options={{ title: 'Health' }} />
      <HealthStack.Screen name="VaccinationForm" component={VaccinationFormScreen} options={{ title: 'Vaccination' }} />
      <HealthStack.Screen name="WeightForm" component={WeightFormScreen} options={{ title: 'Weight' }} />
      <HealthStack.Screen name="DocumentForm" component={DocumentFormScreen} options={{ title: 'Document' }} />
    </HealthStack.Navigator>
  );
}

function AppointmentNavigator() {
  return (
    <AppointmentStack.Navigator>
      <AppointmentStack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: 'Appointments' }} />
      <AppointmentStack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Book' }} />
    </AppointmentStack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.forest,
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
        sceneStyle: { backgroundColor: colors.bg },
        tabBarIcon: ({ color, size }) => {
          const name = route.name === 'Home' ? 'home'
            : route.name === 'Pets' ? 'paw'
              : route.name === 'Health' ? 'heart'
                : route.name === 'Appointments' ? 'calendar'
                  : 'person';
          return <Ionicons name={name} color={color} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Pets" component={PetsNavigator} options={{ headerShown: false }} />
      <Tabs.Screen name="Health" component={HealthNavigator} options={{ headerShown: false }} />
      <Tabs.Screen name="Appointments" component={AppointmentNavigator} options={{ headerShown: false, title: 'Visits' }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function LockOverlay() {
  const { colors } = useTheme();
  const { unlock } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <View style={[styles.lock, { backgroundColor: colors.bg }]}>
      <Title>PawPrint is locked</Title>
      <Muted>Use Face ID or your fingerprint to open your pets’ records.</Muted>
      {message ? <Text style={{ color: colors.coral }}>{message}</Text> : null}
      <Button label="Unlock" onPress={() => void unlock().then(setMessage)} />
    </View>
  );
}

export function RootNavigator() {
  const { ready, onboarded, user, locked } = useSession();
  const { colors, dark } = useTheme();

  if (!ready) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.forest }]}>
        <ActivityIndicator color={colors.onForest} />
        <Text style={{ color: colors.onForest, fontWeight: '800', fontSize: 22 }}>PawPrint</Text>
      </View>
    );
  }

  const navigationTheme = {
    ...DefaultTheme,
    dark,
    colors: {
      ...DefaultTheme.colors,
      background: colors.bg,
      card: colors.card,
      text: colors.text,
      border: colors.line,
      primary: colors.forest,
    },
  };

  return (
    <View style={styles.fill}>
      <NavigationContainer theme={navigationTheme}>
        {!onboarded ? <OnboardingScreen /> : !user ? (
          <AuthStack.Navigator screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.forest }}>
            <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Log in' }} />
            <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
          </AuthStack.Navigator>
        ) : <MainTabs />}
      </NavigationContainer>
      {user && locked ? <LockOverlay /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  lock: { ...StyleSheet.absoluteFill, padding: 24, justifyContent: 'center', gap: 16 },
});
