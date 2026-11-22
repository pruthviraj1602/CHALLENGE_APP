const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_KEY_REGEX.test(value)) {
    return false;
  }
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split('-').map(Number);
  return { year, month, day };
}

export function formatDateKeyFromParts(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, '0');
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getLocalTodayDateKey(now: Date = new Date()): string {
  return formatDateKeyFromParts(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/**
 * Adds integer calendar days to a YYYY-MM-DD key safely across DST transitions.
 */
export function addDays(dateKey: string, deltaDays: number): string {
  const { year, month, day } = parseDateKey(dateKey);
  const utc = new Date(Date.UTC(year, month - 1, day + deltaDays));
  return formatDateKeyFromParts(
    utc.getUTCFullYear(),
    utc.getUTCMonth() + 1,
    utc.getUTCDate()
  );
}

/**
 * Exact integer calendar day difference (endKey - startKey).
 * Immune to timezone offsets and daylight saving transitions.
 */
export function diffDays(startKey: string, endKey: string): number {
  const a = parseDateKey(startKey);
  const b = parseDateKey(endKey);
  const msA = Date.UTC(a.year, a.month - 1, a.day);
  const msB = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((msB - msA) / 86_400_000);
}

export function getDateRange(startKey: string, durationDays: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < durationDays; i++) {
    dates.push(addDays(startKey, i));
  }
  return dates;
}

export function formatDisplayDate(dateKey: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  const localNoon = new Date(year, month - 1, day, 12, 0, 0);
  return localNoon.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateKey: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  const localNoon = new Date(year, month - 1, day, 12, 0, 0);
  return localNoon.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function getWeekdayIndex(dateKey: string): number {
  const { year, month, day } = parseDateKey(dateKey);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function getWeekdayLabel(dateKey: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  const localNoon = new Date(year, month - 1, day, 12, 0, 0);
  return localNoon.toLocaleDateString(undefined, { weekday: 'short' });
}

export function formatCheckInTime(isoTimestamp: string | null | undefined): string {
  if (!isoTimestamp) return '';
  const dt = new Date(isoTimestamp);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function msUntilNextMidnight(now: Date = new Date()): number {
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    1,
    0
  );
  return Math.max(1000, nextMidnight.getTime() - now.getTime());
}
