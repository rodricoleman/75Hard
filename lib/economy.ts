import type { HabitDifficulty } from '@/types';

// Suggested coin/xp by difficulty when creating a habit.
export const DIFFICULTY_DEFAULTS: Record<HabitDifficulty, { coin: number; xp: number }> = {
  easy: { coin: 5, xp: 5 },
  medium: { coin: 10, xp: 10 },
  hard: { coin: 20, xp: 25 },
  brutal: { coin: 40, xp: 60 },
};

// Streak multiplier — caps at 2x at 30 days
export function streakMultiplier(streak: number): number {
  if (streak <= 0) return 1;
  if (streak >= 30) return 2;
  if (streak >= 14) return 1.75;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.25;
  return 1;
}

// Inverse of level formula in SQL: level = 1 + floor(sqrt(xp / 50))
// XP needed to reach a given level
export function xpForLevel(level: number): number {
  const n = Math.max(1, level) - 1;
  return n * n * 50;
}

export function levelProgress(xp: number, level: number) {
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const span = Math.max(1, next - cur);
  const into = Math.max(0, xp - cur);
  return { cur, next, into, span, pct: Math.min(1, into / span) };
}

export function formatCoin(n: number): string {
  return new Intl.NumberFormat('pt-BR').format(n);
}

export function formatBRL(n: number | null | undefined): string {
  if (n == null) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}
