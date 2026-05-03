import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing, softShadowSm } from '@/theme/tokens';

export function Card({
  children,
  style,
  variant = 'default',
  padded = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'alt' | 'soft' | 'flat';
  padded?: boolean;
}) {
  const bg =
    variant === 'alt'
      ? colors.surfaceAlt
      : variant === 'soft'
      ? colors.surfaceMuted
      : colors.surface;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: bg },
        variant !== 'flat' && softShadowSm,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  padded: {
    padding: spacing.lg,
  },
});
