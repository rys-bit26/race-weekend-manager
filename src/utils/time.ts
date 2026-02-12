/**
 * Parse "HH:mm" string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes since midnight to "HH:mm" string
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Format "HH:mm" to display format like "8:00 AM"
 */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format a time range for display
 */
export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Parse various time string formats from PDF into HH:mm
 * Handles: "8:00 AM", "8:00AM", "14:00", "8:00 am", "8:00-9:00", etc.
 */
export function parseTimeString(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase();

  // Try HH:mm AM/PM format
  const ampmMatch = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1]);
    const m = parseInt(ampmMatch[2]);
    const period = ampmMatch[3];
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // Try 24-hour format
  const h24Match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    const h = parseInt(h24Match[1]);
    const m = parseInt(h24Match[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }

  return null;
}

/**
 * Parse a time range string like "8:00 AM - 9:15 AM" or "8:00-9:15"
 * Returns [startTime, endTime] in HH:mm format or null
 */
export function parseTimeRange(raw: string): [string, string] | null {
  const parts = raw.split(/\s*[-–]\s*/);
  if (parts.length < 2) return null;

  const start = parseTimeString(parts[0]);
  const end = parseTimeString(parts[1]);

  if (start && end) return [start, end];
  return null;
}

/**
 * Calculate duration in minutes between two HH:mm times
 */
export function durationMinutes(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start);
}

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const a0 = timeToMinutes(aStart);
  const a1 = timeToMinutes(aEnd);
  const b0 = timeToMinutes(bStart);
  const b1 = timeToMinutes(bEnd);
  return a0 < b1 && b0 < a1;
}

/**
 * Generate time slots for a day grid
 */
export function generateTimeSlots(
  startHour: number,
  endHour: number,
  intervalMinutes: number
): string[] {
  const slots: string[] = [];
  for (let m = startHour * 60; m < endHour * 60; m += intervalMinutes) {
    slots.push(minutesToTime(m));
  }
  return slots;
}
