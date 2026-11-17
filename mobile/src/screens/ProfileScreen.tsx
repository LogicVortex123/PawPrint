import { useEffect, useState } from 'react';
import { Button, BrandLockup, ChoiceRow, ErrorText, Muted, PhotoBanner, Screen } from '../components/ui';
import {
  getNotificationPrefs,
  setNotificationPrefs,
  type NotificationPrefs,
} from '../settings/storage';
import { useSession } from '../store/session';
import { useData } from '../store/data';
import { useTheme } from '../theme/ThemeContext';
import type { ThemePreference } from '../theme/colors';
import { photos } from '../theme/photos';

export function ProfileScreen() {
  const { preference, setPreference } = useTheme();
  const { user, signOut, biometricEnabled, setBiometric } = useSession();
  const { sync, syncing } = useData();
  const [notes, setNotes] = useState<NotificationPrefs>({ vaccination: true, appointment: true, sync: true, leadDays: 7 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getNotificationPrefs().then(setNotes);
  }, []);

  function changeTheme(value: string) {
    setPreference(value as ThemePreference);
  }

  async function changeNotes(next: NotificationPrefs) {
    setNotes(next);
    await setNotificationPrefs(next);
  }

  return (
    <Screen>
      <PhotoBanner source={photos.samoyed} title={user?.name || 'Profile'} text={user?.email} height={200} />
      <BrandLockup />
      <Button label={syncing ? 'Syncing…' : 'Sync now'} onPress={() => void sync()} disabled={syncing} />
      <Muted>Appearance</Muted>
      <ChoiceRow
        value={preference}
        onChange={(value) => void changeTheme(value)}
        options={[{ label: 'System', value: 'system' }, { label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }]}
      />
      <Muted>Reminders</Muted>
      <ChoiceRow
        value={notes.vaccination ? 'on' : 'off'}
        onChange={(value) => void changeNotes({ ...notes, vaccination: value === 'on' })}
        options={[{ label: 'Vaccines on', value: 'on' }, { label: 'Vaccines off', value: 'off' }]}
      />
      <ChoiceRow
        value={notes.appointment ? 'on' : 'off'}
        onChange={(value) => void changeNotes({ ...notes, appointment: value === 'on' })}
        options={[{ label: 'Visits on', value: 'on' }, { label: 'Visits off', value: 'off' }]}
      />
      <ChoiceRow
        value={notes.sync ? 'on' : 'off'}
        onChange={(value) => void changeNotes({ ...notes, sync: value === 'on' })}
        options={[{ label: 'Sync alerts on', value: 'on' }, { label: 'Sync alerts off', value: 'off' }]}
      />
      <Muted>Vaccine reminder lead time: {notes.leadDays} days</Muted>
      <ChoiceRow
        value={String(notes.leadDays)}
        onChange={(value) => void changeNotes({ ...notes, leadDays: Number(value) })}
        options={[{ label: '3 days', value: '3' }, { label: '7 days', value: '7' }, { label: '14 days', value: '14' }]}
      />
      <Muted>App lock</Muted>
      <Button
        label={biometricEnabled ? 'Turn off Face ID / fingerprint' : 'Lock PawPrint with biometrics'}
        tone="ghost"
        onPress={async () => setError(await setBiometric(!biometricEnabled))}
      />
      <ErrorText>{error}</ErrorText>
      <Button label="Log out" tone="danger" onPress={() => void signOut()} />
    </Screen>
  );
}
