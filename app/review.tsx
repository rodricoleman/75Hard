import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { CoinBadge } from '@/components/CoinBadge';
import { useHabits } from '@/store/useHabits';
import { useAntiHabits } from '@/store/useAntiHabits';
import { useRewards } from '@/store/useRewards';
import { useProfile } from '@/store/useProfile';
import { colors } from '@/theme/colors';
import { font, fontFamily, spacing } from '@/theme/tokens';
import { currentWeekDates, prettyDate } from '@/lib/dates';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Review() {
  const profile = useProfile((s) => s.profile);
  const habits = useHabits((s) => s.habits);
  const completions = useHabits((s) => s.completions);
  const antiLogs = useAntiHabits((s) => s.logs);
  const redemptions = useRewards((s) => s.redemptions);

  const week = currentWeekDates();
  const startISO = week[0];
  const endISO = week[week.length - 1];

  const wkComps = completions.filter((c) => c.date >= startISO && c.date <= endISO);
  const wkAnti = antiLogs.filter((l) => l.date >= startISO && l.date <= endISO);
  const wkReds = redemptions.filter(
    (r) => r.redeemed_at.slice(0, 10) >= startISO && r.redeemed_at.slice(0, 10) <= endISO,
  );

  const earned = wkComps.reduce((s, c) => s + c.coin_earned, 0);
  const earnedXP = wkComps.reduce((s, c) => s + c.xp_earned, 0);
  const lost = wkAnti.reduce((s, l) => s + l.coin_lost, 0);
  const spent = wkReds.reduce((s, r) => s + r.coin_spent, 0);
  const net = earned - lost - spent;

  // Top hábito (mais cumprido)
  const habitCounts: Record<string, number> = {};
  for (const c of wkComps) habitCounts[c.habit_id] = (habitCounts[c.habit_id] ?? 0) + 1;
  const topHabitId = Object.entries(habitCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topHabit = habits.find((h) => h.id === topHabitId);

  // Hábito esquecido (menos cumprido entre os daily)
  const dailyHabits = habits.filter((h) => h.type === 'daily');
  const worstHabit = dailyHabits
    .map((h) => ({ h, count: habitCounts[h.id] ?? 0 }))
    .sort((a, b) => a.count - b.count)[0];

  // Anti mais frequente
  const antiCounts: Record<string, number> = {};
  for (const l of wkAnti) antiCounts[l.anti_habit_id] = (antiCounts[l.anti_habit_id] ?? 0) + l.count;
  const worstAntiId = Object.entries(antiCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <Screen>
      <Text style={styles.subtitle}>
        {format(new Date(startISO), "dd 'de' MMM", { locale: ptBR })} —{' '}
        {format(new Date(endISO), "dd 'de' MMM", { locale: ptBR })}
      </Text>
      <Text style={styles.h1}>Sua semana</Text>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.label}>SALDO LÍQUIDO DA SEMANA</Text>
        <CoinBadge amount={net} size="lg" sign />
        <View style={styles.breakdown}>
          <Text style={styles.brkLine}>
            <Text style={styles.brkPos}>+{earned}</Text> ganho ·{' '}
            <Text style={styles.brkNeg}>-{lost}</Text> perdido ·{' '}
            <Text style={styles.brkNeu}>-{spent}</Text> gasto
          </Text>
          <Text style={[styles.brkLine, { marginTop: 4 }]}>
            <Text style={{ color: colors.xp, fontWeight: '700' }}>+{earnedXP} XP</Text>
          </Text>
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.label}>NÚMEROS</Text>
        <Line k="Hábitos cumpridos" v={`${wkComps.length}`} />
        <Line k="Slips de anti-hábito" v={`${wkAnti.length}`} />
        <Line k="Recompensas resgatadas" v={`${wkReds.length}`} />
        <Line k="Saldo atual" v={`${profile?.coin_balance ?? 0} coin`} />
      </Card>

      {topHabit && (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.label}>🏆 TOP HÁBITO</Text>
          <Text style={styles.bigLine}>
            {topHabit.emoji ? `${topHabit.emoji}  ` : ''}
            {topHabit.title}
          </Text>
          <Text style={styles.bigSub}>{habitCounts[topHabit.id]} vezes essa semana</Text>
        </Card>
      )}

      {worstHabit && worstHabit.count < 3 && (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.label}>🥶 HÁBITO ESQUECIDO</Text>
          <Text style={styles.bigLine}>
            {worstHabit.h.emoji ? `${worstHabit.h.emoji}  ` : ''}
            {worstHabit.h.title}
          </Text>
          <Text style={styles.bigSub}>
            Só {worstHabit.count}x essa semana. Foco semana que vem.
          </Text>
        </Card>
      )}

      {worstAntiId && (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.label}>⚠ ANTI-HÁBITO MAIS FREQUENTE</Text>
          <Text style={styles.bigLine}>
            {(() => {
              const a = useAntiHabits.getState().antiHabits.find((x) => x.id === worstAntiId);
              return a ? `${a.emoji ? a.emoji + '  ' : ''}${a.title}` : '—';
            })()}
          </Text>
          <Text style={styles.bigSub}>{antiCounts[worstAntiId]}x. Custou {antiCounts[worstAntiId] * (useAntiHabits.getState().antiHabits.find((x) => x.id === worstAntiId)?.coin_penalty ?? 0)} coin.</Text>
        </Card>
      )}
    </Screen>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <View style={lineStyles.row}>
      <Text style={lineStyles.k}>{k}</Text>
      <Text style={lineStyles.v}>{v}</Text>
    </View>
  );
}

const lineStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  k: { color: colors.textMuted, fontSize: font.size.sm, fontFamily: fontFamily.body as any },
  v: { color: colors.text, fontSize: font.size.sm, fontWeight: '700', fontFamily: fontFamily.body as any },
});

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, fontSize: font.size.sm, marginTop: spacing.md, fontFamily: fontFamily.body as any },
  h1: {
    color: colors.text,
    fontSize: font.size.title,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -1,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    fontFamily: fontFamily.body as any,
  },
  breakdown: { marginTop: spacing.md },
  brkLine: { color: colors.textMuted, fontSize: font.size.sm, fontFamily: fontFamily.body as any },
  brkPos: { color: '#A87B14', fontWeight: '700' },
  brkNeg: { color: '#A24452', fontWeight: '700' },
  brkNeu: { color: '#2E6F58', fontWeight: '700' },
  bigLine: {
    color: colors.text,
    fontSize: font.size.lg,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -0.2,
  },
  bigSub: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    marginTop: 4,
    fontFamily: fontFamily.body as any,
  },
});
