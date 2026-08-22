// Design tokens transcribed from the handoff README's "Design tokens" section.
// The original design authors colours in oklch(); React Native has no oklch
// support, so we use the hex equivalents the README itself supplies.

export const colors = {
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
  white: '#FFFFFF',
  neutralBadge: 'rgba(46, 38, 32, 0.06)', // year badge, ~oklch(94%) on white
  glassFill: 'rgba(255, 255, 255, 0.68)',
  glassFillStrong: 'rgba(255, 255, 255, 0.82)',
  glassBorder: 'rgba(255, 255, 255, 0.88)',
} as const;

export const gradient = {
  // linear-gradient(160deg, oklch(96% 0.022 70) 0%, oklch(88% 0.062 42) 100%)
  colors: ['#FBF4EA', '#F0C9A8'] as const,
  angleDeg: 160,
};

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
