import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { StatTile } from '@/components/StatTile';
import { CoinBadge } from '@/components/CoinBadge';
import { XPBar } from '@/components/XPBar';
import { Button } from '@/components/Button';
import { Sparkline } from '@/components/Sparkline';
import { useProfile } from '@/store/useProfile';
import { useHabits } from '@/store/useHabits';
import { useAntiHabits } from '@/store/useAntiHabits';
import { useRewards } from '@/store/useRewards';
import { useWallet } from '@/store/useWallet';
import { colors } from '@/theme/colors';
import { font, radius, spacing } from '@/theme/tokens';
import { lastNDays, prettyDate } from '@/lib/dates';
import { format, parseISO } from 'date-fns';

export default function Stats() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const profile = useProfile((s) => s.profile);
  const habits = useHabits((s) => s.habits);
  const completions = useHabits((s) => s.completions);
  const streakFor = useHabits((s) => s.streakFor);
  const antiLogs = useAntiHabits((s) => s.logs);
  const redemptions = useRewards((s) => s.redemptions);
  const wallet = useWallet((s) => s.entries);

  const days30 = lastNDays(30);
  const totalEarned30 = completions
    .filter((c) => days30.includes(c.date))
    .reduce((s, c) => s + c.coin_earned, 0);
  const totalLost30 = antiLogs
    .filter((l) => days30.includes(l.date))
    .reduce((s, l) => s + l.coin_lost, 0);
  const totalSpent30 = redemptions
    .filter((r) => days30.includes(r.redeemed_at.slice(0, 10)))
    .reduce((s, r) => s + r.coin_spent, 0);

  const last7 = lastNDays(7);
  const dailyHabits = habits.filter((h) => h.type === 'daily');
  const heatmap = last7.map((d) => {
    const done = completions.filter((c) => c.date === d).length;
    return { date: d, done, total: dailyHabits.length };
  });

  const bestStreak = habits.reduce((best, h) => Math.max(best, streakFor(h.id)), 0);

  // Running balance from wallet entries (chronological)
  const balanceSeries = (() => {
    const sorted = [...wallet].sort((a, b) => a.created_at.localeCompare(b.created_at));
    let bal = 0;
    return sorted.map((e) => {
      bal += e.delta_coin;
      return bal;
    });
  })();

  const recent = wallet.slice(0, 30);
  const sparkW = Math.max(240, Math.min(width - 80, 480));

  return (
    <Screen>
      <Text style={styles.h1}>Stats</Text>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.label}>NÍVEL & XP</Text>
        <XPBar xp={profile?.xp ?? 0} level={profile?.level ?? 1} />
        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.label}>SALDO</Text>
          <CoinBadge amount={profile?.coin_balance ?? 0} size="lg" />
          {balanceSeries.length >= 2 && (
            <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
              <Sparkline values={balanceSeries} width={sparkW} height={70} />
              <Text style={styles.sparkCaption}>Saldo ao longo do tempo</Text>
            </View>
          )}
        </View>
      </Card>

      <Button
        label="Review semanal"
        variant="subtle"
        onPress={() => router.push('/review' as any)}
        style={{ marginTop: spacing.md }}
      />

      <Text style={styles.section}>Últimos 30 dias</Text>
      <View style={styles.row}>
        <StatTile label="GANHO" value={`+${totalEarned30}`} accent={colors.coin} />
        <StatTile label="PERDIDO" value={`-${totalLost30}`} accent={colors.danger} />
      </View>
      <View style={[styles.row, { marginTop: spacing.sm }]}>
        <StatTile label="GASTO" value={`-${totalSpent30}`} accent={colors.accent} />
        <StatTile label="MELHOR STREAK" value={`${bestStreak}d`} accent={colors.warn} />
      </View>

      <Text style={styles.section}>Última semana</Text>
      <Card>
        <View style={styles.heatRow}>
          {heatmap.map((d) => {
            const pct = d.total > 0 ? d.done / d.total : 0;
            return (
              <View key={d.date} style={styles.heatCol}>
                <View
                  style={[
                    styles.heatCell,
                    {
                      backgroundColor:
                        pct === 1 ? colors.success : pct >= 0.5 ? colors.primary : pct > 0 ? colors.warn : colors.surfaceAlt,
                    },
                  ]}
                />
                <Text style={styles.heatLabel}>{prettyDate(d.date)}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Text style={styles.section}>Streaks por hábito</Text>
      {habits.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textMuted, fontSize: font.size.sm }}>Sem hábitos ainda.</Text>
        </Card>
      ) : (
        habits.map((h) => (
          <View key={h.id} style={styles.streakRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: h.color ?? colors.border },
              ]}
            />
            <Text style={styles.streakTitle}>
              {h.emoji ? `${h.emoji}  ` : ''}
              {h.title}
            </Text>
            <Text style={styles.streakNum}>🔥 {streakFor(h.id)}d</Text>
          </View>
        ))
      )}

      <Text style={styles.section}>Histórico (últimas 30 transações)</Text>
      {recent.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textMuted, fontSize: font.size.sm }}>Sem movimentações.</Text>
        </Card>
      ) : (
        <Card>
          {recent.map((e, i) => (
            <View
              key={e.id}
              style={[
                styles.txnRow,
                i < recent.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.txnReason}>{e.reason}</Text>
                <Text style={styles.txnDate}>
                  {format(parseISO(e.created_at), 'dd/MM HH:mm')}
                </Text>
              </View>
              {e.delta_coin !== 0 && <CoinBadge amount={e.delta_coin} size="sm" sign />}
              {e.delta_xp !== 0 && (
                <Text style={[styles.xpDelta, { color: e.delta_xp > 0 ? colors.xp : colors.danger }]}>
                  {e.delta_xp > 0 ? '+' : ''}
                  {e.delta_xp} XP
                </Text>
              )}
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: font.size.title, fontWeight: '900', letterSpacing: -1 },
  label: { color: colors.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: spacing.xs },
  section: {
    color: colors.text,
    fontSize: font.size.lg,
    fontWeight: '700',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  heatRow: { flexDirection: 'row', justifyContent: 'space-between' },
  heatCol: { alignItems: 'center', gap: 4, flex: 1 },
  heatCell: { width: '70%', aspectRatio: 1, borderRadius: radius.sm },
  heatLabel: { color: colors.textDim, fontSize: 10 },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  streakTitle: { color: colors.text, fontSize: font.size.md, flex: 1 },
  streakNum: { color: colors.warn, fontWeight: '700', fontSize: font.size.md },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  txnReason: { color: colors.text, fontSize: font.size.sm, fontWeight: '500' },
  txnDate: { color: colors.textDim, fontSize: font.size.xs, marginTop: 2 },
  xpDelta: { fontSize: font.size.xs, fontWeight: '700' },
  sparkCaption: { color: colors.textDim, fontSize: font.size.xs, marginTop: 4 },
});
