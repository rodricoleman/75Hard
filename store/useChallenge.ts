import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Challenge, ChallengeGoals, DailyEntry } from '@/types/challenge';
import { getCurrentDay, goalsFromChallenge, hasFailedBefore, todayISO } from '@/lib/streak';
import { useAuth } from './useAuth';

type State = {
  loading: boolean;
  needsOnboarding: boolean;
  challenge: Challenge | null;
  entries: DailyEntry[];
  todayEntry: DailyEntry | null;
  currentDay: number;
  justReset: { failedDay: number } | null;
  load: () => Promise<void>;
  startChallenge: (goals: ChallengeGoals, startedAt?: string) => Promise<void>;
  upsertToday: (patch: Partial<DailyEntry>) => Promise<void>;
  ackReset: () => void;
  reset: () => void;
};

export const useChallenge = create<State>((set, get) => ({
  loading: true,
  needsOnboarding: false,
  challenge: null,
  entries: [],
  todayEntry: null,
  currentDay: 1,
  justReset: null,

  async load() {
    const userId = useAuth.getState().user?.id;
    if (!userId) {
      set({
        loading: false,
        needsOnboarding: false,
        challenge: null,
        entries: [],
        todayEntry: null,
        currentDay: 1,
      });
      return;
    }
    set({ loading: true });

    const { data: active } = await supabase
      .from('h75_challenges')
      .select('*')
      .eq('user_id', userId)
      .is('failed_at', null)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!active) {
      set({
        loading: false,
        needsOnboarding: true,
        challenge: null,
        entries: [],
        todayEntry: null,
        currentDay: 1,
      });
      return;
    }

    const challenge = active as Challenge;
    const { data: entries = [] } = await supabase
      .from('h75_daily_entries')
      .select('*')
      .eq('challenge_id', challenge.id)
      .order('day_number', { ascending: true });

    const fail = hasFailedBefore(challenge, entries as DailyEntry[]);
    if (fail.failed) {
      await supabase
        .from('h75_challenges')
        .update({ failed_at: todayISO() })
        .eq('id', challenge.id);
      set({
        challenge: null,
        entries: [],
        todayEntry: null,
        currentDay: 1,
        needsOnboarding: true,
        justReset: { failedDay: fail.failedDay! },
        loading: false,
      });
      return;
    }

    const day = getCurrentDay(challenge);
    const today = (entries as DailyEntry[]).find((e) => e.day_number === day) ?? null;

    set({
      challenge,
      entries: entries as DailyEntry[],
      todayEntry: today,
      currentDay: day,
      needsOnboarding: false,
      loading: false,
    });
  },

  async startChallenge(goals, startedAt) {
    const { data, error } = await supabase.rpc('h75_start_challenge', {
      p_workout_indoor_min: goals.workout_indoor_min,
      p_workout_outdoor_min: goals.workout_outdoor_min,
      p_water_ml_goal: goals.water_ml_goal,
      p_reading_pages_goal: goals.reading_pages_goal,
      p_diet_enabled: goals.diet_enabled,
      p_max_misses: goals.max_misses,
      ...(startedAt ? { p_started_at: startedAt } : {}),
    });
    if (error) {
      // Sessão órfã (JWT de usuário deletado) → desloga pra voltar ao login.
      const msg = (error.message || '').toLowerCase();
      if (
        msg.includes('h75_challenges_user_id_fkey') ||
        msg.includes('violates foreign key') ||
        msg.includes('not authenticated')
      ) {
        await supabase.auth.signOut().catch(() => {});
        useAuth.getState().signOut?.().catch(() => {});
      }
      throw error;
    }
    const challenge = data as Challenge;
    set({
      challenge,
      entries: [],
      todayEntry: null,
      currentDay: getCurrentDay(challenge),
      needsOnboarding: false,
      justReset: null,
      loading: false,
    });
  },

  async upsertToday(patch) {
    const { challenge, currentDay, todayEntry } = get();
    if (!challenge) return;
    const writable = todayEntry
      ? {
          workout_indoor: todayEntry.workout_indoor,
          workout_outdoor: todayEntry.workout_outdoor,
          diet: todayEntry.diet,
          water_ml: todayEntry.water_ml,
          reading_pages: todayEntry.reading_pages,
          progress_photo_url: todayEntry.progress_photo_url,
        }
      : {};
    const payload = {
      challenge_id: challenge.id,
      day_number: currentDay,
      entry_date: todayISO(),
      ...writable,
      ...patch,
    };
    const { data, error } = await supabase
      .from('h75_daily_entries')
      .upsert(payload, { onConflict: 'challenge_id,day_number' })
      .select()
      .single();
    if (error) throw error;
    const updated = data as DailyEntry;
    const entries = [...get().entries.filter((e) => e.day_number !== currentDay), updated];
    set({ todayEntry: updated, entries });
  },

  ackReset() {
    set({ justReset: null });
  },

  reset() {
    set({
      loading: true,
      needsOnboarding: false,
      challenge: null,
      entries: [],
      todayEntry: null,
      currentDay: 1,
      justReset: null,
    });
  },
}));

export { goalsFromChallenge };
