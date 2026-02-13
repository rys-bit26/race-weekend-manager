import type { DayOfWeek } from './schedule';

export type ActivityStatus = 'pending' | 'confirmed';

export type DepartmentId =
  | 'social-content'
  | 'communications'
  | 'brand-experiences'
  | 'sales'
  | 'partnerships'
  | 'drivers'
  | 'photography'
  | 'executives';

export interface Department {
  id: DepartmentId;
  name: string;
  color: string;
  bgColor: string;
  shortName: string;
}

export interface Person {
  id: string;
  name: string;
  departmentId: DepartmentId;
  role?: string;
  email?: string;
  phoneNumber?: string;
  smsOptIn?: boolean;
}

export interface Activity {
  id: string;
  weekendId: string;
  name: string;
  departmentIds: DepartmentId[];
  personIds: string[];
  day: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  location: string;
  status: ActivityStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
