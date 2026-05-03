import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { WalletEntry } from '@/types';

interface WalletState {
  entries: WalletEntry[];
  loading: boolean;
  fetch: () => Promise<void>;
  prepend: (e: WalletEntry) => void;
}

export const useWallet = create<WalletState>((set, get) => ({
  entries: [],
  loading: false,
  fetch: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('wallet_entry')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) console.warn('[wallet] fetch error', error.message);
    set({ entries: (data as WalletEntry[]) ?? [], loading: false });
  },
  prepend: (e) => set({ entries: [e, ...get().entries] }),
}));
