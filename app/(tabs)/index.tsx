import React, { useEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProfile } from '@/store/useProfile';
import { useHabits } from '@/store/useHabits';
import { useAntiHabits } from '@/store/useAntiHabits';
import { useMissions } from '@/store/useMissions';
import { CoinBadge } from '@/components/CoinBadge';
import { XPBar } from '@/components/XPBar';
import { HabitRow } from '@/components/HabitRow';
import { AntiHabitRow } from '@/components/AntiHabitRow';
import { MissionCard } from '@/components/MissionCard';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MAX_W = 520;

export default function Today() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const horizontalPad = width > MAX_W ? Math.max(spacing.lg, (width - MAX_W) / 2) : spacing.lg;

  const profile = useProfile((s) => s.profile);
  const habits = useHabits((s) => s.habits);
  const doneTodayMap = useHabits((s) => s.doneTodayMap);
  const streakFor = useHabits((s) => s.streakFor);
  const toggle = useHabits((s) => s.toggleToday);
  const antiHabits = useAntiHabits((s) => s.antiHabits);
  const todayCountFor = useAntiHabits((s) => s.todayCountFor);
  const lastLogFor = useAntiHabits((s) => s.lastLogFor);
  const logAnti = useAntiHabits((s) => s.log);
  const unlogAnti = useAntiHabits((s) => s.unlog);
  const mission = useMissions((s) => s.current());
  const missionProgress = useMissions((s) => (mission ? s.progressFor(mission) : 0));
  const claimMission = useMissions((s) => s.claim);

  const [refreshing, setRefreshing] = React.useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([
      useProfile.getState().fetch(),
      useHabits.getState().fetch(),
      useAntiHabits.getState().fetch(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const doneMap = doneTodayMap();
  const dailyHabits = habits.filter((h) => h.type === 'daily');
  const weeklyHabits = habits.filter((h) => h.type === 'weekly');
  const onceHabits = habits.filter((h) => h.type === 'once');
  const doneCount = dailyHabits.filter((h) => doneMap[h.id]).length;
  const totalDaily = dailyHabits.length;
  const allDone = totalDaily > 0 && doneCount === totalDaily;

  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return 'Boa madrugada';
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  })();
  const firstName = profile?.display_name?.split(' ')[0] ?? '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPad }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greet}>
              {greeting}{firstName ? `, ${firstName}` : ''} ✿
            </Text>
            <Text style={styles.date}>{today}</Text>
          </View>
        </View>

        <Text style={styles.title}>
          {totalDaily > 0
            ? allDone
              ? 'Tudo feito hoje! ✦'
              : `${doneCount} de ${totalDaily} hoje`
            : 'Hora de começar ✿'}
        </Text>

        {/* Wallet hero */}
        <View style={[styles.walletCard, softShadowSm]}>
          <View style={styles.walletDecor1} />
          <View style={styles.walletDecor2} />
          <Text style={styles.walletLabel}>SALDO ✦</Text>
          <CoinBadge amount={profile?.coin_balance ?? 0} size="lg" />
          <View style={{ marginTop: spacing.lg }}>
            <XPBar xp={profile?.xp ?? 0} level={profile?.level ?? 1} />
          </View>
        </View>

        {mission && (
          <View style={{ marginTop: spacing.md }}>
            <MissionCard
              mission={mission}
              progress={missionProgress}
              onClaim={async () => {
                const { error } = await claimMission(mission.id);
                if (error) console.warn(error);
              }}
            />
          </View>
        )}

        {dailyHabits.length === 0 && weeklyHabits.length === 0 && onceHabits.length === 0 ? (
          <EmptyState
            emoji="🌱"
            title="Comece pelos hábitos"
            body="Cria seu primeiro hábito e ganha coin a cada check-in."
            actionLabel="Criar hábito"
            onAction={() => router.push('/habit/new' as any)}
          />
        ) : (
          <>
            {dailyHabits.length > 0 && (
              <>
                <SectionHeader title="Diários" emoji="☀" />
                {dailyHabits.map((h) => (
                  <HabitRow
                    key={h.id}
                    habit={h}
                    done={!!doneMap[h.id]}
                    streak={streakFor(h.id)}
                    onToggle={() => toggle(h.id)}
                  />
                ))}
              </>
            )}

            {weeklyHabits.length > 0 && (
              <>
                <SectionHeader title="Semanais" emoji="✦" />
                {weeklyHabits.map((h) => (
                  <HabitRow
                    key={h.id}
                    habit={h}
                    done={!!doneMap[h.id]}
                    streak={streakFor(h.id)}
                    onToggle={() => toggle(h.id)}
                  />
                ))}
              </>
            )}

            {onceHabits.length > 0 && (
              <>
                <SectionHeader title="Pontuais" emoji="✿" />
                {onceHabits.map((h) => (
                  <HabitRow
                    key={h.id}
                    habit={h}
                    done={!!doneMap[h.id]}
                    streak={streakFor(h.id)}
                    onToggle={() => toggle(h.id)}
                  />
                ))}
              </>
            )}
          </>
        )}

        {antiHabits.length > 0 && (
          <>
            <SectionHeader title="Anti-hábitos" emoji="⚠" />
            <Text style={styles.antiHint}>
              Toque slip se cair — perde coin. ↺ desfaz.
            </Text>
            {antiHabits.map((a) => {
              const last = lastLogFor(a.id);
              return (
                <AntiHabitRow
                  key={a.id}
                  antiHabit={a}
                  todayCount={todayCountFor(a.id)}
                  lastLog={last}
                  onLog={() => logAnti(a.id)}
                  onUndo={() => last && unlogAnti(last.id)}
                />
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl * 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  greet: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    fontFamily: fontFamily.body as any,
    letterSpacing: 0.2,
  },
  date: {
    color: colors.textDim,
    fontSize: font.size.xs,
    textTransform: 'capitalize',
    marginTop: 2,
    fontFamily: fontFamily.body as any,
  },
  title: {
    color: colors.text,
    fontSize: font.size.title,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -1,
    marginTop: spacing.xs + 2,
    marginBottom: spacing.lg,
  },
  walletCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
  },
  walletDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.coinSoft,
    opacity: 0.5,
  },
  walletDecor2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.xpSoft,
    opacity: 0.4,
  },
  walletLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '700',
    fontFamily: fontFamily.body as any,
    marginBottom: spacing.sm,
  },
  antiHint: {
    color: colors.textDim,
    fontSize: font.size.xs,
    marginBottom: spacing.sm,
    fontFamily: fontFamily.body as any,
  },
});
