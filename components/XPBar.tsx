import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing } from '@/theme/tokens';
import { levelProgress } from '@/lib/economy';

export function XPBar({ xp, level }: { xp: number; level: number }) {
  const { into, span, pct } = levelProgress(xp, level);
  return (
    <View>
      <View style={styles.row}>
        <View style={styles.lvlPill}>
          <Text style={styles.lvlPillText}>♡ nível {level}</Text>
        </View>
        <Text style={styles.xp}>
          {into} / {span} XP
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        {pct > 0.05 && (
          <View style={[styles.sparkle, { left: `${Math.max(2, pct * 100 - 4)}%` }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lvlPill: {
    backgroundColor: colors.xpSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  lvlPillText: {
    color: '#5D4A87',
    fontWeight: '700',
    fontSize: font.size.xs,
    fontFamily: fontFamily.display as any,
    letterSpacing: 0.4,
  },
  xp: {
    color: colors.textMuted,
    fontSize: font.size.xs,
    fontFamily: fontFamily.body as any,
  },
  track: {
    height: 10,
    backgroundColor: colors.xpSoft,
    borderRadius: radius.pill,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.xp,
    borderRadius: radius.pill,
  },
  sparkle: {
    position: 'absolute',
    top: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
});
