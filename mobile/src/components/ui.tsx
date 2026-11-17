import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
  type RefreshControlProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SyncStatus } from '../db/repository';
import { photos } from '../theme/photos';
import { useTheme } from '../theme/ThemeContext';

export function Screen({
  children,
  refreshControl,
}: {
  children: ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.bg }]} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Title({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.title, { color: colors.text }]}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.muted, { color: colors.muted }]}>{children}</Text>;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'decimal-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoCorrect={false}
        style={[styles.input, { color: colors.text, backgroundColor: colors.input, borderColor: colors.line }]}
      />
    </View>
  );
}

export function Button({
  label,
  onPress,
  disabled,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'ghost' | 'danger';
}) {
  const { colors } = useTheme();
  const background = tone === 'primary' ? colors.forest : tone === 'danger' ? colors.coralSoft : 'transparent';
  const color = tone === 'primary' ? colors.onForest : tone === 'danger' ? colors.coral : colors.forest;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, { backgroundColor: background, borderColor: tone === 'ghost' ? colors.line : background, opacity: disabled ? 0.6 : 1 }]}
    >
      {disabled && tone === 'primary' ? <ActivityIndicator color={colors.onForest} /> : <Text style={[styles.buttonText, { color }]}>{label}</Text>}
    </Pressable>
  );
}

export function Card({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>{children}</View>;
}

export function ErrorText({ children }: { children: string | null }) {
  const { colors } = useTheme();
  if (!children) return null;
  return <Text style={[styles.error, { color: colors.coral }]}>{children}</Text>;
}

export function SyncBadge({ status }: { status: SyncStatus }) {
  const { colors } = useTheme();
  const label = status === 'synced' ? 'Synced' : status === 'failed' ? 'Failed' : status === 'syncing' ? 'Syncing' : 'Pending';
  const background = status === 'synced' ? colors.forest : status === 'failed' ? colors.coral : colors.honey;
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function BrandLockup() {
  const { colors } = useTheme();
  return (
    <View style={styles.brand}>
      <Image source={photos.logo} style={styles.logo} />
      <Text style={[styles.brandName, { color: colors.forest }]}>PawPrint</Text>
    </View>
  );
}

export function PhotoBanner({
  source,
  title,
  text,
  height = 250,
}: {
  source: ImageSourcePropType;
  title: string;
  text?: string;
  height?: number;
}) {
  return (
    <View style={[styles.banner, { height }]}>
      <Image source={source} style={styles.bannerImage} />
      <View style={styles.bannerShade} />
      <View style={styles.bannerCopy}>
        <Text style={styles.bannerTitle}>{title}</Text>
        {text ? <Text style={styles.bannerText}>{text}</Text> : null}
      </View>
    </View>
  );
}

export function FaceRow() {
  const faces = [photos.portrait, photos.catPeek, photos.corgi, photos.kitten];
  return (
    <View style={styles.faces}>
      {faces.map((face, index) => (
        <Image key={index} source={face} style={[styles.face, { marginLeft: index === 0 ? 0 : -12 }]} />
      ))}
    </View>
  );
}

export function EmptyPhoto({ source, text }: { source: ImageSourcePropType; text: string }) {
  return (
    <View style={styles.empty}>
      <Image source={source} style={styles.emptyPhoto} />
      <Muted>{text}</Muted>
    </View>
  );
}

export function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.choices}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.choice, { borderColor: selected ? colors.forest : colors.line, backgroundColor: selected ? colors.forest : colors.card }]}
          >
            <Text style={{ color: selected ? colors.onForest : colors.text, fontWeight: '600' }}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.4 },
  muted: { fontSize: 15, lineHeight: 22 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  button: { borderRadius: 999, minHeight: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1, paddingHorizontal: 16 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  card: { borderRadius: 28, borderWidth: 1, padding: 16, gap: 6 },
  error: { fontSize: 14, lineHeight: 20 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#1F6B53' },
  brandName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  banner: { borderRadius: 32, overflow: 'hidden', justifyContent: 'flex-end' },
  bannerImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  bannerShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20, 80, 61, 0.38)' },
  bannerCopy: { padding: 20, gap: 6 },
  bannerTitle: { color: '#fff', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  bannerText: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 21 },
  faces: { flexDirection: 'row', alignItems: 'center' },
  face: { width: 46, height: 46, borderRadius: 23, borderWidth: 3, borderColor: '#F6F5EF' },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  emptyPhoto: { width: 132, height: 132, borderRadius: 40 },
});
