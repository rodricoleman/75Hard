import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Challenge, DailyEntry } from '@/types/challenge';
import { getCurrentDay, hasFailedBefore, todayISO } from '@/lib/streak';

type State = {
  loading: boolean;
  challenge: Challenge | null;
  entries: DailyEntry[];
  todayEntry: DailyEntry | null;
  currentDay: number;
  justReset: { failedDay: number } | null;
  load: (userId: string) => Promise<void>;
  upsertToday: (patch: Partial<DailyEntry>) => Promise<void>;
  ackReset: () => void;
};

async function createChallenge(userId: string): Promise<Challenge> {
  const { data, error } = await supabase
    .from('h75_challenges')
    .insert({ user_id: userId })
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

  async load(userId) {
    set({ loading: true });

    let { data: active } = await supabase
      .from('h75_challenges')
      .select('*')
      .eq('user_id', userId)
      .is('failed_at', null)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!active) {
      active = await createChallenge(userId);
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
      const fresh = await createChallenge(userId);
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
    const payload = {
      challenge_id: challenge.id,
      day_number: currentDay,
      entry_date: todayISO(),
      ...todayEntry,
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
}));
