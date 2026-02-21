/**
 * Date Adapter Abstraction for Timezone-Safe Date Operations
 * 
 * Problem:
 * Using Date natively in calendar/range logic causes enterprise bugs:
 * - Date ranges shift by 1 day due to timezone/DST
 * - Server (UTC) vs Client (local timezone) discrepancies
 * - Inconsistent reporting in BI/ERP/invoicing/hotel systems
 * 
 * Solution:
 * All date calculations go through an adapter layer.
 * This allows:
 * - Timezone-safe operations by default (NativeDateAdapter normalizes to day boundaries)
 * - Optional integration with Luxon/DayJS/date-fns for advanced timezone handling
 * - Consistent behavior across SSR and client
 * - Migration path to timezone-aware libraries without breaking changes
 * 
 * Architecture:
 * ```
 * DualDateRangeStore
 *     ↓ uses
 * DateAdapter ← Inject via DATE_ADAPTER token
 *     ↓ implements
 * NativeDateAdapter (default, zero deps)
 * LuxonDateAdapter (optional, full timezone support)
 * DayJSDateAdapter (optional, lightweight)
 * ```
 * 
 * Usage:
 * ```typescript
 * // Default (NativeDateAdapter)
 * bootstrapApplication(AppComponent);
 * 
 * // Advanced (Luxon with timezone)
 * import { LuxonDateAdapter } from '@oneluiz/dual-datepicker/luxon';
 * 
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     { provide: DATE_ADAPTER, useClass: LuxonDateAdapter }
 *   ]
 * });
 * ```
 */

import { InjectionToken } from '@angular/core';

/**
 * Date adapter interface for all calendar/range operations
 * 
 * All methods operate on "calendar day" level, ignoring time components.
 * Implementations must ensure timezone-safe behavior.
 * 
 * Implementations:
 * - NativeDateAdapter: Default, zero dependencies, uses Date with normalization
 * - LuxonDateAdapter: Optional, full timezone support with Luxon
 * - DayJSDateAdapter: Optional, lightweight timezone support
 * - Custom: Implement for your specific backend/timezone requirements
 */
export interface DateAdapter {
  /**
   * Normalize date to start of day (00:00:00.000)
   * 
   * Critical for timezone-safe comparisons.
   * 
   * Example:
   * ```typescript
   * const date = new Date('2026-02-21T15:30:00');
   * const normalized = adapter.normalize(date);
   * // → 2026-02-21T00:00:00.000 (in local timezone)
   * ```
   * 
   * @param date - Date to normalize
   * @returns Date with time set to 00:00:00.000
   */
  normalize(date: Date): Date;

  /**
   * Check if two dates represent the same calendar day
   * 
   * Ignores time component. Timezone-safe.
   * 
   * Example:
   * ```typescript
   * const a = new Date('2026-02-21T23:59:59');
   * const b = new Date('2026-02-21T00:00:01');
   * adapter.isSameDay(a, b); // → true
   * ```
   */
  isSameDay(a: Date, b: Date): boolean;

  /**
   * Check if date A is before date B (calendar day level)
   * 
   * Example:
   * ```typescript
   * adapter.isBeforeDay(new Date('2026-02-20'), new Date('2026-02-21')); // → true
   * adapter.isBeforeDay(new Date('2026-02-21'), new Date('2026-02-21')); // → false
   * ```
   */
  isBeforeDay(a: Date, b: Date): boolean;

  /**
   * Check if date A is after date B (calendar day level)
   * 
   * Example:
   * ```typescript
   * adapter.isAfterDay(new Date('2026-02-22'), new Date('2026-02-21')); // → true
   * adapter.isAfterDay(new Date('2026-02-21'), new Date('2026-02-21')); // → false
   * ```
   */
  isAfterDay(a: Date, b: Date): boolean;

  /**
   * Add days to a date
   * 
   * Must handle DST transitions correctly.
   * 
   * Example:
   * ```typescript
   * const date = new Date('2026-02-21');
   * const future = adapter.addDays(date, 7);
   * // → 2026-02-28
   * ```
   */
  addDays(date: Date, days: number): Date;

  /**
   * Add months to a date
   * 
   * Must handle month overflow (e.g., Jan 31 + 1 month → Feb 28).
   * 
   * Example:
   * ```typescript
   * const date = new Date('2026-01-31');
   * const next = adapter.addMonths(date, 1);
   * // → 2026-02-28 (not March 3rd)
   * ```
   */
  addMonths(date: Date, months: number): Date;

  /**
   * Get start of day (00:00:00.000)
   * 
   * Similar to normalize() but explicit intent.
   */
  startOfDay(date: Date): Date;

  /**
   * Get end of day (23:59:59.999)
   * 
   * Useful for range queries that need to include entire day.
   * 
   * Example:
   * ```typescript
   * const date = new Date('2026-02-21');
   * const end = adapter.endOfDay(date);
   * // → 2026-02-21T23:59:59.999
   * ```
   */
  endOfDay(date: Date): Date;

  /**
   * Get first day of month (00:00:00.000)
   * 
   * Example:
   * ```typescript
   * const date = new Date('2026-02-21');
   * const start = adapter.startOfMonth(date);
   * // → 2026-02-01T00:00:00.000
   * ```
   */
  startOfMonth(date: Date): Date;

  /**
   * Get last day of month (23:59:59.999)
   * 
   * Example:
   * ```typescript
   * const date = new Date('2026-02-21');
   * const end = adapter.endOfMonth(date);
   * // → 2026-02-28T23:59:59.999
   * ```
   */
  endOfMonth(date: Date): Date;

  /**
   * Get year (4-digit)
   * 
   * Example:
   * ```typescript
   * adapter.getYear(new Date('2026-02-21')); // → 2026
   * ```
   */
  getYear(date: Date): number;

  /**
   * Get month (0-11, where 0 = January)
   * 
   * Example:
   * ```typescript
   * adapter.getMonth(new Date('2026-02-21')); // → 1 (February)
   * ```
   */
  getMonth(date: Date): number;

  /**
   * Get day of month (1-31)
   * 
   * Example:
   * ```typescript
   * adapter.getDate(new Date('2026-02-21')); // → 21
   * ```
   */
  getDate(date: Date): number;

  /**
   * Get day of week (0-6, where 0 = Sunday)
   * 
   * Example:
   * ```typescript
   * adapter.getDay(new Date('2026-02-21')); // → 6 (Saturday)
   * ```
   */
  getDay(date: Date): number;

  /**
   * Convert Date to ISO date string (YYYY-MM-DD)
   * 
   * CRITICAL: Must be timezone-safe!
   * DO NOT use date.toISOString() as it converts to UTC.
   * 
   * Example:
   * ```typescript
   * // Local timezone GMT-6 (CST)
   * const date = new Date('2026-02-21T23:00:00'); // 11 PM CST
   * 
   * // ❌ WRONG: date.toISOString().split('T')[0]
   * // Returns "2026-02-22" (shifted to UTC!)
   * 
   * // ✅ CORRECT: adapter.toISODate(date)
   * // Returns "2026-02-21" (local date preserved)
   * ```
   * 
   * @param date - Date to format (or null)
   * @returns ISO date string in YYYY-MM-DD format (local timezone), empty string if null
   */
  toISODate(date: Date | null): string;

  /**
   * Parse ISO date string (YYYY-MM-DD) to Date
   * 
   * CRITICAL: Must be timezone-safe!
   * DO NOT use new Date(isoString) as it may parse as UTC.
   * 
   * Example:
   * ```typescript
   * // ❌ WRONG: new Date('2026-02-21')
   * // May parse as UTC midnight, which is previous day in some timezones
   * 
   * // ✅ CORRECT: adapter.parseISODate('2026-02-21')
   * // Returns Date representing 2026-02-21 00:00:00 in local timezone
   * ```
   * 
   * @param isoDate - ISO date string (YYYY-MM-DD) or null
   * @returns Date object or null if invalid
   */
  parseISODate(isoDate: string | null): Date | null;

  /**
   * Get week start day for locale
   * 
   * 0 = Sunday, 1 = Monday, etc.
   * 
   * Example:
   * ```typescript
   * adapter.getWeekStart('en-US'); // → 0 (Sunday)
   * adapter.getWeekStart('en-GB'); // → 1 (Monday)
   * ```
   * 
   * @param locale - Locale string (e.g., 'en-US', 'es-ES')
   * @returns Day number (0-6)
   */
  getWeekStart(locale?: string): 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Injection token for DateAdapter
 * 
 * Default: NativeDateAdapter (zero dependencies)
 * 
 * Override for advanced timezone handling:
 * 
 * ```typescript
 * // Luxon with timezone
 * import { LuxonDateAdapter } from '@oneluiz/dual-datepicker/luxon';
 * 
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     {
 *       provide: DATE_ADAPTER,
 *       useClass: LuxonDateAdapter
 *     }
 *   ]
 * });
 * ```
 * 
 * Custom implementation:
 * 
 * ```typescript
 * class CustomDateAdapter implements DateAdapter {
 *   // Your implementation for backend-specific date handling
 * }
 * 
 * provide(DATE_ADAPTER, { useClass: CustomDateAdapter });
 * ```
 */
export const DATE_ADAPTER = new InjectionToken<DateAdapter>('DATE_ADAPTER');
