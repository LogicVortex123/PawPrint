import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, errorMessage } from '../api/client';
import { Button, Card, EmptyPhoto, ErrorText, Field, Muted, PhotoBanner, Screen, SyncBadge, Title } from '../components/ui';
import { formatWhen, isIsoDate, todayDate, toLocalIso } from '../lib/dates';
import type { AppointmentParamList } from '../navigation/types';
import { useData } from '../store/data';
import { useTheme } from '../theme/ThemeContext';
import { photos } from '../theme/photos';

interface ClinicHit {
  _id: string;
  name: string;
  address?: string;
  distanceKm?: number;
}

export function AppointmentListScreen({ navigation }: NativeStackScreenProps<AppointmentParamList, 'AppointmentList'>) {
  const { colors } = useTheme();
  const { appointments, pets, removeAppointment } = useData();
  const visible = appointments.filter((item) => !item.deleted);

  return (
    <Screen>
      <PhotoBanner source={photos.aussie} title="Appointments" text="Book a visit. It stays on this phone until it syncs." height={190} />
      <Muted>Bookings are saved here first. If you are offline they stay pending until sync.</Muted>
      {visible.length === 0 ? <EmptyPhoto source={photos.samoyed} text="No appointments yet." /> : null}
      {visible.map((item) => {
        const pet = pets.find((candidate) => candidate.localId === item.petLocalId);
        return (
          <Card key={item.localId}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{item.clinicName}</Text>
            <Muted>{pet?.name || 'Pet'} · {formatWhen(item.date)}</Muted>
            {item.reason ? <Muted>{item.reason}</Muted> : null}
            <SyncBadge status={item.syncStatus} />
            <Button label="Remove" tone="ghost" onPress={() => void removeAppointment(item.localId)} />
          </Card>
        );
      })}
      <Button label="Book appointment" onPress={() => navigation.navigate('AppointmentForm')} />
    </Screen>
  );
}

export function AppointmentFormScreen({ navigation }: NativeStackScreenProps<AppointmentParamList, 'AppointmentForm'>) {
  const { colors } = useTheme();
  const data = useData();
  const [petId, setPetId] = useState(data.activePet?.localId ?? '');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [date, setDate] = useState(todayDate());
  const [time, setTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [clinics, setClinics] = useState<ClinicHit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function findClinics() {
    setError(null);
    if (!data.online) {
      setError('You are offline. Type the clinic name and it will sync later.');
      return;
    }
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setError('Location is off. Type a clinic name instead.');
      return;
    }
    setBusy(true);
    try {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const response = await api.get<ClinicHit[]>('/clinics/nearby', {
        params: { lat: position.coords.latitude, lng: position.coords.longitude },
      });
      const list = Array.isArray(response.data) ? response.data : [];
      setClinics(list.slice(0, 8));
      if (list.length === 0) setError('No clinics were found nearby. Type a name instead.');
    } catch (err) {
      setError(errorMessage(err, 'Could not search clinics.'));
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!petId) {
      setError('Add a pet before booking.');
      return;
    }
    if (!clinicName.trim()) {
      setError('Enter a clinic name.');
      return;
    }
    if (!isIsoDate(date) || !/^\d{2}:\d{2}$/.test(time)) {
      setError('Use a date as YYYY-MM-DD and a time as HH:MM.');
      return;
    }
    await data.saveAppointment({
      petLocalId: petId,
      clinicName: clinicName.trim(),
      clinicAddress: clinicAddress.trim(),
      date: toLocalIso(date, time),
      reason: reason.trim(),
      notes: notes.trim(),
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <Title>Book a visit</Title>
      <Muted>Pet</Muted>
      {data.pets.filter((pet) => !pet.deleted).map((pet) => (
        <Pressable key={pet.localId} onPress={() => setPetId(pet.localId)}>
          <Text style={{ color: pet.localId === petId ? colors.forest : colors.text, fontWeight: '700' }}>{pet.localId === petId ? '● ' : '○ '}{pet.name}</Text>
        </Pressable>
      ))}
      <Field label="Clinic" value={clinicName} onChangeText={setClinicName} />
      <Field label="Address" value={clinicAddress} onChangeText={setClinicAddress} />
      <Button label={busy ? 'Looking nearby…' : 'Find nearby clinics'} tone="ghost" onPress={() => void findClinics()} disabled={busy} />
      {clinics.map((clinic) => (
        <Pressable
          key={clinic._id}
          onPress={() => {
            setClinicName(clinic.name);
            setClinicAddress(clinic.address || '');
          }}
        >
          <Card>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{clinic.name}</Text>
            <Muted>{clinic.distanceKm != null ? `${clinic.distanceKm} km · ` : ''}{clinic.address || 'Address unavailable'}</Muted>
          </Card>
        </Pressable>
      ))}
      <Field label="Date" value={date} onChangeText={setDate} autoCapitalize="none" />
      <Field label="Time" value={time} onChangeText={setTime} autoCapitalize="none" placeholder="HH:MM" />
      <Field label="Reason" value={reason} onChangeText={setReason} />
      <Field label="Notes" value={notes} onChangeText={setNotes} />
      <ErrorText>{error}</ErrorText>
      <Button label="Confirm booking" onPress={() => void save()} />
    </Screen>
  );
}
