export type DayOfWeek = 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type SeriesType =
  | 'INDYCAR'
  | 'INDY_NXT'
  | 'USF2000'
  | 'MX5_CUP'
  | 'NCTS'
  | 'SUPPORT'
  | 'GENERAL';

export interface MasterScheduleEvent {
  id: string;
  weekendId: string;
  day: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  title: string;
  series: SeriesType;
  description?: string;
  rawText: string;
  confidence: number; // 0-1
}

export interface RaceWeekend {
  id: string;
  name: string;
  trackName: string;
  location: string;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  createdAt: string;
  updatedAt: string;
}
