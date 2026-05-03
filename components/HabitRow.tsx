import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, radius, spacing } from '@/theme/tokens';
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
          backgroundColor: done ? colors.surfaceAlt : colors.surface,
          opacity: pressed ? 0.85 : 1,
          borderColor: done ? colors.success : colors.border,
          borderLeftColor: habit.color ?? (done ? colors.success : colors.border),
          borderLeftWidth: 3,
        },
      ]}
    >
      <View
        style={[
          styles.check,
          {
            backgroundColor: done ? colors.success : 'transparent',
            borderColor: done ? colors.success : colors.border,
          },
        ]}
      >
        {done ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, done && { textDecorationLine: 'line-through', color: colors.textMuted }]}>
          {habit.emoji ? `${habit.emoji}  ` : ''}
          {habit.title}
        </Text>
        <View style={styles.meta}>
          {streak > 0 && (
            <Text style={styles.streak}>🔥 {streak}d</Text>
          )}
          {mult > 1 && !done && (
            <Text style={styles.mult}>x{mult}</Text>
          )}
          {habit.brutal && <Text style={styles.brutal}>BRUTAL</Text>}
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#0B0D10', fontWeight: '900', fontSize: 16 },
  title: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.semibold },
  meta: { flexDirection: 'row', gap: spacing.sm, marginTop: 2 },
  streak: { color: colors.warn, fontSize: font.size.xs, fontWeight: '600' },
  mult: { color: colors.accent, fontSize: font.size.xs, fontWeight: '700' },
  edit: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
  editTxt: { color: colors.textDim, fontSize: 18 },
  brutal: { color: colors.danger, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});
