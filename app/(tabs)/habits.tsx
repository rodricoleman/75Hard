import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { CoinBadge } from '@/components/CoinBadge';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { useHabits } from '@/store/useHabits';
import { useAntiHabits } from '@/store/useAntiHabits';
import { colors } from '@/theme/colors';
import { font, radius, spacing } from '@/theme/tokens';

export default function Habits() {
  const router = useRouter();
  const habits = useHabits((s) => s.habits);
  const streakFor = useHabits((s) => s.streakFor);
  const antiHabits = useAntiHabits((s) => s.antiHabits);

  return (
    <Screen>
      <Text style={styles.h1}>Hábitos</Text>
      <Text style={styles.sub}>Toque longo num item da Hoje pra editar.</Text>

      <SectionHeader
        title="Hábitos positivos"
        actionLabel="+ novo"
        onAction={() => router.push('/habit/new' as any)}
      />
      {habits.length === 0 ? (
        <EmptyState
          emoji="✅"
          title="Sem hábitos"
          body="Adicione hábitos que você quer cumprir — diários, semanais ou pontuais."
          actionLabel="Criar hábito"
          onAction={() => router.push('/habit/new' as any)}
        />
      ) : (
        habits.map((h) => (
          <Pressable
            key={h.id}
            onPress={() => router.push(`/habit/${h.id}` as any)}
            style={({ pressed }) => [styles.row, { opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {h.emoji ? `${h.emoji}  ` : ''}
                {h.title}
              </Text>
              <Text style={styles.meta}>
                {h.type === 'daily' ? 'Diário' : h.type === 'weekly' ? `Semanal · ${h.weekly_target ?? '?'}x` : 'Pontual'}
                {' · '}
                {h.difficulty}
                {' · '}
                🔥 {streakFor(h.id)}d
              </Text>
            </View>
            <CoinBadge amount={h.coin_reward} size="sm" />
          </Pressable>
        ))
      )}

      <SectionHeader
        title="Anti-hábitos"
        actionLabel="+ novo"
        onAction={() => router.push('/anti/new' as any)}
      />
      {antiHabits.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            Nenhum anti-hábito. Adicione comportamentos que você quer evitar (perde coin quando registrar).
          </Text>
        </Card>
      ) : (
        antiHabits.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => router.push(`/anti/${a.id}` as any)}
            style={({ pressed }) => [styles.row, { opacity: pressed ? 0.85 : 1 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {a.emoji ? `${a.emoji}  ` : ''}
                {a.title}
              </Text>
              <Text style={styles.meta}>Penalidade por slip</Text>
            </View>
            <CoinBadge amount={-a.coin_penalty} size="sm" sign />
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: font.size.title, fontWeight: '900', letterSpacing: -1 },
  sub: { color: colors.textMuted, fontSize: font.size.sm, marginTop: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  title: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.semibold },
  meta: { color: colors.textMuted, fontSize: font.size.xs, marginTop: 2 },
  emptyText: { color: colors.textMuted, fontSize: font.size.sm },
});
