import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

const keyFor = (userId: string) => `@h75:lastFeedVisit:${userId}`;

type State = {
  unreadCount: number;
  refresh: () => Promise<void>;
  markSeen: () => Promise<void>;
  reset: () => void;
};

export const useFeedBadge = create<State>((set) => ({
  unreadCount: 0,

  async refresh() {
    const userId = useAuth.getState().user?.id;
    if (!userId) {
      set({ unreadCount: 0 });
      return;
    }
    const raw = await AsyncStorage.getItem(keyFor(userId));
    const lastIso = raw ? new Date(Number(raw)).toISOString() : new Date(0).toISOString();
    const { count } = await supabase
      .from('h75_posts')
      .select('id', { count: 'exact', head: true })
      .gt('created_at', lastIso)
      .neq('user_id', userId);
    set({ unreadCount: count ?? 0 });
  },

  async markSeen() {
    const userId = useAuth.getState().user?.id;
    if (!userId) return;
    await AsyncStorage.setItem(keyFor(userId), String(Date.now()));
    set({ unreadCount: 0 });
  },

  reset() {
    set({ unreadCount: 0 });
  },
}));
