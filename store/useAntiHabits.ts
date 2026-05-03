import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { todayISO } from '@/lib/dates';
import type { AntiHabit, AntiHabitLog } from '@/types';
import { useProfile } from './useProfile';
import { useToast } from './useToast';
import { useWallet } from './useWallet';

interface AntiHabitsState {
  antiHabits: AntiHabit[];
  logs: AntiHabitLog[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (a: Partial<AntiHabit>) => Promise<AntiHabit | null>;
  update: (id: string, patch: Partial<AntiHabit>) => Promise<void>;
  archive: (id: string) => Promise<void>;
  log: (antiHabitId: string, count?: number, note?: string) => Promise<void>;
  unlog: (logId: string) => Promise<void>;
  todayCountFor: (antiHabitId: string) => number;
  lastLogFor: (antiHabitId: string) => AntiHabitLog | null;
}

export const useAntiHabits = create<AntiHabitsState>((set, get) => ({
  antiHabits: [],
  logs: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const since = new Date();
    since.setDate(since.getDate() - 60);
    const sinceISO = since.toISOString().slice(0, 10);

    const [aRes, lRes] = await Promise.all([
      supabase
        .from('anti_habit')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true }),
      supabase
        .from('anti_habit_log')
        .select('*')
        .gte('date', sinceISO)
        .order('date', { ascending: false }),
    ]);

    if (aRes.error) console.warn('[anti] fetch error', aRes.error.message);
    if (lRes.error) console.warn('[anti_log] fetch error', lRes.error.message);

    set({
      antiHabits: (aRes.data as AntiHabit[]) ?? [],
      logs: (lRes.data as AntiHabitLog[]) ?? [],
      loading: false,
    });
  },

  create: async (a) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase
      .from('anti_habit')
      .insert({ ...a, user_id: u.user.id })
      .select()
      .single();
    if (error) {
      console.warn('[anti] create error', error.message);
      return null;
    }
    set({ antiHabits: [...get().antiHabits, data as AntiHabit] });
    return data as AntiHabit;
  },

  update: async (id, patch) => {
    const { data, error } = await supabase
      .from('anti_habit')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.warn('[anti] update error', error.message);
      return;
    }
    set({ antiHabits: get().antiHabits.map((h) => (h.id === id ? (data as AntiHabit) : h)) });
  },

  archive: async (id) => {
    const { error } = await supabase
      .from('anti_habit')
      .update({ active: false, archived_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.warn('[anti] archive error', error.message);
      return;
    }
    set({ antiHabits: get().antiHabits.filter((h) => h.id !== id) });
  },

  log: async (antiHabitId, count = 1, note) => {
    const today = todayISO();
    const { data, error } = await supabase.rpc('log_anti_habit', {
      p_anti_habit_id: antiHabitId,
      p_date: today,
      p_count: count,
      p_note: note ?? null,
    });
    if (error) {
      console.warn('[anti] log error', error.message);
      return;
    }
    if (data) {
      const l = data as AntiHabitLog;
      set({ logs: [l, ...get().logs] });
      const ah = get().antiHabits.find((a) => a.id === antiHabitId);
      useToast.getState().show({
        variant: 'lose',
        title: ah ? `${ah.emoji ?? '⚠'}  ${ah.title}` : 'Slip registrado',
        subtitle: 'Toque pra desfazer',
        coin: -l.coin_lost,
      });
    }
    await useProfile.getState().fetch();
    await useWallet.getState().fetch();
  },

  unlog: async (logId: string) => {
    const { error } = await supabase.rpc('unlog_anti_habit', { p_log_id: logId });
    if (error) {
      console.warn('[anti] unlog', error.message);
      return;
    }
    set({ logs: get().logs.filter((l) => l.id !== logId) });
    await useProfile.getState().fetch();
    await useWallet.getState().fetch();
  },

  todayCountFor: (antiHabitId) => {
    const today = todayISO();
    return get()
      .logs.filter((l) => l.anti_habit_id === antiHabitId && l.date === today)
      .reduce((sum, l) => sum + l.count, 0);
  },

  lastLogFor: (antiHabitId) => {
    const today = todayISO();
    const todays = get().logs.filter((l) => l.anti_habit_id === antiHabitId && l.date === today);
    return todays.length > 0 ? todays[0] : null;
  },
}));
