import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';
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
    <View style={[styles.row, softShadowSm]}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>{antiHabit.emoji ?? '⚠'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{antiHabit.title}</Text>
        <Text style={styles.meta}>
          {todayCount > 0 ? `Hoje: ${todayCount}×` : 'Toque "slip" se cair'}
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
          style={[styles.btn, { backgroundColor: colors.successSoft }]}
        >
          <Text style={[styles.btnTxt, { color: '#3D7C4A' }]}>↺</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => {
            haptic.warn();
            onLog();
          }}
          hitSlop={6}
          style={[styles.btn, { backgroundColor: colors.dangerSoft }]}
        >
          <Text style={[styles.btnTxt, { color: '#A24452' }]}>slip</Text>
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
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    marginBottom: spacing.sm + 2,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 18 },
  title: {
    color: colors.text,
    fontSize: font.size.md,
    fontWeight: '600',
    fontFamily: fontFamily.body as any,
  },
  meta: {
    color: colors.textMuted,
    fontSize: font.size.xs,
    marginTop: 2,
    fontFamily: fontFamily.body as any,
  },
  btn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  btnTxt: {
    fontWeight: '700',
    fontSize: font.size.xs,
    fontFamily: fontFamily.body as any,
  },
  edit: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
  editTxt: { color: colors.textDim, fontSize: 16 },
});
