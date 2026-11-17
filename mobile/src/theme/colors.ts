export type ThemePreference = 'light' | 'dark' | 'system';

export const palette = {
  forest: '#1F6B53',
  deep: '#14503D',
  sage: '#6FA58C',
  softSage: '#DDEBE2',
  cream: '#F6F5EF',
  offwhite: '#FCFCF8',
  line: '#E3EAE4',
  ink: '#1C2B29',
  secondary: '#5A6B67',
  honey: '#F2B84B',
  honeySoft: '#FCEFD3',
  coral: '#F0705A',
  coralSoft: '#FDE6E0',
  white: '#FFFFFF',
  darkbg: '#0C1C17',
  darkcard: '#173329',
  darkborder: '#244739',
  warmSage: '#A9CDB9',
} as const;

export type ThemeColors = {
  bg: string;
  card: string;
  text: string;
  muted: string;
  line: string;
  forest: string;
  onForest: string;
  honey: string;
  honeySoft: string;
  coral: string;
  coralSoft: string;
  input: string;
};

export const lightColors: ThemeColors = {
  bg: palette.cream,
  card: palette.offwhite,
  text: palette.ink,
  muted: palette.secondary,
  line: palette.line,
  forest: palette.forest,
  onForest: palette.white,
  honey: palette.honey,
  honeySoft: palette.honeySoft,
  coral: palette.coral,
  coralSoft: palette.coralSoft,
  input: palette.white,
};

export const darkColors: ThemeColors = {
  bg: palette.darkbg,
  card: palette.darkcard,
  text: '#F4F7F5',
  muted: palette.warmSage,
  line: palette.darkborder,
  forest: '#3D9B78',
  onForest: palette.white,
  honey: palette.honey,
  honeySoft: '#3A3118',
  coral: palette.coral,
  coralSoft: '#3A221C',
  input: '#12281F',
};
