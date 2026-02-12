import type { ActivityStatus, DepartmentId } from './activity';

export interface FilterState {
  departments: DepartmentId[];
  personIds: string[];
  statuses: ActivityStatus[];
  location: string;
  searchQuery: string;
}

export const defaultFilters: FilterState = {
  departments: [],
  personIds: [],
  statuses: [],
  location: '',
  searchQuery: '',
};
