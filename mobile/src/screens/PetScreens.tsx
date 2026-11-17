import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, ChoiceRow, EmptyPhoto, ErrorText, Field, Muted, PhotoBanner, Screen, SyncBadge, Title } from '../components/ui';
import { fileUrl } from '../api/config';
import type { Gender } from '../db/repository';
import { isFutureDate, isIsoDate } from '../lib/dates';
import type { PetsParamList } from '../navigation/types';
import { useData } from '../store/data';
import { useTheme } from '../theme/ThemeContext';
import { photos, speciesPhoto } from '../theme/photos';

export function PetListScreen({ navigation }: NativeStackScreenProps<PetsParamList, 'PetList'>) {
  const { colors } = useTheme();
  const { pets, choosePet, activePet } = useData();
  const visible = pets.filter((pet) => !pet.deleted);

  return (
    <Screen>
      <PhotoBanner source={photos.running} title="Your pets" text="Switch between them the same way you do on the website." height={180} />
      <Muted>The one you open becomes the pet on Home and Health.</Muted>
      {visible.length === 0 ? <EmptyPhoto source={photos.catPeek} text="No pets yet. Add the first one — it is saved on this phone immediately." /> : null}
      {visible.map((pet) => {
        const photo = pet.photoUri ? { uri: pet.photoUri } : pet.photoUrl ? { uri: fileUrl(pet.photoUrl) || '' } : speciesPhoto(pet.species);
        return (
          <Pressable key={pet.localId} onPress={() => { void choosePet(pet.localId); navigation.navigate('PetForm', { localId: pet.localId }); }}>
            <Card>
              <View style={styles.row}>
                <Image source={photo} style={styles.photo} />
                <View style={styles.flex}>
                  <Text style={[styles.name, { color: colors.text }]}>{pet.name}{activePet?.localId === pet.localId ? ' · active' : ''}</Text>
                  <Muted>{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</Muted>
                  <SyncBadge status={pet.photoDirty && pet.syncStatus === 'synced' ? 'pending' : pet.syncStatus} />
                </View>
              </View>
            </Card>
          </Pressable>
        );
      })}
      <Button label="Add pet" onPress={() => navigation.navigate('PetForm')} />
    </Screen>
  );
}

export function PetFormScreen({ navigation, route }: NativeStackScreenProps<PetsParamList, 'PetForm'>) {
  const existing = useData().pets.find((pet) => pet.localId === route.params?.localId);
  const { savePet, removePet } = useData();
  const [name, setName] = useState(existing?.name ?? '');
  const [species, setSpecies] = useState(existing?.species ?? 'dog');
  const [breed, setBreed] = useState(existing?.breed ?? '');
  const [gender, setGender] = useState<Gender>(existing?.gender ?? 'unknown');
  const [dateOfBirth, setDateOfBirth] = useState(existing?.dateOfBirth ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(existing?.photoUri ?? null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [allergies, setAllergies] = useState((existing?.allergies ?? []).join(', '));
  const [contactName, setContactName] = useState(existing?.emergencyContacts[0]?.name ?? '');
  const [contactPhone, setContactPhone] = useState(existing?.emergencyContacts[0]?.phone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(fromCamera ? 'Camera permission is needed for a photo.' : 'Photo library permission is needed.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoChanged(true);
    }
  }

  async function save() {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (dateOfBirth && (!isIsoDate(dateOfBirth) || isFutureDate(dateOfBirth))) {
      setError('Date of birth must be YYYY-MM-DD and cannot be in the future.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await savePet({
        name: name.trim(),
        species,
        breed: breed.trim(),
        gender,
        dateOfBirth: dateOfBirth || null,
        photoUri,
        microchipId: existing?.microchipId ?? '',
        allergies: allergies.split(',').map((item) => item.trim()).filter(Boolean),
        medications: existing?.medications ?? [],
        emergencyContacts: contactName.trim() || contactPhone.trim()
          ? [{ name: contactName.trim(), phone: contactPhone.trim() }]
          : [],
      }, existing?.localId, photoChanged);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this pet.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>{existing ? 'Edit pet' : 'Add pet'}</Title>
      <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
      <Muted>Species</Muted>
      <ChoiceRow
        value={species}
        onChange={setSpecies}
        options={[{ label: 'Dog', value: 'dog' }, { label: 'Cat', value: 'cat' }, { label: 'Other', value: 'other' }]}
      />
      <Field label="Breed" value={breed} onChangeText={setBreed} />
      <Muted>Gender</Muted>
      <ChoiceRow
        value={gender}
        onChange={(value) => setGender(value as Gender)}
        options={[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }, { label: 'Unknown', value: 'unknown' }]}
      />
      <Field label="Date of birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" autoCapitalize="none" />
      <Field label="Allergies" value={allergies} onChangeText={setAllergies} placeholder="Comma-separated" />
      <Field label="Emergency contact" value={contactName} onChangeText={setContactName} autoCapitalize="words" />
      <Field label="Emergency phone" value={contactPhone} onChangeText={setContactPhone} keyboardType="number-pad" />
      <View style={styles.row}>
        <Button label="Camera" tone="ghost" onPress={() => void pick(true)} />
        <Button label="Gallery" tone="ghost" onPress={() => void pick(false)} />
      </View>
      <Image source={photoUri ? { uri: photoUri } : existing?.photoUrl ? { uri: fileUrl(existing.photoUrl) || '' } : speciesPhoto(species)} style={styles.preview} />
      <ErrorText>{error}</ErrorText>
      <Button label="Save on this phone" onPress={() => void save()} disabled={busy} />
      {existing ? (
        <Button label="Remove pet" tone="danger" onPress={() => { void removePet(existing.localId); navigation.goBack(); }} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1, gap: 4 },
  name: { fontSize: 17, fontWeight: '700' },
  photo: { width: 72, height: 72, borderRadius: 24 },
  preview: { width: 120, height: 120, borderRadius: 20 },
});
