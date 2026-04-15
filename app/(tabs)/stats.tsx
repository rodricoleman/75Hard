import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useChallenge } from '@/store/useChallenge';
import { TASK_GOALS } from '@/types/challenge';
import { computeDayProgress } from '@/lib/streak';
import { colors } from '@/theme/colors';
import { type, fonts } from '@/theme/tokens';

export default function Stats() {
  const { challenge, entries, currentDay, load } = useChallenge();

  useEffect(() => {
    load();
  }, [load]);

  const byDay = useMemo(() => new Map(entries.map((e) => [e.day_number, e])), [entries]);

  const completedDays = useMemo(
    () => entries.filter((e) => e.completed).length,
    [entries],
  );

  const streak = useMemo(() => {
    let s = 0;
    for (let d = currentDay; d >= 1; d--) {
      const e = byDay.get(d);
      if (e?.completed) s++;
      else if (d !== currentDay) break;
    }
    return s;
  }, [byDay, currentDay]);

  const remaining = TASK_GOALS.TOTAL_DAYS - currentDay + 1;
  const pctDone = Math.round((completedDays / TASK_GOALS.TOTAL_DAYS) * 100);

  // Build 7-column grid (11 rows x 7 cols = 77 slots; use first 75)
  const weeks: Array<Array<number>> = [];
  for (let i = 0; i < TASK_GOALS.TOTAL_DAYS; i += 7) {
    weeks.push(
      Array.from({ length: 7 }, (_, k) => i + k + 1).filter(
        (d) => d <= TASK_GOALS.TOTAL_DAYS,
      ),
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(320)}>
          <Text style={styles.eyebrow}>BALANÇO</Text>
          <Text style={styles.h1}>PROGRESSO</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(400).delay(100)} style={styles.hero}>
          <View style={styles.heroMain}>
            <Text style={styles.heroBigLabel}>STREAK ATUAL</Text>
            <View style={styles.streakRow}>
              <Text style={styles.streakNum}>{streak}</Text>
              <Text style={styles.streakFlame}>🔥</Text>
            </View>
            <Text style={styles.heroSub}>
              {streak === 0 ? 'comece hoje' : streak === 1 ? '1 dia consecutivo' : `${streak} dias consecutivos`}
            </Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroSide}>
            <View style={styles.heroMini}>
              <Text style={styles.heroMiniLabel}>COMPLETOS</Text>
              <Text style={styles.heroMiniValue}>
                {completedDays}
                <Text style={styles.heroMiniSuffix}>/{TASK_GOALS.TOTAL_DAYS}</Text>
              </Text>
            </View>
            <View style={styles.heroMini}>
              <Text style={styles.heroMiniLabel}>RESTAM</Text>
              <Text style={styles.heroMiniValue}>{remaining}</Text>
            </View>
            <View style={styles.heroMini}>
              <Text style={styles.heroMiniLabel}>TAXA</Text>
              <Text style={styles.heroMiniValue}>
                {pctDone}
                <Text style={styles.heroMiniSuffix}>%</Text>
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>CALENDÁRIO · 75 DIAS</Text>
          <View style={styles.sectionLine} />
        </View>

        <Animated.View entering={FadeIn.duration(400).delay(180)}>
          <View style={styles.grid}>
            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                <Text style={styles.weekNum}>W{String(wi + 1).padStart(2, '0')}</Text>
                <View style={styles.weekCells}>
                  {week.map((day) => {
                    const e = byDay.get(day);
                    const isToday = day === currentDay;
                    const isFuture = day > currentDay;
                    const progress = e ? computeDayProgress(e as any) : 0;
                    return (
                      <View
                        key={day}
                        style={[
                          styles.cell,
                          isFuture && styles.cellFuture,
                          !isFuture && !e?.completed && styles.cellMiss,
                          !!e && !e.completed && progress > 0 && styles.cellPartial,
                          e?.completed && styles.cellDone,
                          isToday && styles.cellToday,
                        ]}
                      >
                        <Text
                          style={[
                            styles.cellText,
                            e?.completed && { color: '#000' },
                            isFuture && { color: colors.textDim },
                          ]}
                        >
                          {day}
                        </Text>
                      </View>
                    );
                  })}
                  {Array.from({ length: 7 - week.length }).map((_, i) => (
                    <View key={`fill-${i}`} style={[styles.cell, styles.cellFill]} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.legend}>
          <LegendDot color={colors.neon} label="completo" />
          <LegendDot color={colors.neonDim} label="parcial" />
          <LegendDot color={colors.dangerSoft} borderColor={colors.danger} label="falhou" />
          <LegendDot color={colors.surfaceAlt} label="futuro" />
        </View>

        {challenge && (
          <View style={styles.footerCard}>
            <Text style={styles.footerLabel}>INICIADO EM</Text>
            <Text style={styles.footerValue}>{challenge.started_at}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendDot({
  color,
  label,
  borderColor,
}: {
  color: string;
  label: string;
  borderColor?: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendSwatch,
          { backgroundColor: color },
          borderColor ? { borderColor, borderWidth: 1 } : null,
        ]}
      />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const CELL_SIZE = 32;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: {
    padding: 20,
    paddingBottom: 60,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  eyebrow: { ...type.eyebrow, color: colors.neon, marginBottom: 4 },
  h1: { ...type.h1, color: colors.text, fontSize: 34, marginBottom: 24 },

  hero: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 28,
  },
  heroMain: { marginBottom: 4 },
  heroBigLabel: { ...type.label, color: colors.textMuted },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  streakNum: {
    fontFamily: fonts.mono,
    color: colors.neon,
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -4,
    lineHeight: 74,
  },
  streakFlame: { fontSize: 36, marginBottom: 12 },
  heroSub: { ...type.caption, color: colors.textMuted, marginTop: -2 },
  heroDivider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  heroSide: { flexDirection: 'row', gap: 10 },
  heroMini: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroMiniLabel: {
    ...type.eyebrow,
    color: colors.textDim,
    fontSize: 9,
  },
  heroMiniValue: {
    fontFamily: fonts.mono,
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 4,
  },
  heroMiniSuffix: {
    fontFamily: fonts.mono,
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  section: { ...type.label, color: colors.textMuted },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.border },

  grid: { gap: 6 },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weekNum: {
    width: 34,
    fontFamily: fonts.mono,
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  weekCells: { flexDirection: 'row', gap: 6, flex: 1 },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  cellDone: { backgroundColor: colors.neon },
  cellPartial: { backgroundColor: colors.neonDim },
  cellMiss: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger },
  cellFuture: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cellFill: { opacity: 0 },
  cellToday: {
    borderColor: colors.text,
    borderWidth: 2,
  },
  cellText: {
    fontFamily: fonts.mono,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },

  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 18,
    paddingHorizontal: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: {
    ...type.caption,
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'lowercase',
  },
  footerCard: {
    marginTop: 28,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerLabel: { ...type.eyebrow, color: colors.textDim, fontSize: 9 },
  footerValue: {
    fontFamily: fonts.mono,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
});
