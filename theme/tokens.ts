import { Platform } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  xxl: 40,
};

// Generous, friendly rounded corners — kawaii hallmark
export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 32,
  xxl: 40,
  pill: 999,
};

export const font = {
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 30,
    title: 36,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '800' as const,
  },
};

// Web uses Quicksand (body) + Fredoka (display) loaded via app/+html.tsx.
// Native falls back to system rounded fonts (SF Pro Rounded on iOS).
export const fontFamily = {
  body: Platform.select({
    web: 'Quicksand, -apple-system, BlinkMacSystemFont, "Segoe UI Variable", system-ui, sans-serif',
    ios: 'System',
    default: undefined,
  }),
  display: Platform.select({
    web: 'Fredoka, "SF Pro Rounded", -apple-system, system-ui, sans-serif',
    ios: 'System',
    default: undefined,
  }),
};

// Soft floating shadow used across cards / floating elements.
export const softShadow = Platform.select({
  web: { boxShadow: '0 4px 18px -8px rgba(232, 201, 176, 0.55)' } as any,
  default: {
    shadowColor: '#E8C9B0',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});

export const softShadowSm = Platform.select({
  web: { boxShadow: '0 2px 8px -4px rgba(232, 201, 176, 0.45)' } as any,
  default: {
    shadowColor: '#E8C9B0',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});
