import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { todayISO } from '@/lib/dates';
import { dailyStreak, isCompletedToday } from '@/lib/streak';
import { streakMultiplier } from '@/lib/economy';
import type { Habit, HabitCompletion } from '@/types';
import { useProfile } from './useProfile';
import { useToast } from './useToast';
import { useWallet } from './useWallet';
import { scheduleStreakRisk } from '@/lib/notifications';

interface HabitsState {
  habits: Habit[];
  completions: HabitCompletion[]; // recent (last 60d)
  loading: boolean;
  fetch: () => Promise<void>;
  create: (h: Partial<Habit>) => Promise<Habit | null>;
  update: (id: string, patch: Partial<Habit>) => Promise<void>;
  archive: (id: string) => Promise<void>;
  toggleToday: (habitId: string) => Promise<void>;

  // selectors
  doneTodayMap: () => Record<string, boolean>;
  streakFor: (habitId: string) => number;
  completionsFor: (habitId: string) => HabitCompletion[];
}

export const useHabits = create<HabitsState>((set, get) => ({
  habits: [],
  completions: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const since = new Date();
    since.setDate(since.getDate() - 60);
    const sinceISO = since.toISOString().slice(0, 10);

    const [hRes, cRes] = await Promise.all([
      supabase
        .from('habit')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true }),
      supabase
        .from('habit_completion')
        .select('*')
        .gte('date', sinceISO)
        .order('date', { ascending: false }),
    ]);

    if (hRes.error) console.warn('[habits] fetch error', hRes.error.message);
    if (cRes.error) console.warn('[completions] fetch error', cRes.error.message);

    set({
      habits: (hRes.data as Habit[]) ?? [],
      completions: (cRes.data as HabitCompletion[]) ?? [],
      loading: false,
    });

    // Re-schedule streak-risk notifications for active streaks not done today
    try {
      const today = todayISO();
      const doneToday = new Set(
        ((cRes.data as HabitCompletion[]) ?? []).filter((c) => c.date === today).map((c) => c.habit_id),
      );
      const atRisk = ((hRes.data as Habit[]) ?? [])
        .filter((h) => h.type === 'daily' && !doneToday.has(h.id))
        .filter((h) => {
          const dates = ((cRes.data as HabitCompletion[]) ?? [])
            .filter((c) => c.habit_id === h.id)
            .map((c) => c.date);
          return dailyStreak(dates, today) > 0;
        })
        .map((h) => h.title);
      scheduleStreakRisk(atRisk).catch(() => {});
    } catch {}
  },

  create: async (h) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase
      .from('habit')
      .insert({ ...h, user_id: u.user.id })
      .select()
      .single();
    if (error) {
      console.warn('[habit] create error', error.message);
      return null;
    }
    set({ habits: [...get().habits, data as Habit] });
    return data as Habit;
  },

  update: async (id, patch) => {
    const { data, error } = await supabase
      .from('habit')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.warn('[habit] update error', error.message);
      return;
    }
    set({
      habits: get().habits.map((h) => (h.id === id ? (data as Habit) : h)),
    });
  },

  archive: async (id) => {
    const { error } = await supabase
      .from('habit')
      .update({ active: false, archived_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.warn('[habit] archive error', error.message);
      return;
    }
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },

  toggleToday: async (habitId) => {
    const today = todayISO();
    const existing = get().completions.find((c) => c.habit_id === habitId && c.date === today);

    if (existing) {
      const { error } = await supabase.rpc('uncomplete_habit', {
        p_habit_id: habitId,
        p_date: today,
      });
      if (error) {
        console.warn('[habit] uncomplete error', error.message);
        return;
      }
      set({ completions: get().completions.filter((c) => c.id !== existing.id) });
    } else {
      const dates = get()
        .completions.filter((c) => c.habit_id === habitId)
        .map((c) => c.date);
      const currentStreak = dailyStreak(dates, today);
      const newStreak = currentStreak + 1;
      const mult = streakMultiplier(newStreak);

      const { data, error } = await supabase.rpc('complete_habit', {
        p_habit_id: habitId,
        p_date: today,
        p_streak: newStreak,
        p_multiplier: mult,
      });
      if (error) {
        console.warn('[habit] complete error', error.message);
        return;
      }
      if (data) {
        const c = data as HabitCompletion;
        set({ completions: [c, ...get().completions] });
        const habit = get().habits.find((h) => h.id === habitId);
        useToast.getState().show({
          variant: 'earn',
          title: habit ? `${habit.emoji ?? '✓'}  ${habit.title}` : 'Hábito feito',
          subtitle: newStreak > 1 ? `Streak ${newStreak} dias 🔥` : 'Mandou bem',
          coin: c.coin_earned,
          xp: c.xp_earned,
        });
      }
    }

    const beforeLevel = useProfile.getState().profile?.level ?? 1;
    await useProfile.getState().fetch();
    await useWallet.getState().fetch();
    const afterLevel = useProfile.getState().profile?.level ?? 1;
    if (afterLevel > beforeLevel) {
      useToast.getState().show({
        variant: 'level',
        title: `Subiu pro nível ${afterLevel}! 🚀`,
        subtitle: 'Continue assim.',
      });
    }
  },

  doneTodayMap: () => {
    const today = todayISO();
    const map: Record<string, boolean> = {};
    for (const c of get().completions) if (c.date === today) map[c.habit_id] = true;
    return map;
  },

  streakFor: (habitId) => {
    const dates = get()
      .completions.filter((c) => c.habit_id === habitId)
      .map((c) => c.date);
    return dailyStreak(dates, todayISO());
  },

  completionsFor: (habitId) => get().completions.filter((c) => c.habit_id === habitId),
}));

export { isCompletedToday };
