import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui';
import { useSession } from '../store/session';
import { photos } from '../theme/photos';

const SLIDES = [
  {
    image: photos.beach,
    title: 'Records that stay with you',
    body: 'Vaccines, weight and vet visits live on this phone, ready even when there is no signal.',
  },
  {
    image: photos.vet,
    title: 'Care, in a few taps',
    body: 'Log a booster, a weigh-in or a clinic visit. Home shows what your pet needs next.',
  },
  {
    image: photos.cuddle,
    title: 'Same account as the website',
    body: 'When you are back online, everything syncs. The web dashboard sees the same pets.',
  },
];

export function OnboardingScreen() {
  const { completeOnboarding } = useSession();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  return (
    <View style={styles.fill}>
      <Image source={slide.image} style={styles.photo} />
      <View style={styles.shade} />
      <SafeAreaView style={styles.copy}>
        <View style={styles.pill}><Text style={styles.pillText}>PawPrint</Text></View>
        <View style={styles.bottom}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
          <View style={styles.dots}>
            {SLIDES.map((item, dot) => (
              <View key={item.title} style={[styles.dot, dot === index && styles.dotOn]} />
            ))}
          </View>
          <Button
            label={last ? 'Get started' : 'Next'}
            onPress={() => {
              if (last) void completeOnboarding();
              else setIndex((value) => value + 1);
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#14503D' },
  photo: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(12, 28, 23, 0.35)' },
  copy: { flex: 1, justifyContent: 'space-between', padding: 22 },
  pill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  pillText: { color: '#1F6B53', fontWeight: '800' },
  bottom: { gap: 14 },
  title: { color: '#fff', fontSize: 34, fontWeight: '700', letterSpacing: -0.8 },
  body: { color: 'rgba(255,255,255,0.9)', fontSize: 16, lineHeight: 23 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotOn: { backgroundColor: '#fff', width: 22 },
});
