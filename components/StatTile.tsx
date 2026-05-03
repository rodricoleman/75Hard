import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';

export function StatTile({
  label,
  value,
  accent,
  emoji,
}: {
  label: string;
  value: string | number;
  accent?: string;
  emoji?: string;
}) {
  return (
    <View style={styles.tile}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accent ?? colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    ...(softShadowSm as any),
  },
  emoji: { fontSize: 18, marginBottom: spacing.xs },
  label: {
    color: colors.textMuted,
    fontSize: font.size.xs,
    letterSpacing: 0.5,
    fontWeight: '600',
    fontFamily: fontFamily.body as any,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: font.size.xl,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -0.3,
  },
});
