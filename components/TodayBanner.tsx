import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useChallenge } from '@/store/useChallenge';
import { computeDayProgress } from '@/lib/streak';
import { TASK_GOALS } from '@/types/challenge';
import { colors } from '@/theme/colors';
import { type, fonts } from '@/theme/tokens';

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

  const shimmer = useSharedValue(-1);
  const barWidth = useSharedValue(0);

  const progress = computeDayProgress(todayEntry);
  const done = countDone(todayEntry);
  const complete = done === 6;

  useEffect(() => {
    barWidth.value = withTiming(progress, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  useEffect(() => {
    if (complete) return;
    shimmer.value = 0;
    shimmer.value = withRepeat(
      withDelay(800, withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) })),
      -1,
      false,
    );
  }, [complete]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * 200 }],
    opacity: 0.5 + (1 - Math.abs(shimmer.value)) * 0.3,
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }));

  if (loading || !challenge) return null;

  return (
    <Pressable
      onPress={() => router.push('/(tabs)')}
      style={[styles.card, complete && styles.cardComplete]}
    >
      <View style={styles.row}>
        <View style={styles.dayBadge}>
          <Text style={styles.dayBadgeLabel}>DIA</Text>
          <Text style={[styles.dayBadgeNum, complete && { color: colors.success }]}>
            {String(currentDay).padStart(2, '0')}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.topRow}>
            <Text style={[styles.eyebrow, complete && { color: colors.success }]}>
              {complete ? 'DIA COMPLETO' : 'HOJE'}
            </Text>
            <Text style={styles.count}>
              <Text
                style={[
                  styles.countBig,
                  complete && { color: colors.success },
                ]}
              >
                {done}
              </Text>
              <Text style={styles.countSmall}>/6</Text>
            </Text>
          </View>
          <View style={styles.barTrack}>
            <Animated.View
              style={[
                styles.barFill,
                barStyle,
                complete && { backgroundColor: colors.success },
              ]}
            />
            {!complete ? (
              <Animated.View style={[styles.shimmer, shimmerStyle]} pointerEvents="none" />
            ) : null}
          </View>
        </View>
        <Text style={[styles.chevron, complete && { color: colors.success }]}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardComplete: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dayBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeLabel: {
    ...type.eyebrow,
    color: colors.textDim,
    fontSize: 9,
    letterSpacing: 1.6,
  },
  dayBadgeNum: {
    fontFamily: fonts.mono,
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    ...type.eyebrow,
    color: colors.neon,
  },
  count: { flexDirection: 'row', alignItems: 'baseline' },
  countBig: {
    fontFamily: fonts.mono,
    color: colors.neon,
    fontSize: 18,
    fontWeight: '900',
  },
  countSmall: {
    fontFamily: fonts.mono,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  barTrack: {
    marginTop: 9,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.neon,
    borderRadius: 3,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 80,
    backgroundColor: colors.neonGlow,
  },
  chevron: { color: colors.textMuted, fontSize: 28, fontWeight: '300' },
});
