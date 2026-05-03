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
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';

export default function Habits() {
  const router = useRouter();
  const habits = useHabits((s) => s.habits);
  const streakFor = useHabits((s) => s.streakFor);
  const antiHabits = useAntiHabits((s) => s.antiHabits);

  return (
    <Screen>
      <Text style={styles.h1}>Hábitos</Text>
      <Text style={styles.sub}>Toque ✎ pra editar.</Text>

      <SectionHeader
        title="Hábitos positivos"
        emoji="✿"
        actionLabel="+ novo"
        onAction={() => router.push('/habit/new' as any)}
      />
      {habits.length === 0 ? (
        <EmptyState
          emoji="✅"
          title="Sem hábitos"
          body="Adiciona hábitos diários, semanais ou pontuais que você quer cumprir."
          actionLabel="Criar hábito"
          onAction={() => router.push('/habit/new' as any)}
        />
      ) : (
        habits.map((h) => (
          <Pressable
            key={h.id}
            onPress={() => router.push(`/habit/${h.id}` as any)}
            style={({ pressed }) => [
              styles.row,
              softShadowSm,
              { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
            ]}
          >
            <View
              style={[
                styles.colorDot,
                { backgroundColor: h.color ?? colors.primary },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {h.emoji ? `${h.emoji}  ` : ''}
                {h.title}
              </Text>
              <Text style={styles.meta}>
                {h.type === 'daily' ? 'diário' : h.type === 'weekly' ? `semanal · ${h.weekly_target ?? '?'}×` : 'pontual'}
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
        emoji="⚠"
        actionLabel="+ novo"
        onAction={() => router.push('/anti/new' as any)}
      />
      {antiHabits.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            Sem anti-hábitos. Adiciona o que você quer evitar (perde coin quando registrar).
          </Text>
        </Card>
      ) : (
        antiHabits.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => router.push(`/anti/${a.id}` as any)}
            style={({ pressed }) => [
              styles.row,
              softShadowSm,
              { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
            ]}
          >
            <View style={[styles.colorDot, { backgroundColor: colors.danger }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {a.emoji ? `${a.emoji}  ` : ''}
                {a.title}
              </Text>
              <Text style={styles.meta}>penalidade por slip</Text>
            </View>
            <CoinBadge amount={-a.coin_penalty} size="sm" sign />
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: {
    color: colors.text,
    fontSize: font.size.title,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -1,
  },
  sub: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    marginTop: spacing.xs,
    fontFamily: fontFamily.body as any,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.sm + 2,
    gap: spacing.md,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
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
  emptyText: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    fontFamily: fontFamily.body as any,
  },
});
