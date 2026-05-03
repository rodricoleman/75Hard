import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { CoinBadge } from './CoinBadge';
import { colors } from '@/theme/colors';
import { font, radius, spacing } from '@/theme/tokens';
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
    <Card variant="alt">
      <View style={styles.header}>
        <Text style={styles.emoji}>{mission.emoji ?? '🎯'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>MISSÃO DA SEMANA</Text>
          <Text style={styles.title}>{mission.title}</Text>
          {mission.description && <Text style={styles.desc}>{mission.description}</Text>}
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressTxt}>
          {progress} / {mission.target_count}
        </Text>
        <CoinBadge amount={mission.bonus_coin} size="sm" />
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${pct * 100}%`,
              backgroundColor: claimed ? colors.textDim : done ? colors.success : colors.primary,
            },
          ]}
        />
      </View>

      {claimed ? (
        <Text style={styles.claimedTxt}>✓ Bônus resgatado</Text>
      ) : done ? (
        <Button
          label={`Resgatar bônus (+${mission.bonus_coin} coin · +${mission.bonus_xp} XP)`}
          onPress={onClaim}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', marginBottom: spacing.md },
  emoji: { fontSize: 28 },
  label: { color: colors.textDim, fontSize: 10, letterSpacing: 1.4, fontWeight: '700' },
  title: { color: colors.text, fontSize: font.size.lg, fontWeight: '700', marginTop: 2 },
  desc: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 2 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  progressTxt: { color: colors.text, fontWeight: '700', fontSize: font.size.md },
  track: { height: 8, backgroundColor: colors.surface, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  claimedTxt: { color: colors.success, fontWeight: '700', marginTop: spacing.md, textAlign: 'center' },
});
