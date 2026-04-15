import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Challenge, DailyEntry } from '@/types/challenge';
import { getCurrentDay, hasFailedBefore, todayISO } from '@/lib/streak';
import { OWNER_ID } from './useAuth';

type State = {
  loading: boolean;
  challenge: Challenge | null;
  entries: DailyEntry[];
  todayEntry: DailyEntry | null;
  currentDay: number;
  justReset: { failedDay: number } | null;
  load: () => Promise<void>;
  upsertToday: (patch: Partial<DailyEntry>) => Promise<void>;
  ackReset: () => void;
};

async function createChallenge(): Promise<Challenge> {
  const { data, error } = await supabase
    .from('h75_challenges')
    .insert({ user_id: OWNER_ID })
    .select()
    .single();
  if (error) throw error;
  return data as Challenge;
}

export const useChallenge = create<State>((set, get) => ({
  loading: true,
  challenge: null,
  entries: [],
  todayEntry: null,
  currentDay: 1,
  justReset: null,

  async load() {
    set({ loading: true });

    let { data: active } = await supabase
      .from('h75_challenges')
      .select('*')
      .eq('user_id', OWNER_ID)
      .is('failed_at', null)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!active) {
      active = await createChallenge();
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
      const fresh = await createChallenge();
      set({
        challenge: fresh,
        entries: [],
        todayEntry: null,
        currentDay: 1,
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
    console.log('[h75] upsert payload', payload);
    const { data, error } = await supabase
      .from('h75_daily_entries')
      .upsert(payload, { onConflict: 'challenge_id,day_number' })
      .select()
      .single();
    if (error) {
      console.error('[h75] upsert error', error);
      throw error;
    }
    const updated = data as DailyEntry;
    console.log('[h75] upsert ok', updated);
    const entries = [...get().entries.filter((e) => e.day_number !== currentDay), updated];
    set({ todayEntry: updated, entries });
  },

  ackReset() {
    set({ justReset: null });
  },
}));
