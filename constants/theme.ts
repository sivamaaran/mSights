export const Colors = {
  // Primary brand colors - aviation dark blue
  primary: '#0A1628',
  primaryDark: '#060F1A',
  primaryLight: '#142238',
  accent: '#1E88E5',
  accentLight: '#42A5F5',

  // Status colors
  success: '#2E7D32',
  successLight: '#4CAF50',
  warning: '#F57F17',
  warningLight: '#FFA726',
  danger: '#C62828',
  dangerLight: '#EF5350',
  info: '#0277BD',
  infoLight: '#29B6F6',

  // Neutral
  white: '#FFFFFF',
  background: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceDark: '#E8EDF2',
  border: '#CBD5E1',
  borderLight: '#E2E8F0',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnDark: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  // Hangar status
  statusAvailable: '#2E7D32',
  statusOccupied: '#C62828',
  statusReserved: '#F57F17',
  statusMaintenance: '#6A1B9A',

  // Priority colors
  priorityLow: '#2E7D32',
  priorityMedium: '#F57F17',
  priorityHigh: '#C62828',
  priorityCritical: '#4A148C',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  h4: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodySmall: { fontSize: 12, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '500' as const },
};
