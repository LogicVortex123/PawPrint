import { Image, RefreshControl, ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Card, FaceRow, Muted, Screen, SyncBadge } from '../components/ui';
import { fileUrl } from '../api/config';
import { deriveVaccinationStatus } from '../lib/vaccinationStatus';
import { formatDay, formatWhen } from '../lib/dates';
import type { TabParamList } from '../navigation/types';
import { useData } from '../store/data';
import { useSession } from '../store/session';
import { useTheme } from '../theme/ThemeContext';
import { photos, speciesPhoto } from '../theme/photos';

export function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useSession();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const data = useData();
  const pet = data.activePet;
  const vaccines = data.vaccinations.filter((item) => item.petLocalId === pet?.localId && !item.deleted);
  const nextVaccine = [...vaccines].sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))[0];
  const nextVisit = data.appointments
    .filter((item) => item.petLocalId === pet?.localId && !item.deleted && item.status === 'scheduled' && new Date(item.date).getTime() >= Date.now() - 60 * 60 * 1000)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const visiblePets = data.pets.filter((item) => !item.deleted);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const hero = pet?.photoUri ? { uri: pet.photoUri } : pet?.photoUrl ? { uri: fileUrl(pet.photoUrl) || '' } : pet ? speciesPhoto(pet.species) : photos.beagle;

  return (
    <Screen refreshControl={<RefreshControl refreshing={data.syncing} onRefresh={() => void data.sync()} tintColor={colors.forest} />}>
      <Text style={[styles.kicker, { color: colors.forest }]}>{greeting}{user ? `, ${user.name.split(' ')[0]}` : ''}</Text>
      <Text style={[styles.headline, { color: colors.text }]}>{pet ? `What does ${pet.name} need?` : 'Every wag and purr, organised.'}</Text>
      <Muted>{data.online ? 'Online and ready to sync.' : 'Offline — new records stay on this phone.'}</Muted>
      {data.syncNote ? <Muted>{data.syncNote}</Muted> : null}
      <View style={styles.hero}>
        <Image source={hero} style={styles.heroImage} />
        <View style={styles.heroShade} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{pet ? pet.name : 'Dogs, cats and everyone in between'}</Text>
          <Text style={styles.heroText}>{pet ? `${pet.species}${pet.breed ? ` · ${pet.breed}` : ''}` : 'The same calm records as the website.'}</Text>
        </View>
      </View>
      <View style={styles.faceLine}>
        <FaceRow />
        <Muted>Made for the pets you love</Muted>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcher}>
        {visiblePets.map((item) => {
          const selected = item.localId === pet?.localId;
          const thumb = item.photoUri ? { uri: item.photoUri } : item.photoUrl ? { uri: fileUrl(item.photoUrl) || '' } : speciesPhoto(item.species);
          return (
            <Pressable key={item.localId} onPress={() => void data.choosePet(item.localId)} style={[styles.chip, { borderColor: selected ? colors.forest : colors.line, backgroundColor: colors.card }]}>
              <Image source={thumb} style={styles.chipPhoto} />
              <Text style={{ color: colors.text, fontWeight: '700' }}>{item.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Card>
        <View style={styles.cardHead}>
          <Image source={photos.vet} style={styles.thumb} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Next vaccination</Text>
        </View>
        {nextVaccine ? (
          <>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{nextVaccine.vaccineName}</Text>
            <Muted>Due {formatDay(nextVaccine.nextDueDate)} · {deriveVaccinationStatus(nextVaccine.nextDueDate)}</Muted>
            <SyncBadge status={nextVaccine.syncStatus} />
          </>
        ) : <Muted>No vaccination logged for this pet yet.</Muted>}
      </Card>
      <Card>
        <View style={styles.cardHead}>
          <Image source={photos.aussie} style={styles.thumb} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Next appointment</Text>
        </View>
        {nextVisit ? (
          <>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{nextVisit.clinicName}</Text>
            <Muted>{formatWhen(nextVisit.date)}{nextVisit.reason ? ` · ${nextVisit.reason}` : ''}</Muted>
            <SyncBadge status={nextVisit.syncStatus} />
          </>
        ) : <Muted>No upcoming visit.</Muted>}
      </Card>
      <View style={styles.actions}>
        {[
          ['Add pet', () => navigation.navigate('Pets', { screen: 'PetForm' }), photos.corgi],
          ['Log vaccine', () => navigation.navigate('Health', { screen: 'VaccinationForm' }), photos.vet],
          ['Log weight', () => navigation.navigate('Health', { screen: 'WeightForm' }), photos.pug],
          ['Book visit', () => navigation.navigate('Appointments', { screen: 'AppointmentForm' }), photos.samoyed],
        ].map(([label, onPress, image]) => (
          <Pressable key={label as string} style={[styles.action, { backgroundColor: colors.card, borderColor: colors.line }]} onPress={onPress as () => void}>
            <Image source={image as number} style={styles.actionPhoto} />
            <Text style={{ color: colors.forest, fontWeight: '700' }}>{label as string}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: 13, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  headline: { fontSize: 30, fontWeight: '700', letterSpacing: -0.7 },
  hero: { height: 230, borderRadius: 32, overflow: 'hidden', justifyContent: 'flex-end' },
  heroImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20, 80, 61, 0.28)' },
  heroCopy: { padding: 18 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '700' },
  heroText: { color: 'rgba(255,255,255,0.92)', marginTop: 4 },
  faceLine: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switcher: { gap: 10, paddingVertical: 4 },
  chip: { borderWidth: 1, borderRadius: 999, paddingRight: 14, paddingLeft: 6, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipPhoto: { width: 36, height: 36, borderRadius: 18 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  thumb: { width: 42, height: 42, borderRadius: 14 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { borderWidth: 1, borderRadius: 22, padding: 8, paddingRight: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionPhoto: { width: 36, height: 36, borderRadius: 12 },
});
