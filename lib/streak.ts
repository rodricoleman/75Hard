import { differenceInCalendarDays, parseISO } from 'date-fns';

// Given a list of completion dates (ISO yyyy-MM-dd) for a daily habit,
// return current consecutive streak ending today (or yesterday if not done today).
export function dailyStreak(datesISO: string[], todayISO: string): number {
  if (datesISO.length === 0) return 0;
  const set = new Set(datesISO);
  const today = parseISO(todayISO);
  let cursor = today;
  // If today not done, count from yesterday
  if (!set.has(todayISO)) cursor = new Date(today.getTime() - 86400000);
  let streak = 0;
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (set.has(iso)) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 86400000);
    } else break;
  }
  return streak;
}

export function isCompletedToday(datesISO: string[], todayISO: string): boolean {
  return datesISO.includes(todayISO);
}

export function daysSinceLast(datesISO: string[], todayISO: string): number | null {
  if (datesISO.length === 0) return null;
  const max = datesISO.reduce((a, b) => (a > b ? a : b));
  return differenceInCalendarDays(parseISO(todayISO), parseISO(max));
}
