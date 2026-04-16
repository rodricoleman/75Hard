export type Challenge = {
  id: string;
  user_id: string;
  started_at: string;
  failed_at: string | null;
  completed_at: string | null;
  workout_indoor_min: number;
  workout_outdoor_min: number;
  water_ml_goal: number;
  reading_pages_goal: number;
  diet_enabled: boolean;
  max_misses: number;
  onboarded_at: string | null;
};

export type ToleranceOption = {
  id: '100' | '90' | '80' | '70';
  percent: number;
  maxMisses: number;
  title: string;
  subtitle: string;
  description: string;
};

export const TOLERANCE_OPTIONS: ToleranceOption[] = [
  {
    id: '100',
    percent: 100,
    maxMisses: 0,
    title: 'MODO 75HARD',
    subtitle: 'zero faltas',
    description: 'Original. Falhou um dia? Volta ao Dia 1. Sem buffer, sem pena.',
  },
  {
    id: '90',
    percent: 90,
    maxMisses: 7,
    title: 'SÉRIO',
    subtitle: 'até 7 faltas em 75',
    description: 'Você tem 7 dias de tolerância. No 8º dia falho, o desafio reseta.',
  },
  {
    id: '80',
    percent: 80,
    maxMisses: 15,
    title: 'REALISTA',
    subtitle: 'até 15 faltas em 75',
    description: 'Buffer de 15 dias pra imprevistos. Agenda apertada, viagens, doença leve.',
  },
  {
    id: '70',
    percent: 70,
    maxMisses: 22,
    title: 'FLEXÍVEL',
    subtitle: 'até 22 faltas em 75',
    description: 'Foco em consistência, não perfeição. 22 dias podem falhar sem resetar.',
  },
];

export type DailyEntry = {
  id: string;
  challenge_id: string;
  day_number: number;
  entry_date: string;
  workout_indoor: boolean;
  workout_outdoor: boolean;
  diet: boolean;
  water_ml: number;
  reading_pages: number;
  progress_photo_url: string | null;
  completed: boolean;
  created_at: string;
};

export const TASK_LIMITS = {
  WORKOUT_MIN_MIN: 45,
  WORKOUT_MIN_MAX: 180,
  WATER_ML_MIN: 500,
  WATER_ML_MAX: 10000,
  READING_PAGES_MIN: 10,
  READING_PAGES_MAX: 200,
  TOTAL_DAYS: 75,
} as const;

export const DEFAULT_GOALS = {
  workout_indoor_min: 45,
  workout_outdoor_min: 45,
  water_ml_goal: 3700,
  reading_pages_goal: 10,
  diet_enabled: true,
  max_misses: 0,
} as const;

// Backwards-compat for any code still reading TASK_GOALS; prefer challenge fields.
export const TASK_GOALS = {
  WATER_ML: DEFAULT_GOALS.water_ml_goal,
  READING_PAGES: DEFAULT_GOALS.reading_pages_goal,
  TOTAL_DAYS: TASK_LIMITS.TOTAL_DAYS,
} as const;

export type ChallengeGoals = Pick<
  Challenge,
  | 'workout_indoor_min'
  | 'workout_outdoor_min'
  | 'water_ml_goal'
  | 'reading_pages_goal'
  | 'diet_enabled'
  | 'max_misses'
>;
