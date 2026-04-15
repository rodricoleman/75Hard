import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type State = {
  booting: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  init: () => Promise<() => void>;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (args: {
    email: string;
    password: string;
    inviteCode: string;
    username: string;
    displayName?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuth = create<State>((set, get) => ({
  booting: true,
  session: null,
  user: null,
  profile: null,

  async init() {
    const { data } = await supabase.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user ?? null,
      booting: false,
    });
    if (data.session?.user) {
      await get().refreshProfile();
    }
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        await get().refreshProfile();
      } else {
        set({ profile: null });
      }
    });
    return () => sub.subscription.unsubscribe();
  },

  async refreshProfile() {
    const uid = get().user?.id;
    if (!uid) return;
    const { data } = await supabase
      .from('h75_profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', uid)
      .maybeSingle();
    set({ profile: (data as Profile) ?? null });
  },

  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async signUp({ email, password, inviteCode, username, displayName }) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // Supabase pode exigir confirmação de email; tentamos login direto
    const login = await supabase.auth.signInWithPassword({ email, password });
    if (login.error) throw login.error;
    const { error: rpcErr } = await supabase.rpc('h75_redeem_invite', {
      p_code: inviteCode.trim(),
      p_username: username.trim().toLowerCase(),
      p_display_name: displayName?.trim() || null,
    });
    if (rpcErr) {
      await supabase.auth.signOut();
      throw rpcErr;
    }
    await get().refreshProfile();
  },

  async signOut() {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
}));
