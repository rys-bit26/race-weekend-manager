import type { DayOfWeek, SeriesType } from './schedule';

export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
  page: number;
}

export interface ParsedColumn {
  day: DayOfWeek;
  xMin: number;
  xMax: number;
  items: PdfTextItem[];
}

export interface ParsedScheduleEvent {
  rawLines: string[];
  timeString: string;
  title: string;
  inferredSeries: SeriesType;
  confidence: number;
  day: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface PdfParseResult {
  events: ParsedScheduleEvent[];
  warnings: string[];
  pageCount: number;
  rawItemCount: number;
}
