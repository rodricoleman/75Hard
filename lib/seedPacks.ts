import type { Habit, AntiHabit, Reward } from '@/types';

type HabitSeed = Omit<Habit, 'id' | 'user_id' | 'active' | 'archived_at' | 'created_at'>;
type AntiSeed = Omit<AntiHabit, 'id' | 'user_id' | 'active' | 'archived_at' | 'created_at'>;
type RewardSeed = Omit<Reward, 'id' | 'user_id' | 'active' | 'created_at'>;

export const SEED_HABITS: HabitSeed[] = [
  {
    title: 'Treinar', emoji: '💪', description: '30 min, qualquer modalidade.',
    type: 'daily', difficulty: 'hard', coin_reward: 20, xp_reward: 25,
    weekly_target: null, reminder_hour: null, category: 'health', color: '#5BE584', brutal: false,
  },
  {
    title: 'Ler 30 minutos', emoji: '📚', description: 'Livro físico ou Kindle.',
    type: 'daily', difficulty: 'medium', coin_reward: 10, xp_reward: 10,
    weekly_target: null, reminder_hour: null, category: 'mind', color: '#9B7BFF', brutal: false,
  },
  {
    title: 'Beber 2L de água', emoji: '💧', description: null,
    type: 'daily', difficulty: 'easy', coin_reward: 5, xp_reward: 5,
    weekly_target: null, reminder_hour: null, category: 'health', color: '#5BE584', brutal: false,
  },
  {
    title: 'Dormir antes da meia-noite', emoji: '🌙', description: null,
    type: 'daily', difficulty: 'medium', coin_reward: 10, xp_reward: 10,
    weekly_target: null, reminder_hour: null, category: 'health', color: '#5BE584', brutal: false,
  },
  {
    title: '90 min foco profundo', emoji: '🎯', description: 'Sem celular, sem aba aberta.',
    type: 'daily', difficulty: 'hard', coin_reward: 20, xp_reward: 25,
    weekly_target: null, reminder_hour: null, category: 'work', color: '#FFB347', brutal: false,
  },
];

export const SEED_ANTI: AntiSeed[] = [
  { title: 'Fast food / besteira', emoji: '🍔', description: null, coin_penalty: 25 },
  { title: 'Insta/TikTok > 30min', emoji: '📱', description: null, coin_penalty: 15 },
];

export const SEED_REWARDS: RewardSeed[] = [
  { title: 'Cafezinho especial', emoji: '☕', description: null, type: 'consumable', coin_cost: 30, real_price_brl: 12, stock: null },
  { title: 'Hambúrguer', emoji: '🍔', description: null, type: 'oneoff', coin_cost: 150, real_price_brl: 60, stock: null },
  { title: 'Jogo novo', emoji: '🎮', description: null, type: 'big', coin_cost: 1500, real_price_brl: 250, stock: null },
];
