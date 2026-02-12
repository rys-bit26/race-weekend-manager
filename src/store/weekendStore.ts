import { create } from 'zustand';

interface WeekendStore {
  activeWeekendId: string | null;
  setActiveWeekendId: (id: string | null) => void;
}

export const useWeekendStore = create<WeekendStore>((set) => ({
  activeWeekendId: null,
  setActiveWeekendId: (id) => set({ activeWeekendId: id }),
}));
