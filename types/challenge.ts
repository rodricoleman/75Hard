export type Challenge = {
  id: string;
  user_id: string;
  started_at: string;
  failed_at: string | null;
  completed_at: string | null;
};

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

export const TASK_GOALS = {
  WATER_ML: 3700,
  READING_PAGES: 10,
  TOTAL_DAYS: 75,
} as const;
