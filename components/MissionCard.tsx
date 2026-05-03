import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { CoinBadge } from './CoinBadge';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';
import type { Mission } from '@/types';

export function MissionCard({
  mission,
  progress,
  onClaim,
}: {
  mission: Mission;
  progress: number;
  onClaim: () => void;
}) {
  const pct = Math.min(1, progress / Math.max(1, mission.target_count));
  const done = progress >= mission.target_count;
  const claimed = !!mission.claimed_at;

  return (
    <View style={[styles.card, softShadowSm]}>
      {/* decorative confetti dots */}
      <View style={[styles.dot, { top: 12, right: 18, backgroundColor: colors.coin }]} />
      <View style={[styles.dot, { top: 30, right: 38, backgroundColor: colors.accent, width: 4, height: 4 }]} />
      <View style={[styles.dot, { top: 8, right: 56, backgroundColor: colors.xp, width: 5, height: 5 }]} />

      <View style={styles.header}>
        <View style={styles.emojiBubble}>
          <Text style={styles.emoji}>{mission.emoji ?? '🎯'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>missão da semana ✦</Text>
          <Text style={styles.title}>{mission.title}</Text>
          {mission.description && <Text style={styles.desc}>{mission.description}</Text>}
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressTxt}>
          {progress} <Text style={styles.progressDim}>/ {mission.target_count}</Text>
        </Text>
        <CoinBadge amount={mission.bonus_coin} size="sm" />
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${pct * 100}%`,
              backgroundColor: claimed ? colors.textDim : done ? colors.accent : colors.primary,
            },
          ]}
        />
      </View>

      {claimed ? (
        <View style={styles.claimedPill}>
          <Text style={styles.claimedTxt}>♡ bônus resgatado</Text>
        </View>
      ) : done ? (
        <Button
          variant="mint"
          label={`✦ Resgatar +${mission.bonus_coin} coin · +${mission.bonus_xp} XP`}
          onPress={onClaim}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FFD2BD',
    padding: spacing.lg,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  emojiBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 24 },
  label: {
    color: colors.primaryDark,
    fontSize: font.size.xs,
    fontWeight: '700',
    fontFamily: fontFamily.body as any,
    letterSpacing: 0.4,
  },
  title: {
    color: colors.text,
    fontSize: font.size.lg,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  desc: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    marginTop: 2,
    fontFamily: fontFamily.body as any,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  progressTxt: {
    color: colors.text,
    fontWeight: '700',
    fontSize: font.size.lg,
    fontFamily: fontFamily.display as any,
  },
  progressDim: { color: colors.textMuted, fontSize: font.size.sm, fontWeight: '500' },
  track: {
    height: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  claimedPill: {
    alignSelf: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  claimedTxt: {
    color: '#2E6F58',
    fontWeight: '700',
    fontSize: font.size.sm,
    fontFamily: fontFamily.body as any,
  },
});
