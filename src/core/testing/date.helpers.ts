/**
 * Date Test Helpers
 * 
 * Utilities for creating deterministic dates in tests.
 */

/**
 * Create a Date in local timezone
 * 
 * @param year - Full year (e.g., 2026)
 * @param month - Month 1-12 (natural notation)
 * @param day - Day of month 1-31
 * @returns Date at 00:00:00.000 local time
 * 
 * @example
 * makeDate(2026, 2, 21) // Feb 21, 2026 00:00:00.000
 */
export function makeDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day); // month-1 because Date uses 0-indexed months
}

/**
 * Create ISO date string (YYYY-MM-DD)
 * 
 * @param year - Full year (e.g., 2026)
 * @param month - Month 1-12 (natural notation)
 * @param day - Day of month 1-31
 * @returns ISO date string
 * 
 * @example
 * iso(2026, 2, 21) // '2026-02-21'
 */
export function iso(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, '0');
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Compare two dates for equality (ignoring time)
 * 
 * @param a - First date
 * @param b - Second date
 * @returns true if same calendar day
 */
export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
