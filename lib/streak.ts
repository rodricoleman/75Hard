import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { Challenge, DailyEntry } from '@/types/challenge';
import { TASK_GOALS } from '@/types/challenge';

export const todayISO = () => format(new Date(), 'yyyy-MM-dd');

export function getCurrentDay(challenge: Challenge, now = new Date()): number {
  const diff = differenceInCalendarDays(now, parseISO(challenge.started_at));
  return Math.min(Math.max(diff + 1, 1), TASK_GOALS.TOTAL_DAYS);
}

export function isEntryComplete(e: Partial<DailyEntry>): boolean {
  return Boolean(
    e.workout_indoor &&
      e.workout_outdoor &&
      e.diet &&
      (e.water_ml ?? 0) >= TASK_GOALS.WATER_ML &&
      (e.reading_pages ?? 0) >= TASK_GOALS.READING_PAGES &&
      e.progress_photo_url,
  );
}

export function hasFailedBefore(
  challenge: Challenge,
  entries: DailyEntry[],
  now = new Date(),
): { failed: boolean; failedDay: number | null } {
  const today = getCurrentDay(challenge, now);
  const byDay = new Map(entries.map((e) => [e.day_number, e]));
  for (let d = 1; d < today; d++) {
    const entry = byDay.get(d);
    if (!entry || !entry.completed) {
      return { failed: true, failedDay: d };
    }
  }
  return { failed: false, failedDay: null };
}

export function computeDayProgress(e: Partial<DailyEntry> | null): number {
  if (!e) return 0;
  const parts = [
    e.workout_indoor ? 1 : 0,
    e.workout_outdoor ? 1 : 0,
    e.diet ? 1 : 0,
    Math.min((e.water_ml ?? 0) / TASK_GOALS.WATER_ML, 1),
    Math.min((e.reading_pages ?? 0) / TASK_GOALS.READING_PAGES, 1),
    e.progress_photo_url ? 1 : 0,
  ];
  return parts.reduce((a, b) => a + b, 0) / 6;
}
