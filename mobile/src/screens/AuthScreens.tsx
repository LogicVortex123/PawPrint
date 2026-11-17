import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Button, BrandLockup, ErrorText, FaceRow, Field, Muted, PhotoBanner, Screen, Title } from '../components/ui';
import { photos } from '../theme/photos';
import { errorMessage, useSession } from '../store/session';
import { useTheme } from '../theme/ThemeContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthParamList } from '../navigation/types';

export function LoginScreen({ navigation }: NativeStackScreenProps<AuthParamList, 'Login'>) {
  const { colors } = useTheme();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(errorMessage(err, 'Those details were not recognised.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <PhotoBanner source={photos.beach} title="Welcome back." text="Your pets’ records, reminders and routines are right where you left them." />
      <BrandLockup />
      <Title>Welcome back</Title>
      <Muted>Sign in with the same email you use on the PawPrint website. The first try can take up to a minute while the server wakes up.</Muted>
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@email.com" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
      <ErrorText>{error}</ErrorText>
      <Button label="Log in" onPress={() => void submit()} disabled={busy} />
      <FaceRow />
      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={{ color: colors.forest, fontWeight: '700' }}>Create an account</Text>
      </Pressable>
    </Screen>
  );
}

export function RegisterScreen({ navigation }: NativeStackScreenProps<AuthParamList, 'Register'>) {
  const { colors } = useTheme();
  const { signUp } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (!name.trim()) {
      setError('Enter your name.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      await signUp(name, email, password);
    } catch (err) {
      setError(errorMessage(err, 'Could not create the account.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <PhotoBanner source={photos.cuddle} title="Care, beautifully organised." text="Vaccines, weight, visits and documents — one calm place for every pet." />
      <BrandLockup />
      <Title>Create your account</Title>
      <Muted>Your pets will be tied to this login and can sync to the cloud.</Muted>
      <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" placeholder="At least 8 characters" />
      <ErrorText>{error}</ErrorText>
      <Button label="Create account" onPress={() => void submit()} disabled={busy} />
      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={{ color: colors.forest, fontWeight: '700' }}>I already have an account</Text>
      </Pressable>
    </Screen>
  );
}
