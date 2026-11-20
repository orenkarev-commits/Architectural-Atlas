// Design tokens transcribed from the handoff README's "Design tokens" section.
// The original design authors colours in oklch(); React Native has no oklch
// support, so we use the hex equivalents the README itself supplies.

import { Appearance } from 'react-native';

/**
 * Light / dark. The scheme is read once at launch from the phone's setting
 * (Settings → Display → Dark). Every StyleSheet in the app reads `colors`
 * at module load, so switching the phone's theme applies on the next launch.
 */
export const scheme: 'light' | 'dark' = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
export const isDark = scheme === 'dark';

const light = {
  terracotta: '#C2531F',
  terracottaDark: '#A34115',
  terracottaTextOnTint: '#9E4A22',
  terracottaTint: 'rgba(194, 83, 31, 0.14)',
  ink: '#2E2620',
  inkSoft: '#332B24',
  body: '#4A403A',
  muted: '#6B5E55',
  mutedLight: '#776A60',
  label: '#7D6B5E',
  hairline: '#E8E2DA',
  surfaceTint: '#F7F3EE',
  darkSurface: '#4B4038',
  desk: '#E8E6E1',
  mapTile: '#F0EBE4',
  mint: '#2C5F4E',
  /** Literal white: text and icons on terracotta / photos. Same in both themes. */
  white: '#FFFFFF',
  /** Page and sheet background (was colors.white). */
  surface: '#FFFFFF',
  /** Collapsible-section bubble. */
  bubble: '#F5EFE7',
  /** Floating buttons and cards over the map. */
  chrome: 'rgba(255, 255, 255, 0.94)',
  /** Warm translucent wash (splash, field sheet). */
  warmScrim: 'rgba(251, 244, 234, 0.7)',
  /** Compass dial face and its ink. */
  dial: '#FBF8F4',
  dialInk: 'rgba(43,40,38,',
  neutralBadge: 'rgba(46, 38, 32, 0.06)', // year badge, ~oklch(94%) on white
  glassFill: 'rgba(255, 255, 255, 0.68)',
  glassFillStrong: 'rgba(255, 255, 255, 0.82)',
  glassBorder: 'rgba(255, 255, 255, 0.88)',
};

// Warm charcoal, same terracotta family; text contrast ≥ 4.5:1 on `surface`.
const dark: typeof light = {
  terracotta: '#D9652F',
  terracottaDark: '#B8521F',
  terracottaTextOnTint: '#F0A47E',
  terracottaTint: 'rgba(224, 112, 60, 0.18)',
  ink: '#F4ECE4',
  inkSoft: '#EAE0D6',
  body: '#D8CCC2',
  muted: '#B0A196',
  mutedLight: '#A39488',
  label: '#AE9E92',
  hairline: '#3E3530',
  surfaceTint: '#2C2521',
  darkSurface: '#4B4038',
  desk: '#141110',
  mapTile: '#191412',
  mint: '#3F8A70',
  white: '#FFFFFF',
  surface: '#211B18',
  bubble: '#2C2521',
  chrome: 'rgba(40, 33, 29, 0.94)',
  warmScrim: 'rgba(25, 20, 18, 0.7)',
  dial: '#2A2320',
  dialInk: 'rgba(244,236,228,',
  neutralBadge: 'rgba(244, 236, 228, 0.08)',
  glassFill: 'rgba(40, 33, 29, 0.68)',
  glassFillStrong: 'rgba(40, 33, 29, 0.82)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
};

export const colors = isDark ? dark : light;

export const gradient = {
  // linear-gradient(160deg, oklch(96% 0.022 70) 0%, oklch(88% 0.062 42) 100%)
  colors: (isDark ? ['#1E1815', '#3A2419'] : ['#FBF4EA', '#F0C9A8']) as readonly [string, string],
  angleDeg: 160,
};

/**
 * Living red-orange "sunset" gradient for the welcome screen — three states the
 * background drifts slowly between (matches the splash + the London Atlas landing).
 * Cream/white content reads on all three.
 */
export const gradientDrift: ReadonlyArray<readonly [string, string]> = [
  ['#F0893B', '#B4241A'],
  ['#EF6B3C', '#9E1C12'],
  ['#F6A24A', '#C23A1A'],
];

export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  base: 10,
  lg: 14,
  xl: 18,
  xxl: 22,
  xxxl: 26,
  huge: 34,
} as const;

export const radii = {
  xs: 9,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  sheet: 28,
  phone: 44,
  circle: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: 'rgba(90, 50, 20, 1)',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  circle: {
    shadowColor: 'rgba(120, 60, 20, 1)',
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  chip: {
    shadowColor: 'rgba(90, 50, 20, 1)',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  mapCircle: {
    shadowColor: 'rgba(90, 50, 20, 1)',
    shadowOpacity: 0.14,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;

export const motion = {
  transitionMs: 150,
  lift: -2,
  liftLarge: -3,
  scaleSmall: 1.05,
} as const;
