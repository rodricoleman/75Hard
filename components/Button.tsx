import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle' | 'mint';

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
}) {
  const palette = (() => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primary, fg: '#3D3633', border: colors.primary, shadow: true };
      case 'mint':
        return { bg: colors.accent, fg: '#2E4A40', border: colors.accent, shadow: true };
      case 'danger':
        return { bg: colors.danger, fg: '#5A2730', border: colors.danger, shadow: true };
      case 'subtle':
        return { bg: colors.surfaceAlt, fg: colors.text, border: colors.borderSoft, shadow: false };
      case 'ghost':
      default:
        return { bg: 'transparent', fg: colors.textMuted, border: colors.border, shadow: false };
    }
  })();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        palette.shadow && softShadowSm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <Text style={[styles.label, { color: palette.fg }]}>
          {icon ? `${icon}  ` : ''}
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 50,
  },
  label: {
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    fontFamily: fontFamily.body as any,
    letterSpacing: 0.2,
  },
});
