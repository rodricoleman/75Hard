import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const STAY_CONNECTED_KEY = '@h75:stayConnected';

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
    let session = data.session;
    let user = session?.user ?? null;

    if (session) {
      // Valida no servidor — se a conta foi deletada, o JWT ainda pode parecer válido
      // localmente mas getUser() retorna erro. Nesse caso, encerra a sessão.
      const { data: ures, error: uerr } = await supabase.auth.getUser();
      if (uerr || !ures?.user) {
        await supabase.auth.signOut().catch(() => {});
        session = null;
        user = null;
      } else {
        user = ures.user;
      }
    }

    set({ session, user, booting: false });
    if (user) {
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

    // "Manter conectado" OFF no web → encerra a sessão ao fechar a aba.
    let unloadHandler: (() => void) | null = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      unloadHandler = () => {
        AsyncStorage.getItem(STAY_CONNECTED_KEY).then((v) => {
          if (v === 'false') supabase.auth.signOut();
        });
      };
      window.addEventListener('beforeunload', unloadHandler);
    }

    return () => {
      sub.subscription.unsubscribe();
      if (unloadHandler && typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', unloadHandler);
      }
    };
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
    const signUpRes = await supabase.auth.signUp({ email, password });
    if (signUpRes.error) throw signUpRes.error;

    // Se o projeto exige confirmação de email, signUp não retorna sessão.
    let session = signUpRes.data.session;
    if (!session) {
      const login = await supabase.auth.signInWithPassword({ email, password });
      if (login.error) {
        throw new Error(
          'Conta criada, mas o Supabase exige confirmação de email. ' +
            'Desative "Confirm email" no dashboard do Supabase (Authentication → Providers → Email) e tente de novo.',
        );
      }
      session = login.data.session;
    }

    const { error: rpcErr } = await supabase.rpc('h75_redeem_invite', {
      p_code: inviteCode.trim().toUpperCase(),
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
