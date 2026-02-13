import type { Department, DepartmentId } from '../types/activity';
import type { DayOfWeek } from '../types/schedule';

export const DEPARTMENTS: Department[] = [
  {
    id: 'social-content',
    name: 'Social & Content',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    shortName: 'SC',
  },
  {
    id: 'communications',
    name: 'Communications',
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
    shortName: 'COM',
  },
  {
    id: 'brand-experiences',
    name: 'Brand Experiences',
    color: '#F97316',
    bgColor: '#FFF7ED',
    shortName: 'BX',
  },
  {
    id: 'sales',
    name: 'Sales',
    color: '#10B981',
    bgColor: '#ECFDF5',
    shortName: 'SAL',
  },
  {
    id: 'partnerships',
    name: 'Partnerships',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    shortName: 'PTR',
  },
  {
    id: 'drivers',
    name: 'Drivers',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    shortName: 'DRV',
  },
  {
    id: 'photography',
    name: 'Photography',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    shortName: 'PHO',
  },
  {
    id: 'executives',
    name: 'Executives',
    color: '#0F172A',
    bgColor: '#F1F5F9',
    shortName: 'EXEC',
  },
];

export const DEPARTMENT_MAP: Record<DepartmentId, Department> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d])
) as Record<DepartmentId, Department>;

export const DAYS: { id: DayOfWeek; label: string; shortLabel: string }[] = [
  { id: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { id: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { id: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { id: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { id: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
];

export const LOCATIONS = [
  'Pit Lane',
  'Garage',
  'Paddock',
  'Media Center',
  'Hospitality',
  'Fan Zone',
  'Tech Inspection',
  'Grid',
  'Victory Circle',
  'Transporter',
  'Track',
  'Other',
];

export const REMINDER_TIMINGS = [
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
] as const;

export const NOTIFICATION_CHANNELS = [
  { id: 'in-app' as const, label: 'In-app alerts', available: true },
  { id: 'ics' as const, label: 'Calendar (.ics)', available: true },
  { id: 'sms' as const, label: 'SMS', available: false },
] as const;

export const SERIES_COLORS: Record<string, string> = {
  INDYCAR: '#D4A017',
  INDY_NXT: '#22C55E',
  USF2000: '#3B82F6',
  MX5_CUP: '#EF4444',
  NCTS: '#A855F7',
  SUPPORT: '#6B7280',
  GENERAL: '#94A3B8',
};
