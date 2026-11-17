import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fileUrl } from '../api/config';
import { Button, Card, ChoiceRow, EmptyPhoto, ErrorText, Field, Muted, PhotoBanner, Screen, SyncBadge, Title } from '../components/ui';
import type { DocumentCategory } from '../db/repository';
import { formatDay, formatWhen, isIsoDate, todayDate, toLocalIso } from '../lib/dates';
import { deriveVaccinationStatus } from '../lib/vaccinationStatus';
import { weightInsight, withTrend } from '../lib/weightTrend';
import type { HealthParamList } from '../navigation/types';
import { useData } from '../store/data';
import { useTheme } from '../theme/ThemeContext';
import { photos } from '../theme/photos';

type Filter = 'all' | 'vaccination' | 'weight' | 'appointment' | 'document';

export function HealthScreen({ navigation }: NativeStackScreenProps<HealthParamList, 'HealthHome'>) {
  const { colors } = useTheme();
  const data = useData();
  const pet = data.activePet;
  const [filter, setFilter] = useState<Filter>('all');
  const vaccines = data.vaccinations.filter((item) => item.petLocalId === pet?.localId && !item.deleted);
  const weights = withTrend(data.weights.filter((item) => item.petLocalId === pet?.localId && !item.deleted).sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)));
  const visits = data.appointments.filter((item) => item.petLocalId === pet?.localId && !item.deleted);
  const documents = data.documents.filter((item) => item.petLocalId === pet?.localId && !item.deleted);
  const insight = weightInsight(weights);

  const events = [
    ...vaccines.map((item) => ({ id: item.localId, kind: 'vaccination' as const, date: item.administrationDate, title: item.vaccineName, detail: `${deriveVaccinationStatus(item.nextDueDate)} · due ${formatDay(item.nextDueDate)}`, status: item.syncStatus, uri: null as string | null })),
    ...weights.map((item) => ({ id: item.localId, kind: 'weight' as const, date: item.recordedAt, title: `${item.weightKg} kg`, detail: item.trendPercent == null ? 'First weigh-in' : `${item.trendPercent > 0 ? '+' : ''}${item.trendPercent}% vs previous`, status: item.syncStatus, uri: null as string | null })),
    ...visits.map((item) => ({ id: item.localId, kind: 'appointment' as const, date: item.date, title: item.clinicName, detail: item.reason || item.status, status: item.syncStatus, uri: null as string | null })),
    ...documents.map((item) => ({ id: item.localId, kind: 'document' as const, date: item.updatedAt, title: item.category, detail: item.originalName || 'Document', status: item.syncStatus, uri: item.localUri || fileUrl(item.fileUrl) })),
  ].filter((item) => filter === 'all' || item.kind === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const maxWeight = Math.max(...weights.map((item) => item.weightKg), 1);

  return (
    <Screen>
      <PhotoBanner source={photos.vet} title={pet ? `${pet.name}'s health` : 'Health'} text="Vaccines, weight, visits and documents in one timeline." height={190} />
      {!pet ? <Muted>Add a pet first. Health records are stored on this phone for the active pet.</Muted> : null}
      <ChoiceRow
        value={filter}
        onChange={(value) => setFilter(value as Filter)}
        options={[
          { label: 'All', value: 'all' },
          { label: 'Vaccines', value: 'vaccination' },
          { label: 'Weight', value: 'weight' },
          { label: 'Visits', value: 'appointment' },
          { label: 'Docs', value: 'document' },
        ]}
      />
      {(filter === 'all' || filter === 'weight') && weights.length > 0 ? (
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Weight</Text>
          <View style={styles.chart}>
            {weights.slice(-8).map((item) => (
              <View key={item.localId} style={styles.barWrap}>
                <View style={[styles.bar, { height: Math.max(8, (item.weightKg / maxWeight) * 72), backgroundColor: colors.forest }]} />
              </View>
            ))}
          </View>
          {insight ? <Muted>{insight}</Muted> : null}
        </Card>
      ) : null}
      {events.length === 0 ? (
        <EmptyPhoto
          source={filter === 'weight' ? photos.corgi : filter === 'document' ? photos.ginger : filter === 'appointment' ? photos.aussie : filter === 'vaccination' ? photos.vet : photos.running}
          text="Nothing here yet."
        />
      ) : null}
      {events.map((event) => (
        <Card key={event.id}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{event.title}</Text>
          <Muted>{formatWhen(event.date.length <= 10 ? `${event.date}T00:00:00` : event.date)} · {event.detail}</Muted>
          {event.uri ? <Image source={{ uri: event.uri }} style={styles.preview} /> : null}
          <SyncBadge status={event.status} />
          {event.kind === 'vaccination' ? <Button label="Remove" tone="ghost" onPress={() => void data.removeVaccination(event.id)} /> : null}
          {event.kind === 'weight' ? <Button label="Remove" tone="ghost" onPress={() => void data.removeWeight(event.id)} /> : null}
          {event.kind === 'document' ? <Button label="Remove" tone="ghost" onPress={() => void data.removeDocument(event.id)} /> : null}
        </Card>
      ))}
      {pet ? (
        <View style={styles.row}>
          <Button label="Vaccine" onPress={() => navigation.navigate('VaccinationForm')} />
          <Button label="Weight" onPress={() => navigation.navigate('WeightForm')} />
          <Button label="Document" onPress={() => navigation.navigate('DocumentForm')} />
        </View>
      ) : null}
    </Screen>
  );
}

export function VaccinationFormScreen({ navigation }: NativeStackScreenProps<HealthParamList, 'VaccinationForm'>) {
  const pet = useData().activePet;
  const { saveVaccination } = useData();
  const [vaccineName, setVaccineName] = useState('');
  const [administrationDate, setAdministrationDate] = useState(todayDate());
  const [nextDueDate, setNextDueDate] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [clinic, setClinic] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!pet) return;
    if (!vaccineName.trim() || !isIsoDate(administrationDate) || !isIsoDate(nextDueDate)) {
      setError('Enter a vaccine name and both dates as YYYY-MM-DD.');
      return;
    }
    if (nextDueDate < administrationDate) {
      setError('The next due date cannot be before the date it was given.');
      return;
    }
    await saveVaccination({
      petLocalId: pet.localId,
      vaccineName: vaccineName.trim(),
      administrationDate,
      nextDueDate,
      veterinarian: veterinarian.trim(),
      clinic: clinic.trim(),
      batchNumber: '',
      notes: notes.trim(),
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <Title>Add vaccination</Title>
      <Muted>{pet ? `For ${pet.name}. Saved on this phone first.` : 'Choose a pet on the Pets tab first.'}</Muted>
      <Field label="Vaccine" value={vaccineName} onChangeText={setVaccineName} />
      <Field label="Date given" value={administrationDate} onChangeText={setAdministrationDate} autoCapitalize="none" />
      <Field label="Next due date" value={nextDueDate} onChangeText={setNextDueDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
      <Field label="Vet" value={veterinarian} onChangeText={setVeterinarian} />
      <Field label="Clinic" value={clinic} onChangeText={setClinic} />
      <Field label="Notes" value={notes} onChangeText={setNotes} />
      <ErrorText>{error}</ErrorText>
      <Button label="Save vaccination" onPress={() => void save()} disabled={!pet} />
    </Screen>
  );
}

export function WeightFormScreen({ navigation }: NativeStackScreenProps<HealthParamList, 'WeightForm'>) {
  const pet = useData().activePet;
  const { saveWeight } = useData();
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(todayDate());
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!pet) return;
    const weightKg = Number(weight);
    if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 500) {
      setError('Enter a weight in kilograms, greater than 0.');
      return;
    }
    if (!isIsoDate(date)) {
      setError('Date must be YYYY-MM-DD.');
      return;
    }
    await saveWeight(pet.localId, weightKg, toLocalIso(date, '09:00'));
    navigation.goBack();
  }

  return (
    <Screen>
      <Title>Log weight</Title>
      <Muted>Kilograms. A short trend note appears on the health screen. It is not a diagnosis.</Muted>
      <Field label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
      <Field label="Date" value={date} onChangeText={setDate} autoCapitalize="none" />
      <ErrorText>{error}</ErrorText>
      <Button label="Save weight" onPress={() => void save()} disabled={!pet} />
    </Screen>
  );
}

const CATEGORIES: DocumentCategory[] = ['Prescription', 'Medical Report', 'Insurance', 'Adoption'];

export function DocumentFormScreen({ navigation }: NativeStackScreenProps<HealthParamList, 'DocumentForm'>) {
  const pet = useData().activePet;
  const { saveDocument } = useData();
  const [category, setCategory] = useState<DocumentCategory>('Prescription');
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permission is needed to attach a document.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setUri(result.assets[0].uri);
  }

  async function save() {
    if (!pet || !uri) {
      setError('Choose a photo of the document first.');
      return;
    }
    await saveDocument({
      petLocalId: pet.localId,
      category,
      localUri: uri,
      originalName: uri.split('/').pop() || 'document.jpg',
      mimeType: 'image/jpeg',
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <Title>Add document</Title>
      <Muted>A photo from the camera or gallery is kept on this phone and uploaded when you are online.</Muted>
      <ChoiceRow value={category} onChange={(value) => setCategory(value as DocumentCategory)} options={CATEGORIES.map((item) => ({ label: item, value: item }))} />
      <View style={styles.row}>
        <Button label="Camera" tone="ghost" onPress={() => void pick(true)} />
        <Button label="Gallery" tone="ghost" onPress={() => void pick(false)} />
      </View>
      {uri ? <Muted>Photo attached.</Muted> : null}
      <ErrorText>{error}</ErrorText>
      <Button label="Save document" onPress={() => void save()} disabled={!pet} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 },
  barWrap: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 6 },
  preview: { width: '100%', height: 160, borderRadius: 14, marginTop: 8 },
});
