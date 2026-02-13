import * as pdfjsLib from 'pdfjs-dist';
import type { PdfTextItem } from '../../types/pdf';
import type { DayOfWeek } from '../../types/schedule';

// Configure PDF.js worker (shared across all parsers)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export const DAY_PATTERNS: { day: DayOfWeek; patterns: RegExp[] }[] = [
  { day: 'wednesday', patterns: [/wednesday/i, /\bwed\b/i] },
  { day: 'thursday', patterns: [/thursday/i, /\bthu/i] },
  { day: 'friday', patterns: [/friday/i, /\bfri\b/i] },
  { day: 'saturday', patterns: [/saturday/i, /\bsat\b/i] },
  { day: 'sunday', patterns: [/sunday/i, /\bsun\b/i] },
];

export const TIME_RANGE_PATTERN =
  /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/;

export function detectDay(text: string): DayOfWeek | null {
  for (const { day, patterns } of DAY_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) return day;
    }
  }
  return null;
}

/**
 * Extract all text items from a PDF file using pdfjs-dist
 */
export async function extractTextItems(fileData: ArrayBuffer): Promise<{
  items: PdfTextItem[];
  pageCount: number;
}> {
  const doc = await pdfjsLib.getDocument({ data: fileData }).promise;
  const items: PdfTextItem[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim()) {
        items.push({
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

  return { items, pageCount: doc.numPages };
}

/**
 * Group text items into lines by y-position proximity.
 * Items sorted top-to-bottom (PDF y is bottom-up, so descending y = top-to-bottom).
 */
export function groupItemsIntoLines(
  items: PdfTextItem[]
): { text: string; y: number }[] {
  if (items.length === 0) return [];

  // Sort top-to-bottom (highest y first)
  const sorted = [...items].sort((a, b) => b.y - a.y);

  const lines: { text: string; y: number }[] = [];
  let currentLine = '';
  let currentY = sorted[0].y;

  for (const item of sorted) {
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

  return lines;
}
