import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, radius, spacing } from '@/theme/tokens';
import { levelProgress } from '@/lib/economy';

export function XPBar({ xp, level }: { xp: number; level: number }) {
  const { into, span, pct } = levelProgress(xp, level);
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.lvl}>NÍVEL {level}</Text>
        <Text style={styles.xp}>
          {into} / {span} XP
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  lvl: { color: colors.xp, fontWeight: font.weight.bold, fontSize: font.size.sm, letterSpacing: 1 },
  xp: { color: colors.textMuted, fontSize: font.size.xs },
  track: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.xp, borderRadius: radius.pill },
});
