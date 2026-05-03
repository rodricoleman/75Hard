import { create } from 'zustand';

export type ToastVariant = 'earn' | 'lose' | 'level' | 'info' | 'error';

export interface Toast {
  id: number;
  variant: ToastVariant;
  title: string;
  subtitle?: string;
  coin?: number;
  xp?: number;
}

interface ToastState {
  toasts: Toast[];
  show: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let _id = 0;

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  show: (t) => {
    const id = ++_id;
    set({ toasts: [...get().toasts, { ...t, id }] });
    setTimeout(() => get().dismiss(id), 2800);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
}));
