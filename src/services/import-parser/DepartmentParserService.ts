import type { DayOfWeek } from '../../types/schedule';
import type { ParsedDepartmentItem, DepartmentParseResult } from '../../types/import';
import { parseTimeString } from '../../utils/time';
import {
  extractTextItems,
  groupItemsIntoLines,
  detectDay,
  TIME_RANGE_PATTERN,
} from '../pdf-parser/pdfUtils';

/**
 * Parse a department schedule file (PDF or Excel) into department items.
 * Department schedules are row-based: day headers followed by timed entries.
 */
export async function parseDepartmentFile(
  fileData: ArrayBuffer,
  fileType: 'pdf' | 'xlsx'
): Promise<DepartmentParseResult> {
  if (fileType === 'xlsx') {
    return parseExcel(fileData);
  }
  return parseDepartmentPdf(fileData);
}

// ──── PDF Parsing ────

async function parseDepartmentPdf(fileData: ArrayBuffer): Promise<DepartmentParseResult> {
  const warnings: string[] = [];
  const items: ParsedDepartmentItem[] = [];

  try {
    const { items: textItems, pageCount } = await extractTextItems(fileData);
    const lines = groupItemsIntoLines(textItems);

    let currentDay: DayOfWeek | null = null;

    for (const line of lines) {
      // Check if this line is a day header
      const day = detectDay(line.text);
      if (day) {
        currentDay = day;
        // Check if the line also has a time range after the day name
        const afterDay = line.text.replace(/(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*/i, '').trim();
        if (afterDay) {
          const parsed = parseTimedLine(afterDay, currentDay);
          if (parsed) items.push(parsed);
        }
        continue;
      }

      if (!currentDay) continue;

      // Try to parse as a timed entry
      const parsed = parseTimedLine(line.text, currentDay);
      if (parsed) {
        items.push(parsed);
      }
    }

    if (items.length === 0) {
      warnings.push(
        'No timed entries found. Ensure the PDF has day headers (e.g. Friday, Saturday) followed by time ranges (e.g. 8:00 AM - 9:00 AM).'
      );
    }

    return { items, warnings, pageCount, rawItemCount: textItems.length };
  } catch (err) {
    return {
      items: [],
      warnings: [`Failed to parse PDF: ${err instanceof Error ? err.message : 'Unknown error'}`],
      pageCount: 0,
      rawItemCount: 0,
    };
  }
}

function parseTimedLine(text: string, day: DayOfWeek): ParsedDepartmentItem | null {
  const timeMatch = text.match(TIME_RANGE_PATTERN);
  if (!timeMatch) return null;

  const startTime = parseTimeString(timeMatch[1]);
  const endTime = parseTimeString(timeMatch[2]);
  if (!startTime || !endTime) return null;

  const name = text.replace(TIME_RANGE_PATTERN, '').trim();
  if (!name) return null;

  return { day, startTime, endTime, name, rawText: text };
}

// ──── Excel Parsing ────

const DAY_KEYWORDS = ['day', 'date'];
const TIME_START_KEYWORDS = ['start', 'begin', 'from', 'time'];
const TIME_END_KEYWORDS = ['end', 'to', 'finish', 'until'];
const NAME_KEYWORDS = ['event', 'activity', 'name', 'title', 'description', 'task', 'item'];

function matchesKeyword(cell: string, keywords: string[]): boolean {
  const lower = cell.toLowerCase().trim();
  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Map a day string from Excel to a DayOfWeek.
 * Handles full names, abbreviations, and date strings.
 */
function excelDayToDay(raw: string): DayOfWeek | null {
  if (!raw) return null;
  const cleaned = raw.toString().trim();
  return detectDay(cleaned);
}

async function parseExcel(fileData: ArrayBuffer): Promise<DepartmentParseResult> {
  const warnings: string[] = [];
  const items: ParsedDepartmentItem[] = [];

  try {
    // Dynamic import to avoid loading xlsx in the main bundle
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(fileData, { type: 'array' });

    if (workbook.SheetNames.length === 0) {
      return { items: [], warnings: ['No sheets found in workbook.'], pageCount: 0, rawItemCount: 0 };
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (rows.length < 2) {
      return { items: [], warnings: ['Sheet has fewer than 2 rows.'], pageCount: 1, rawItemCount: rows.length };
    }

    // Detect column indices from headers (scan first 5 rows)
    let dayCol = -1;
    let startCol = -1;
    let endCol = -1;
    let nameCol = -1;
    let headerRow = -1;

    for (let r = 0; r < Math.min(5, rows.length); r++) {
      const row = rows[r];
      if (!row) continue;

      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] ?? '');
        if (!cell.trim()) continue;

        if (dayCol === -1 && matchesKeyword(cell, DAY_KEYWORDS)) { dayCol = c; headerRow = r; }
        if (startCol === -1 && matchesKeyword(cell, TIME_START_KEYWORDS)) { startCol = c; headerRow = r; }
        if (endCol === -1 && matchesKeyword(cell, TIME_END_KEYWORDS)) { endCol = c; headerRow = r; }
        if (nameCol === -1 && matchesKeyword(cell, NAME_KEYWORDS)) { nameCol = c; headerRow = r; }
      }

      if (dayCol >= 0 && startCol >= 0 && nameCol >= 0) break;
    }

    // Fallback to positional columns if headers not found
    if (dayCol === -1 || startCol === -1 || nameCol === -1) {
      warnings.push('Could not detect column headers. Using positional mapping: A=Day, B=Start, C=End, D=Name.');
      dayCol = 0;
      startCol = 1;
      endCol = 2;
      nameCol = 3;
      headerRow = 0; // skip first row as header
    }

    // If no separate end column, look for combined time range in start column
    const hasSeparateEnd = endCol >= 0;

    // Parse data rows
    for (let r = headerRow + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row) continue;

      const dayRaw = String(row[dayCol] ?? '').trim();
      const startRaw = String(row[startCol] ?? '').trim();
      const nameRaw = String(row[nameCol] ?? '').trim();

      if (!dayRaw || !nameRaw) continue;

      const day = excelDayToDay(dayRaw);
      if (!day) continue;

      let startTime: string | null = null;
      let endTime: string | null = null;

      if (hasSeparateEnd) {
        const endRaw = String(row[endCol] ?? '').trim();
        startTime = parseTimeString(startRaw);
        endTime = parseTimeString(endRaw);
      } else {
        // Try parsing start column as a time range "8:00 AM - 9:00 AM"
        const rangeMatch = startRaw.match(TIME_RANGE_PATTERN);
        if (rangeMatch) {
          startTime = parseTimeString(rangeMatch[1]);
          endTime = parseTimeString(rangeMatch[2]);
        } else {
          startTime = parseTimeString(startRaw);
          endTime = startTime; // same as start if no end found
        }
      }

      if (!startTime) continue;
      if (!endTime) endTime = startTime;

      items.push({
        day,
        startTime,
        endTime,
        name: nameRaw,
        rawText: row.map(String).join(' | '),
      });
    }

    if (items.length === 0) {
      warnings.push(
        'No items could be extracted. Ensure the spreadsheet has columns for Day, Time, and Event/Activity name.'
      );
    }

    return { items, warnings, pageCount: 1, rawItemCount: rows.length };
  } catch (err) {
    return {
      items: [],
      warnings: [`Failed to parse Excel: ${err instanceof Error ? err.message : 'Unknown error'}`],
      pageCount: 0,
      rawItemCount: 0,
    };
  }
}
