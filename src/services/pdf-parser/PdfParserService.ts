import * as pdfjsLib from 'pdfjs-dist';
import type { PdfTextItem, PdfParseResult, ParsedScheduleEvent } from '../../types/pdf';
import type { DayOfWeek, SeriesType } from '../../types/schedule';
import { parseTimeString } from '../../utils/time';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const DAY_PATTERNS: { day: DayOfWeek; patterns: RegExp[] }[] = [
  { day: 'wednesday', patterns: [/wednesday/i, /\bwed\b/i] },
  { day: 'thursday', patterns: [/thursday/i, /\bthu/i] },
  { day: 'friday', patterns: [/friday/i, /\bfri\b/i] },
  { day: 'saturday', patterns: [/saturday/i, /\bsat\b/i] },
  { day: 'sunday', patterns: [/sunday/i, /\bsun\b/i] },
];

const SERIES_KEYWORDS: { series: SeriesType; patterns: string[] }[] = [
  { series: 'INDYCAR', patterns: ['NTT INDYCAR', 'INDYCAR SERIES', 'NICS'] },
  { series: 'INDY_NXT', patterns: ['INDY NXT', 'INXT'] },
  { series: 'USF2000', patterns: ['USF2000', 'USF 2000'] },
  { series: 'MX5_CUP', patterns: ['MX-5', 'MX5', 'MAZDA'] },
  { series: 'NCTS', patterns: ['NCTS', 'NASCAR', 'CRAFTSMAN TRUCK'] },
];

const TIME_RANGE_PATTERN =
  /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/;

function classifySeries(text: string): SeriesType {
  const upper = text.toUpperCase();
  for (const { series, patterns } of SERIES_KEYWORDS) {
    for (const pattern of patterns) {
      if (upper.includes(pattern.toUpperCase())) return series;
    }
  }
  return 'GENERAL';
}

function detectDay(text: string): DayOfWeek | null {
  for (const { day, patterns } of DAY_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) return day;
    }
  }
  return null;
}

export async function parsePdf(fileData: ArrayBuffer): Promise<PdfParseResult> {
  const warnings: string[] = [];
  const events: ParsedScheduleEvent[] = [];

  try {
    const doc = await pdfjsLib.getDocument({ data: fileData }).promise;
    const allItems: PdfTextItem[] = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const textContent = await page.getTextContent();

      for (const item of textContent.items) {
        if ('str' in item && item.str.trim()) {
          allItems.push({
            str: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width ?? 0,
            height: item.height ?? 0,
            fontName: ('fontName' in item ? item.fontName : '') as string,
            fontSize: Math.abs(item.transform[0]),
            page: pageNum,
          });
        }
      }
    }

    // Detect columns by finding day headers and clustering x-positions
    const columns = detectColumns(allItems);

    // Parse events from each column
    for (const column of columns) {
      const columnEvents = parseColumnEvents(column.items, column.day);
      events.push(...columnEvents);
    }

    if (events.length === 0) {
      warnings.push(
        'No events could be extracted. The PDF format may not be supported.'
      );
    }

    return {
      events,
      warnings,
      pageCount: doc.numPages,
      rawItemCount: allItems.length,
    };
  } catch (err) {
    return {
      events: [],
      warnings: [`Failed to parse PDF: ${err instanceof Error ? err.message : 'Unknown error'}`],
      pageCount: 0,
      rawItemCount: 0,
    };
  }
}

interface ColumnInfo {
  day: DayOfWeek;
  xMin: number;
  xMax: number;
  items: PdfTextItem[];
}

function detectColumns(items: PdfTextItem[]): ColumnInfo[] {
  // Find day header text items
  const dayHeaders: { day: DayOfWeek; x: number; item: PdfTextItem }[] = [];

  for (const item of items) {
    const day = detectDay(item.str);
    if (day) {
      dayHeaders.push({ day, x: item.x, item });
    }
  }

  // Deduplicate by day (keep the one with highest y = topmost in PDF)
  const uniqueDays = new Map<DayOfWeek, { x: number; y: number }>();
  for (const header of dayHeaders) {
    const existing = uniqueDays.get(header.day);
    if (!existing || header.item.y > existing.y) {
      uniqueDays.set(header.day, { x: header.x, y: header.item.y });
    }
  }

  // Sort columns by x position
  const sortedDays = [...uniqueDays.entries()].sort((a, b) => a[1].x - b[1].x);

  // Filter to only Wed-Sun
  const targetDays: DayOfWeek[] = ['wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const filteredDays = sortedDays.filter(([day]) => targetDays.includes(day));

  if (filteredDays.length === 0) return [];

  // Create column boundaries
  const columns: ColumnInfo[] = [];
  for (let i = 0; i < filteredDays.length; i++) {
    const [day, { x }] = filteredDays[i];
    const xMin = i === 0 ? x - 50 : (filteredDays[i - 1][1].x + x) / 2;
    const xMax =
      i === filteredDays.length - 1
        ? x + 200
        : (x + filteredDays[i + 1][1].x) / 2;

    // Assign items to this column
    const columnItems = items
      .filter((item) => item.x >= xMin && item.x < xMax)
      .sort((a, b) => b.y - a.y); // Top to bottom (PDF y is bottom-up)

    columns.push({ day, xMin, xMax, items: columnItems });
  }

  return columns;
}

function parseColumnEvents(items: PdfTextItem[], day: DayOfWeek): ParsedScheduleEvent[] {
  const events: ParsedScheduleEvent[] = [];

  // Combine items into lines (items close in y-position)
  const lines: { text: string; y: number }[] = [];
  let currentLine = '';
  let currentY = items[0]?.y ?? 0;

  for (const item of items) {
    if (Math.abs(item.y - currentY) > 3) {
      if (currentLine.trim()) {
        lines.push({ text: currentLine.trim(), y: currentY });
      }
      currentLine = item.str;
      currentY = item.y;
    } else {
      currentLine += ' ' + item.str;
    }
  }
  if (currentLine.trim()) {
    lines.push({ text: currentLine.trim(), y: currentY });
  }

  // Parse lines into events
  let currentEvent: {
    timeString: string;
    startTime: string;
    endTime: string;
    lines: string[];
  } | null = null;

  for (const line of lines) {
    const timeMatch = line.text.match(TIME_RANGE_PATTERN);

    if (timeMatch) {
      // Save previous event
      if (currentEvent) {
        const title = currentEvent.lines.join(' ').trim();
        if (title) {
          events.push({
            rawLines: currentEvent.lines,
            timeString: currentEvent.timeString,
            title,
            inferredSeries: classifySeries(title),
            confidence: 0.8,
            day,
            startTime: currentEvent.startTime,
            endTime: currentEvent.endTime,
          });
        }
      }

      const startTime = parseTimeString(timeMatch[1]);
      const endTime = parseTimeString(timeMatch[2]);

      if (startTime && endTime) {
        // Remove the time range from the line to get the title portion
        const titlePart = line.text.replace(TIME_RANGE_PATTERN, '').trim();
        currentEvent = {
          timeString: timeMatch[0],
          startTime,
          endTime,
          lines: titlePart ? [titlePart] : [],
        };
      } else {
        currentEvent = null;
      }
    } else if (currentEvent) {
      // Continuation line for current event
      currentEvent.lines.push(line.text);
    }
  }

  // Don't forget the last event
  if (currentEvent) {
    const title = currentEvent.lines.join(' ').trim();
    if (title) {
      events.push({
        rawLines: currentEvent.lines,
        timeString: currentEvent.timeString,
        title,
        inferredSeries: classifySeries(title),
        confidence: 0.8,
        day,
        startTime: currentEvent.startTime,
        endTime: currentEvent.endTime,
      });
    }
  }

  return events;
}
