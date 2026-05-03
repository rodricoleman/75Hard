import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { format, startOfWeek } from 'date-fns';
import type { Mission } from '@/types';
import { useProfile } from './useProfile';
import { useHabits } from './useHabits';

function thisWeekStart(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

interface MissionsState {
  missions: Mission[];
  loading: boolean;
  fetch: () => Promise<void>;
  ensureWeekly: () => Promise<void>;
  claim: (id: string) => Promise<{ error: string | null }>;
  current: () => Mission | null;
  progressFor: (m: Mission) => number;
}

export const useMissions = create<MissionsState>((set, get) => ({
  missions: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('mission')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(20);
    if (error) console.warn('[mission] fetch', error.message);
    set({ missions: (data as Mission[]) ?? [], loading: false });
  },

  ensureWeekly: async () => {
    const week = thisWeekStart();
    const existing = get().missions.find((m) => m.week_start === week);
    if (existing) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    // Default mission: hit 25 daily-habit completions this week.
    const { data, error } = await supabase
      .from('mission')
      .insert({
        user_id: u.user.id,
        title: 'Semana cheia',
        description: 'Cumpra 25 hábitos esta semana.',
        emoji: '🎯',
        week_start: week,
        target_count: 25,
        bonus_coin: 200,
        bonus_xp: 200,
      })
      .select()
      .single();
    if (error) {
      console.warn('[mission] ensureWeekly', error.message);
      return;
    }
    set({ missions: [data as Mission, ...get().missions] });
  },

  claim: async (id) => {
    const m = get().missions.find((x) => x.id === id);
    if (!m) return { error: 'not found' };
    const progress = get().progressFor(m);
    const { data, error } = await supabase.rpc('claim_mission', {
      p_mission_id: id,
      p_progress: progress,
    });
    if (error) return { error: error.message };
    set({
      missions: get().missions.map((x) => (x.id === id ? (data as Mission) : x)),
    });
    await useProfile.getState().fetch();
    return { error: null };
  },

  current: () => {
    const week = thisWeekStart();
    return get().missions.find((m) => m.week_start === week) ?? null;
  },

  progressFor: (m) => {
    // Count daily habit completions during the mission week
    const completions = useHabits.getState().completions;
    const start = m.week_start;
    const end = new Date(new Date(start).getTime() + 7 * 86400000)
      .toISOString()
      .slice(0, 10);
    return completions.filter((c) => c.date >= start && c.date < end).length;
  },
}));
