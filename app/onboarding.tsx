import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useProfile } from '@/store/useProfile';
import { useHabits } from '@/store/useHabits';
import { useAntiHabits } from '@/store/useAntiHabits';
import { useRewards } from '@/store/useRewards';
import { SEED_HABITS, SEED_ANTI, SEED_REWARDS } from '@/lib/seedPacks';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';

export default function Onboarding() {
  const router = useRouter();
  const updateProfile = useProfile((s) => s.update);
  const createHabit = useHabits((s) => s.create);
  const createAnti = useAntiHabits((s) => s.create);
  const createReward = useRewards((s) => s.create);

  const [habitsOn, setHabitsOn] = useState<boolean[]>(SEED_HABITS.map(() => true));
  const [antiOn, setAntiOn] = useState<boolean[]>(SEED_ANTI.map(() => true));
  const [rewardsOn, setRewardsOn] = useState<boolean[]>(SEED_REWARDS.map(() => true));
  const [busy, setBusy] = useState(false);

  const toggle = (arr: boolean[], setArr: (b: boolean[]) => void, i: number) => {
    const next = [...arr];
    next[i] = !next[i];
    setArr(next);
  };

  const finish = async (withSeeds: boolean) => {
    setBusy(true);
    if (withSeeds) {
      await Promise.all([
        ...SEED_HABITS.filter((_, i) => habitsOn[i]).map((h) => createHabit(h)),
        ...SEED_ANTI.filter((_, i) => antiOn[i]).map((a) => createAnti(a)),
        ...SEED_REWARDS.filter((_, i) => rewardsOn[i]).map((r) => createReward(r)),
      ]);
    }
    await updateProfile({ first_run_at: new Date().toISOString() } as any);
    setBusy(false);
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <View style={styles.heroBubble}>
        <Text style={styles.heroEmoji}>✿</Text>
        <View style={[styles.dot, { top: 10, left: 22, backgroundColor: colors.coin }]} />
        <View style={[styles.dot, { top: 30, left: 50, backgroundColor: colors.accent, width: 5, height: 5 }]} />
        <View style={[styles.dot, { top: 16, left: 76, backgroundColor: colors.xp, width: 4, height: 4 }]} />
      </View>

      <Text style={styles.h1}>Bem-vindo ♡</Text>
      <Text style={styles.sub}>
        Comece com um pacote pronto. Você ajusta tudo depois.
      </Text>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.section}>✿ HÁBITOS</Text>
        {SEED_HABITS.map((h, i) => (
          <SeedRow
            key={i}
            on={habitsOn[i]}
            onToggle={() => toggle(habitsOn, setHabitsOn, i)}
            label={`${h.emoji}  ${h.title}`}
            tint={h.color ?? colors.primary}
          />
        ))}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.section}>⚠ ANTI-HÁBITOS</Text>
        {SEED_ANTI.map((a, i) => (
          <SeedRow
            key={i}
            on={antiOn[i]}
            onToggle={() => toggle(antiOn, setAntiOn, i)}
            label={`${a.emoji}  ${a.title}`}
            tint={colors.danger}
          />
        ))}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.section}>♡ RECOMPENSAS</Text>
        {SEED_REWARDS.map((r, i) => (
          <SeedRow
            key={i}
            on={rewardsOn[i]}
            onToggle={() => toggle(rewardsOn, setRewardsOn, i)}
            label={`${r.emoji}  ${r.title}`}
            tint={colors.coin}
            extra={`${r.coin_cost} coin`}
          />
        ))}
      </Card>

      <Button
        label="Começar com isso ✿"
        onPress={() => finish(true)}
        loading={busy}
        style={{ marginTop: spacing.xl }}
      />
      <Button
        label="Começar do zero"
        onPress={() => finish(false)}
        variant="ghost"
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}

function SeedRow({
  on,
  onToggle,
  label,
  tint,
  extra,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  tint: string;
  extra?: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[
        rowStyles.row,
        { backgroundColor: on ? `${tint}1A` : 'transparent' },
      ]}
    >
      <View
        style={[
          rowStyles.box,
          on
            ? { backgroundColor: tint, borderColor: tint }
            : { borderColor: colors.border },
        ]}
      >
        {on && <Text style={rowStyles.boxMark}>✓</Text>}
      </View>
      <Text style={rowStyles.label}>{label}</Text>
      {extra && <Text style={rowStyles.extra}>{extra}</Text>}
    </Pressable>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.md,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxMark: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  label: {
    color: colors.text,
    fontSize: font.size.md,
    flex: 1,
    fontFamily: fontFamily.body as any,
  },
  extra: {
    color: colors.textMuted,
    fontSize: font.size.xs,
    fontFamily: fontFamily.body as any,
  },
});

const styles = StyleSheet.create({
  heroBubble: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    position: 'relative',
    ...(softShadowSm as any),
  },
  heroEmoji: { fontSize: 50, color: colors.primaryDark },
  dot: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  h1: {
    color: colors.text,
    fontSize: font.size.title,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -1,
    marginTop: spacing.lg,
  },
  sub: {
    color: colors.textMuted,
    fontSize: font.size.md,
    marginTop: spacing.xs + 2,
    lineHeight: 22,
    fontFamily: fontFamily.body as any,
  },
  section: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    fontFamily: fontFamily.body as any,
  },
});
