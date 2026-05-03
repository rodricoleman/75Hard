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
import { font, radius, spacing } from '@/theme/tokens';

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
      <Text style={styles.h1}>Bem-vindo</Text>
      <Text style={styles.sub}>
        Comece com um pacote pronto. Você ajusta tudo depois.
      </Text>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.section}>HÁBITOS</Text>
        {SEED_HABITS.map((h, i) => (
          <Pressable
            key={i}
            onPress={() => toggle(habitsOn, setHabitsOn, i)}
            style={[
              styles.row,
              { backgroundColor: habitsOn[i] ? colors.surfaceAlt : 'transparent' },
            ]}
          >
            <View
              style={[
                styles.box,
                { backgroundColor: habitsOn[i] ? colors.success : 'transparent' },
              ]}
            >
              {habitsOn[i] && <Text style={styles.boxMark}>✓</Text>}
            </View>
            <Text style={styles.itemTitle}>
              {h.emoji}  {h.title}
            </Text>
          </Pressable>
        ))}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.section}>ANTI-HÁBITOS</Text>
        {SEED_ANTI.map((a, i) => (
          <Pressable
            key={i}
            onPress={() => toggle(antiOn, setAntiOn, i)}
            style={[
              styles.row,
              { backgroundColor: antiOn[i] ? colors.surfaceAlt : 'transparent' },
            ]}
          >
            <View
              style={[
                styles.box,
                { backgroundColor: antiOn[i] ? colors.danger : 'transparent' },
              ]}
            >
              {antiOn[i] && <Text style={styles.boxMark}>✓</Text>}
            </View>
            <Text style={styles.itemTitle}>
              {a.emoji}  {a.title}
            </Text>
          </Pressable>
        ))}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.section}>RECOMPENSAS</Text>
        {SEED_REWARDS.map((r, i) => (
          <Pressable
            key={i}
            onPress={() => toggle(rewardsOn, setRewardsOn, i)}
            style={[
              styles.row,
              { backgroundColor: rewardsOn[i] ? colors.surfaceAlt : 'transparent' },
            ]}
          >
            <View
              style={[
                styles.box,
                { backgroundColor: rewardsOn[i] ? colors.coin : 'transparent' },
              ]}
            >
              {rewardsOn[i] && <Text style={styles.boxMark}>✓</Text>}
            </View>
            <Text style={styles.itemTitle}>
              {r.emoji}  {r.title}  ·  {r.coin_cost} coin
            </Text>
          </Pressable>
        ))}
      </Card>

      <Button
        label="Começar com isso"
        onPress={() => finish(true)}
        loading={busy}
        style={{ marginTop: spacing.lg }}
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

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: font.size.title, fontWeight: '900', letterSpacing: -1, marginTop: spacing.lg },
  sub: { color: colors.textMuted, fontSize: font.size.md, marginTop: spacing.xs, lineHeight: 22 },
  section: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxMark: { color: '#0B0D10', fontWeight: '900', fontSize: 14 },
  itemTitle: { color: colors.text, fontSize: font.size.md, flex: 1 },
});
