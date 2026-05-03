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
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';
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

  const balanceSeries = (() => {
    const sorted = [...wallet].sort((a, b) => a.created_at.localeCompare(b.created_at));
    let bal = 0;
    return sorted.map((e) => {
      bal += e.delta_coin;
      return bal;
    });
  })();

  const recent = wallet.slice(0, 30);
  const sparkW = Math.max(240, Math.min(width - 80, 460));

  return (
    <Screen>
      <Text style={styles.h1}>Stats ✦</Text>

      <View style={[styles.heroCard, softShadowSm]}>
        <View style={styles.heroDecor} />
        <Text style={styles.label}>NÍVEL & XP</Text>
        <XPBar xp={profile?.xp ?? 0} level={profile?.level ?? 1} />
        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.label}>SALDO</Text>
          <CoinBadge amount={profile?.coin_balance ?? 0} size="lg" />
          {balanceSeries.length >= 2 && (
            <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
              <Sparkline values={balanceSeries} width={sparkW} height={70} />
              <Text style={styles.sparkCaption}>saldo ao longo do tempo ✿</Text>
            </View>
          )}
        </View>
      </View>

      <Button
        label="Review semanal"
        icon="✦"
        variant="subtle"
        onPress={() => router.push('/review' as any)}
        style={{ marginTop: spacing.md }}
      />

      <Text style={styles.section}>Últimos 30 dias</Text>
      <View style={styles.row}>
        <StatTile label="GANHO" value={`+${totalEarned30}`} accent={colors.coin} emoji="✿" />
        <StatTile label="PERDIDO" value={`-${totalLost30}`} accent={colors.danger} emoji="⚠" />
      </View>
      <View style={[styles.row, { marginTop: spacing.sm + 2 }]}>
        <StatTile label="GASTO" value={`-${totalSpent30}`} accent={colors.accent} emoji="♡" />
        <StatTile label="STREAK" value={`${bestStreak}d`} accent={colors.warn} emoji="🔥" />
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
                        pct === 1
                          ? colors.accent
                          : pct >= 0.5
                          ? colors.primary
                          : pct > 0
                          ? colors.warn
                          : colors.surfaceMuted,
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
          <Text style={{ color: colors.textMuted, fontSize: font.size.sm, fontFamily: fontFamily.body as any }}>
            Sem hábitos ainda.
          </Text>
        </Card>
      ) : (
        <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
          {habits.map((h, i) => (
            <View
              key={h.id}
              style={[
                styles.streakRow,
                i < habits.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: h.color ?? colors.primary }]} />
              <Text style={styles.streakTitle}>
                {h.emoji ? `${h.emoji}  ` : ''}
                {h.title}
              </Text>
              <Text style={styles.streakNum}>🔥 {streakFor(h.id)}d</Text>
            </View>
          ))}
        </Card>
      )}

      <Text style={styles.section}>Histórico</Text>
      {recent.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textMuted, fontSize: font.size.sm, fontFamily: fontFamily.body as any }}>
            Sem movimentações.
          </Text>
        </Card>
      ) : (
        <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
          {recent.map((e, i) => (
            <View
              key={e.id}
              style={[
                styles.txnRow,
                i < recent.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
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
  h1: {
    color: colors.text,
    fontSize: font.size.title,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -1,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  heroDecor: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.xpSoft,
    opacity: 0.5,
  },
  label: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.xs + 2,
    fontFamily: fontFamily.body as any,
  },
  section: {
    color: colors.text,
    fontSize: font.size.lg,
    fontWeight: '700',
    marginTop: spacing.xl,
    marginBottom: spacing.sm + 2,
    fontFamily: fontFamily.display as any,
    letterSpacing: -0.2,
  },
  row: { flexDirection: 'row', gap: spacing.sm + 2 },
  heatRow: { flexDirection: 'row', justifyContent: 'space-between' },
  heatCol: { alignItems: 'center', gap: 6, flex: 1 },
  heatCell: {
    width: '70%',
    aspectRatio: 1,
    borderRadius: radius.md,
  },
  heatLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fontFamily.body as any,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.md,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  streakTitle: {
    color: colors.text,
    fontSize: font.size.md,
    flex: 1,
    fontFamily: fontFamily.body as any,
  },
  streakNum: {
    color: '#9A6300',
    fontWeight: '700',
    fontSize: font.size.md,
    fontFamily: fontFamily.body as any,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  txnReason: {
    color: colors.text,
    fontSize: font.size.sm,
    fontWeight: '500',
    fontFamily: fontFamily.body as any,
  },
  txnDate: {
    color: colors.textDim,
    fontSize: font.size.xs,
    marginTop: 2,
    fontFamily: fontFamily.body as any,
  },
  xpDelta: { fontSize: font.size.xs, fontWeight: '700', fontFamily: fontFamily.body as any },
  sparkCaption: {
    color: colors.textDim,
    fontSize: font.size.xs,
    marginTop: 4,
    fontFamily: fontFamily.body as any,
  },
});
