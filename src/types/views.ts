export type ViewType = 'executive' | 'andretti' | 'sequential';

export type TimeInterval = 15 | 30 | 60;

export interface TimelineConfig {
  dayStartHour: number;
  dayEndHour: number;
  intervalMinutes: TimeInterval;
  pixelsPerMinute: number;
  laneHeight: number;
}

export type LaneMode = 'department' | 'person';

export const defaultTimelineConfig: TimelineConfig = {
  dayStartHour: 6,
  dayEndHour: 23,
  intervalMinutes: 30,
  pixelsPerMinute: 3,
  laneHeight: 60,
};
