import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FiredNotification } from '../types/notification';

interface NotificationState {
  activePersonId: string | null;
  setActivePersonId: (id: string | null) => void;

  toasts: FiredNotification[];
  addToast: (notification: FiredNotification) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      activePersonId: null,
      setActivePersonId: (id) => set({ activePersonId: id }),

      toasts: [],
      addToast: (notification) =>
        set((state) => ({
          toasts: [notification, ...state.toasts].slice(0, 3),
        })),
      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'race-weekend-notifications',
      // Only persist activePersonId — toasts are ephemeral
      partialize: (state) => ({ activePersonId: state.activePersonId }),
    }
  )
);
