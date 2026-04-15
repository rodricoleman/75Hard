import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/store/useAuth';
import { useChallenge } from '@/store/useChallenge';
import { TASK_GOALS } from '@/types/challenge';
import { colors } from '@/theme/colors';

export default function Stats() {
  const { session } = useAuth();
  const { challenge, entries, currentDay, load } = useChallenge();

  useEffect(() => {
    if (session) load(session.user.id);
  }, [session, load]);

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

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>PROGRESSO</Text>

        <View style={styles.cardsRow}>
          <StatCard label="DIA ATUAL" value={`${currentDay}`} suffix={`/${TASK_GOALS.TOTAL_DAYS}`} />
          <StatCard label="COMPLETOS" value={`${completedDays}`} />
          <StatCard label="STREAK" value={`${streak}`} />
        </View>

        <Text style={styles.section}>HEATMAP</Text>
        <View style={styles.grid}>
          {Array.from({ length: TASK_GOALS.TOTAL_DAYS }).map((_, i) => {
            const day = i + 1;
            const e = byDay.get(day);
            const isToday = day === currentDay;
            const bg = e?.completed
              ? colors.neon
              : e
              ? colors.neonDim
              : colors.surfaceAlt;
            return (
              <View
                key={day}
                style={[
                  styles.cell,
                  { backgroundColor: bg },
                  isToday && { borderColor: colors.text, borderWidth: 2 },
                ]}
              >
                <Text style={[styles.cellText, e?.completed && { color: '#000' }]}>{day}</Text>
              </View>
            );
          })}
        </View>

        {challenge && (
          <Text style={styles.meta}>
            Iniciado em {challenge.started_at}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>
        {value}
        {suffix && <Text style={styles.cardSuffix}>{suffix}</Text>}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 40 },
  h1: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 20 },
  cardsRow: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  cardLabel: { color: colors.textMuted, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  cardValue: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 },
  cardSuffix: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  section: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 10,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  meta: { color: colors.textDim, fontSize: 12, marginTop: 18 },
});
