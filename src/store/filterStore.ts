import { create } from 'zustand';
import type { FilterState } from '../types/filters';
import type { DepartmentId, ActivityStatus } from '../types/activity';

interface FilterStore extends FilterState {
  setDepartmentFilter: (departments: DepartmentId[]) => void;
  toggleDepartment: (dept: DepartmentId) => void;
  setPersonFilter: (personIds: string[]) => void;
  setStatusFilter: (statuses: ActivityStatus[]) => void;
  setLocationFilter: (location: string) => void;
  setSearchQuery: (query: string) => void;
  clearAll: () => void;
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  departments: [],
  personIds: [],
  statuses: [],
  location: '',
  searchQuery: '',

  setDepartmentFilter: (departments) => set({ departments }),
  toggleDepartment: (dept) => {
    const current = get().departments;
    if (current.includes(dept)) {
      set({ departments: current.filter((d) => d !== dept) });
    } else {
      set({ departments: [...current, dept] });
    }
  },
  setPersonFilter: (personIds) => set({ personIds }),
  setStatusFilter: (statuses) => set({ statuses }),
  setLocationFilter: (location) => set({ location }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  clearAll: () =>
    set({
      departments: [],
      personIds: [],
      statuses: [],
      location: '',
      searchQuery: '',
    }),
  hasActiveFilters: () => {
    const s = get();
    return (
      s.departments.length > 0 ||
      s.personIds.length > 0 ||
      s.statuses.length > 0 ||
      s.location !== '' ||
      s.searchQuery !== ''
    );
  },
}));
