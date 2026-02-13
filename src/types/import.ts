import type { DayOfWeek } from './schedule';

export type ImportType = 'indycar-schedule' | 'department-schedule';

export interface ParsedDepartmentItem {
  day: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  name: string;
  rawText: string;
}

export interface DepartmentParseResult {
  items: ParsedDepartmentItem[];
  warnings: string[];
  pageCount: number;
  rawItemCount: number;
}
