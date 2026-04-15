import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type State = {
  session: Session | null;
  ready: boolean;
  init: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuth = create<State>((set) => ({
  session: null,
  ready: false,
  async init() {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, ready: true });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
    });
  },
  async signOut() {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
