import { Platform, TextStyle } from 'react-native';

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
};

export const fonts = {
  display: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif-condensed',
    default: 'system-ui',
  })!,
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui',
  })!,
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  })!,
};

type T = TextStyle;

export const type: Record<string, T> = {
  hero: {
    fontFamily: fonts.display,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 42,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '500',
  },
  bodyStrong: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '700',
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '500',
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  monoLg: {
    fontFamily: fonts.mono,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
  },
};

export const shadow = {
  neon: {
    shadowColor: '#C6FF00',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};
