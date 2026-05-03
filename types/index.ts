export type HabitType = 'daily' | 'weekly' | 'once';
export type HabitDifficulty = 'easy' | 'medium' | 'hard' | 'brutal';
export type RewardType = 'consumable' | 'oneoff' | 'big';

export interface Profile {
  id: string;
  display_name: string | null;
  coin_balance: number;
  xp: number;
  level: number;
  daily_reminder_hour: number | null;
  first_run_at: string | null;
  sound_enabled: boolean;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  type: HabitType;
  difficulty: HabitDifficulty;
  coin_reward: number;
  xp_reward: number;
  weekly_target: number | null;
  reminder_hour: number | null;
  category: string | null;
  color: string | null;
  brutal: boolean;
  active: boolean;
  archived_at: string | null;
  created_at: string;
}

export interface Mission {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  week_start: string;
  target_count: number;
  bonus_coin: number;
  bonus_xp: number;
  claimed_at: string | null;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  coin_earned: number;
  xp_earned: number;
  streak_at_time: number;
  note: string | null;
  created_at: string;
}

export interface AntiHabit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  coin_penalty: number;
  active: boolean;
  archived_at: string | null;
  created_at: string;
}

export interface AntiHabitLog {
  id: string;
  anti_habit_id: string;
  user_id: string;
  date: string;
  count: number;
  coin_lost: number;
  note: string | null;
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  type: RewardType;
  coin_cost: number;
  real_price_brl: number | null;
  stock: number | null;
  active: boolean;
  created_at: string;
}

export interface Redemption {
  id: string;
  reward_id: string;
  user_id: string;
  coin_spent: number;
  real_price_brl: number | null;
  redeemed_at: string;
  note: string | null;
}

export interface WalletEntry {
  id: string;
  user_id: string;
  delta_coin: number;
  delta_xp: number;
  reason: string;
  ref_table: string | null;
  ref_id: string | null;
  created_at: string;
}
