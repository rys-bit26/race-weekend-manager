import { create } from 'zustand';
import type { ViewType } from '../types/views';
import type { DayOfWeek } from '../types/schedule';
import type { LaneMode } from '../types/views';

interface AppState {
  activeView: ViewType;
  activeDay: DayOfWeek;
  laneMode: LaneMode;
  sidebarOpen: boolean;
  pixelsPerMinute: number;
  setActiveView: (view: ViewType) => void;
  setActiveDay: (day: DayOfWeek) => void;
  setLaneMode: (mode: LaneMode) => void;
  setSidebarOpen: (open: boolean) => void;
  setPixelsPerMinute: (ppm: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeView: 'executive',
  activeDay: 'friday',
  laneMode: 'department',
  sidebarOpen: false,
  pixelsPerMinute: 3,
  setActiveView: (view) => set({ activeView: view }),
  setActiveDay: (day) => set({ activeDay: day }),
  setLaneMode: (mode) => set({ laneMode: mode }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setPixelsPerMinute: (ppm) => set({ pixelsPerMinute: ppm }),
}));
