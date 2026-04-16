import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { Challenge, ChallengeGoals, DailyEntry } from '@/types/challenge';
import { DEFAULT_GOALS, TASK_LIMITS } from '@/types/challenge';

export const todayISO = () => format(new Date(), 'yyyy-MM-dd');

export function getCurrentDay(challenge: Challenge, now = new Date()): number {
  const diff = differenceInCalendarDays(now, parseISO(challenge.started_at));
  return Math.min(Math.max(diff + 1, 1), TASK_LIMITS.TOTAL_DAYS);
}

export function goalsFromChallenge(c: Challenge | null | undefined): ChallengeGoals {
  if (!c) return DEFAULT_GOALS;
  return {
    workout_indoor_min: c.workout_indoor_min ?? DEFAULT_GOALS.workout_indoor_min,
    workout_outdoor_min: c.workout_outdoor_min ?? DEFAULT_GOALS.workout_outdoor_min,
    water_ml_goal: c.water_ml_goal ?? DEFAULT_GOALS.water_ml_goal,
    reading_pages_goal: c.reading_pages_goal ?? DEFAULT_GOALS.reading_pages_goal,
    diet_enabled: c.diet_enabled ?? DEFAULT_GOALS.diet_enabled,
    max_misses: c.max_misses ?? DEFAULT_GOALS.max_misses,
  };
}

export function isEntryComplete(e: Partial<DailyEntry>, goals: ChallengeGoals): boolean {
  return Boolean(
    e.workout_indoor &&
      e.workout_outdoor &&
      (!goals.diet_enabled || e.diet) &&
      (e.water_ml ?? 0) >= goals.water_ml_goal &&
      (e.reading_pages ?? 0) >= goals.reading_pages_goal &&
      e.progress_photo_url,
  );
}

export function hasFailedBefore(
  challenge: Challenge,
  entries: DailyEntry[],
  now = new Date(),
): { failed: boolean; failedDay: number | null; missesUsed: number } {
  const today = getCurrentDay(challenge, now);
  const byDay = new Map(entries.map((e) => [e.day_number, e]));
  const allowance = challenge.max_misses ?? 0;
  let misses = 0;
  for (let d = 1; d < today; d++) {
    const entry = byDay.get(d);
    if (!entry || !entry.completed) {
      misses++;
      if (misses > allowance) {
        return { failed: true, failedDay: d, missesUsed: misses };
      }
    }
  }
  return { failed: false, failedDay: null, missesUsed: misses };
}

export function computeDayProgress(
  e: Partial<DailyEntry> | null,
  goals: ChallengeGoals,
): number {
  if (!e) return 0;
  const parts: number[] = [
    e.workout_indoor ? 1 : 0,
    e.workout_outdoor ? 1 : 0,
    Math.min((e.water_ml ?? 0) / Math.max(1, goals.water_ml_goal), 1),
    Math.min((e.reading_pages ?? 0) / Math.max(1, goals.reading_pages_goal), 1),
    e.progress_photo_url ? 1 : 0,
  ];
  if (goals.diet_enabled) parts.push(e.diet ? 1 : 0);
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

export function countTasksDone(e: Partial<DailyEntry> | null, goals: ChallengeGoals): {
  done: number;
  total: number;
} {
  const total = goals.diet_enabled ? 6 : 5;
  if (!e) return { done: 0, total };
  let done = 0;
  if (e.workout_indoor) done++;
  if (e.workout_outdoor) done++;
  if (goals.diet_enabled && e.diet) done++;
  if ((e.water_ml ?? 0) >= goals.water_ml_goal) done++;
  if ((e.reading_pages ?? 0) >= goals.reading_pages_goal) done++;
  if (e.progress_photo_url) done++;
  return { done, total };
}
