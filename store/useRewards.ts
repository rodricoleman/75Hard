import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Reward, Redemption } from '@/types';
import { useProfile } from './useProfile';
import { useToast } from './useToast';
import { useWallet } from './useWallet';

interface RewardsState {
  rewards: Reward[];
  redemptions: Redemption[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (r: Partial<Reward>) => Promise<Reward | null>;
  update: (id: string, patch: Partial<Reward>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  redeem: (rewardId: string, note?: string) => Promise<{ error: string | null }>;
}

export const useRewards = create<RewardsState>((set, get) => ({
  rewards: [],
  redemptions: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const [rRes, redRes] = await Promise.all([
      supabase
        .from('reward')
        .select('*')
        .eq('active', true)
        .order('coin_cost', { ascending: true }),
      supabase
        .from('redemption')
        .select('*')
        .order('redeemed_at', { ascending: false })
        .limit(100),
    ]);
    if (rRes.error) console.warn('[reward] fetch error', rRes.error.message);
    if (redRes.error) console.warn('[redemption] fetch error', redRes.error.message);
    set({
      rewards: (rRes.data as Reward[]) ?? [],
      redemptions: (redRes.data as Redemption[]) ?? [],
      loading: false,
    });
  },

  create: async (r) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase
      .from('reward')
      .insert({ ...r, user_id: u.user.id })
      .select()
      .single();
    if (error) {
      console.warn('[reward] create error', error.message);
      return null;
    }
    set({ rewards: [...get().rewards, data as Reward] });
    return data as Reward;
  },

  update: async (id, patch) => {
    const { data, error } = await supabase
      .from('reward')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.warn('[reward] update error', error.message);
      return;
    }
    set({ rewards: get().rewards.map((r) => (r.id === id ? (data as Reward) : r)) });
  },

  remove: async (id) => {
    const { error } = await supabase.from('reward').update({ active: false }).eq('id', id);
    if (error) {
      console.warn('[reward] remove error', error.message);
      return;
    }
    set({ rewards: get().rewards.filter((r) => r.id !== id) });
  },

  redeem: async (rewardId, note) => {
    const { data, error } = await supabase.rpc('redeem_reward', {
      p_reward_id: rewardId,
      p_note: note ?? null,
    });
    if (error) return { error: error.message };
    if (data) {
      const r = data as Redemption;
      set({ redemptions: [r, ...get().redemptions] });
      const reward = get().rewards.find((x) => x.id === rewardId);
      useToast.getState().show({
        variant: 'info',
        title: reward ? `Resgatado: ${reward.title}` : 'Resgatado',
        subtitle: 'Pode gastar a grana real agora.',
        coin: -r.coin_spent,
      });
    }
    await useProfile.getState().fetch();
    await useWallet.getState().fetch();
    await get().fetch();
    return { error: null };
  },
}));
