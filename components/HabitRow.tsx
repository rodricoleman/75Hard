import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';
import { CoinBadge } from './CoinBadge';
import type { Habit } from '@/types';
import { streakMultiplier } from '@/lib/economy';
import { useRouter } from 'expo-router';
import * as haptic from '@/lib/haptics';

export function HabitRow({
  habit,
  done,
  streak,
  onToggle,
}: {
  habit: Habit;
  done: boolean;
  streak: number;
  onToggle: () => void;
}) {
  const router = useRouter();
  const mult = streakMultiplier(done ? streak : streak + 1);
  const earn = Math.round(habit.coin_reward * mult);
  const accent = habit.color ?? colors.primary;

  return (
    <Pressable
      onLongPress={() => router.push(`/habit/${habit.id}` as any)}
      onPress={() => {
        haptic.tapMedium();
        onToggle();
      }}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: done ? `${accent}1A` : colors.surface,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
          borderColor: done ? accent : colors.borderSoft,
        },
        !done && softShadowSm,
      ]}
    >
      <View
        style={[
          styles.check,
          {
            backgroundColor: done ? accent : 'transparent',
            borderColor: done ? accent : colors.border,
          },
        ]}
      >
        {done ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.title,
            done && { color: colors.textMuted },
          ]}
        >
          {habit.emoji ? `${habit.emoji}  ` : ''}
          {habit.title}
        </Text>
        <View style={styles.meta}>
          {streak > 0 && (
            <View style={styles.streakPill}>
              <Text style={styles.streakTxt}>🔥 {streak}</Text>
            </View>
          )}
          {mult > 1 && !done && (
            <View style={[styles.multPill, { backgroundColor: colors.accentSoft }]}>
              <Text style={styles.multTxt}>×{mult}</Text>
            </View>
          )}
          {habit.brutal && (
            <View style={[styles.multPill, { backgroundColor: colors.dangerSoft }]}>
              <Text style={[styles.multTxt, { color: '#A24452' }]}>brutal</Text>
            </View>
          )}
        </View>
      </View>
      <CoinBadge amount={earn} size="sm" />
      <Pressable
        onPress={() => router.push(`/habit/${habit.id}` as any)}
        hitSlop={8}
        style={styles.edit}
      >
        <Text style={styles.editTxt}>✎</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: spacing.md,
    marginBottom: spacing.sm + 2,
  },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  title: {
    color: colors.text,
    fontSize: font.size.md,
    fontWeight: '600',
    fontFamily: fontFamily.body as any,
  },
  meta: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  streakPill: {
    backgroundColor: colors.warnSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  streakTxt: {
    color: '#9A6300',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fontFamily.body as any,
  },
  multPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  multTxt: {
    color: '#2E4A40',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fontFamily.body as any,
  },
  edit: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
  editTxt: { color: colors.textDim, fontSize: 16 },
});
