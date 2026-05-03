import React, { useEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
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
import { Card } from '@/components/Card';
import { colors } from '@/theme/colors';
import { font, spacing } from '@/theme/tokens';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Today() {
  const router = useRouter();
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

  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greet}>{today}</Text>
        <Text style={styles.title}>
          {totalDaily > 0
            ? `${doneCount}/${totalDaily} hoje`
            : 'Nenhum hábito ainda'}
        </Text>

        <Card style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.walletLabel}>SALDO</Text>
              <CoinBadge amount={profile?.coin_balance ?? 0} size="lg" />
            </View>
          </View>
          <View style={{ marginTop: spacing.lg }}>
            <XPBar xp={profile?.xp ?? 0} level={profile?.level ?? 1} />
          </View>
        </Card>

        {mission && (
          <View style={{ marginBottom: spacing.lg }}>
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
            body="Crie seu primeiro hábito e ganhe coin cada vez que cumprir."
            actionLabel="Criar hábito"
            onAction={() => router.push('/habit/new' as any)}
          />
        ) : (
          <>
            {dailyHabits.length > 0 && (
              <>
                <SectionHeader title="Diários" />
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
                <SectionHeader title="Semanais" />
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
                <SectionHeader title="Pontuais" />
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
            <SectionHeader title="Anti-hábitos" />
            <Text style={styles.antiHint}>
              Toque pra registrar uma slip — você perde coin.
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  greet: { color: colors.textMuted, fontSize: font.size.sm, textTransform: 'capitalize' },
  title: {
    color: colors.text,
    fontSize: font.size.title,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  walletCard: { marginBottom: spacing.lg },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  walletLabel: {
    color: colors.textDim,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  antiHint: { color: colors.textDim, fontSize: font.size.xs, marginBottom: spacing.sm },
});
