import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  fetch: () => Promise<void>;
  setLocal: (p: Profile) => void;
  update: (patch: Partial<Profile>) => Promise<void>;
}

export const useProfile = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      set({ profile: null, loading: false });
      return;
    }
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', u.user.id)
      .single();
    if (error) {
      console.warn('[profile] fetch error', error.message);
      set({ loading: false });
      return;
    }
    set({ profile: data as Profile, loading: false });
  },

  setLocal: (p) => set({ profile: p }),

  update: async (patch) => {
    const cur = get().profile;
    if (!cur) return;
    const { data, error } = await supabase
      .from('profile')
      .update(patch)
      .eq('id', cur.id)
      .select()
      .single();
    if (error) {
      console.warn('[profile] update error', error.message);
      return;
    }
    set({ profile: data as Profile });
  },
}));
