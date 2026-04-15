import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useChallenge } from '@/store/useChallenge';
import { computeDayProgress } from '@/lib/streak';
import { TASK_GOALS } from '@/types/challenge';
import { colors } from '@/theme/colors';

function countDone(e: any): number {
  if (!e) return 0;
  let n = 0;
  if (e.workout_indoor) n++;
  if (e.workout_outdoor) n++;
  if (e.diet) n++;
  if ((e.water_ml ?? 0) >= TASK_GOALS.WATER_ML) n++;
  if ((e.reading_pages ?? 0) >= TASK_GOALS.READING_PAGES) n++;
  if (e.progress_photo_url) n++;
  return n;
}

export function TodayBanner() {
  const router = useRouter();
  const challenge = useChallenge((s) => s.challenge);
  const todayEntry = useChallenge((s) => s.todayEntry);
  const currentDay = useChallenge((s) => s.currentDay);
  const loading = useChallenge((s) => s.loading);

  if (loading || !challenge) return null;

  const progress = computeDayProgress(todayEntry);
  const done = countDone(todayEntry);
  const complete = done === 6;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push('/(tabs)')}
      style={[styles.card, complete && styles.cardComplete]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, complete && { color: colors.success }]}>
            {complete ? 'COMPLETOU HOJE ✓' : `DIA ${currentDay}/${TASK_GOALS.TOTAL_DAYS} · ${done}/6 HOJE`}
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.round(progress * 100)}%` },
                complete && { backgroundColor: colors.success },
              ]}
            />
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardComplete: {
    borderColor: colors.success,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: {
    color: colors.neon,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  barTrack: {
    marginTop: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.neon,
  },
  chevron: { color: colors.textMuted, fontSize: 28, fontWeight: '300' },
});
