import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, radius, spacing } from '@/theme/tokens';
import { CoinBadge } from './CoinBadge';
import type { AntiHabit, AntiHabitLog } from '@/types';
import { useRouter } from 'expo-router';
import * as haptic from '@/lib/haptics';

export function AntiHabitRow({
  antiHabit,
  todayCount,
  lastLog,
  onLog,
  onUndo,
}: {
  antiHabit: AntiHabit;
  todayCount: number;
  lastLog: AntiHabitLog | null;
  onLog: () => void;
  onUndo: () => void;
}) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>{antiHabit.emoji ?? '⚠'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{antiHabit.title}</Text>
        <Text style={styles.meta}>
          {todayCount > 0 ? `Hoje: ${todayCount}x` : 'Toque "slip" se cair (perde coin)'}
        </Text>
      </View>
      <CoinBadge amount={-antiHabit.coin_penalty} size="sm" sign />
      {lastLog ? (
        <Pressable
          onPress={() => {
            haptic.tapLight();
            onUndo();
          }}
          hitSlop={6}
          style={[styles.btn, { borderColor: colors.success }]}
        >
          <Text style={[styles.btnTxt, { color: colors.success }]}>↺</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => {
            haptic.warn();
            onLog();
          }}
          hitSlop={6}
          style={[styles.btn, { borderColor: colors.danger }]}
        >
          <Text style={[styles.btnTxt, { color: colors.danger }]}>slip</Text>
        </Pressable>
      )}
      <Pressable
        onPress={() => router.push(`/anti/${antiHabit.id}` as any)}
        hitSlop={8}
        style={styles.edit}
      >
        <Text style={styles.editTxt}>✎</Text>
      </Pressable>
    </View>
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 18 },
  title: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.semibold },
  meta: { color: colors.textMuted, fontSize: font.size.xs, marginTop: 2 },
  btn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  btnTxt: { fontWeight: '700', fontSize: font.size.xs },
  edit: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
  editTxt: { color: colors.textDim, fontSize: 18 },
});
