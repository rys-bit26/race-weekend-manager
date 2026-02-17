import type { PdfTextItem, PdfParseResult, ParsedScheduleEvent } from '../../types/pdf';
import type { DayOfWeek, SeriesType } from '../../types/schedule';
import { parseTimeString } from '../../utils/time';
import { detectDay, TIME_RANGE_PATTERN, extractTextItems } from './pdfUtils';

const SERIES_KEYWORDS: { series: SeriesType; patterns: string[] }[] = [
  { series: 'INDYCAR', patterns: ['NTT INDYCAR', 'INDYCAR SERIES', 'NICS'] },
  { series: 'INDY_NXT', patterns: ['INDY NXT', 'INXT'] },
  { series: 'USF2000', patterns: ['USF2000', 'USF 2000', 'USF PRO'] },
  { series: 'MX5_CUP', patterns: ['MX-5', 'MX5', 'MAZDA'] },
  { series: 'NCTS', patterns: ['NCTS', 'NASCAR', 'CRAFTSMAN TRUCK'] },
];

function classifySeries(text: string): SeriesType {
  const upper = text.toUpperCase();
  for (const { series, patterns } of SERIES_KEYWORDS) {
    for (const pattern of patterns) {
      if (upper.includes(pattern.toUpperCase())) return series;
    }
  }
  return 'GENERAL';
}

export async function parsePdf(fileData: ArrayBuffer): Promise<PdfParseResult> {
  const warnings: string[] = [];
  const events: ParsedScheduleEvent[] = [];

  try {
    const { items: allItems, pageCount } = await extractTextItems(fileData);

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
      pageCount,
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

  // Filter to only Thu-Sun
  const targetDays: DayOfWeek[] = ['thursday', 'friday', 'saturday', 'sunday'];
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
