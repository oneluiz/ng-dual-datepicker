/**
 * Native Date Adapter Implementation
 * 
 * Default adapter using JavaScript Date with timezone-safe operations.
 * 
 * Zero dependencies. Conservative implementation that:
 * - Normalizes all dates to start of day (00:00:00.000)
 * - Uses manual YYYY-MM-DD construction (avoids toISOString() timezone shift)
 * - Parses ISO dates to local timezone (avoids UTC interpretation)
 * - Handles month overflow correctly (Jan 31 + 1 month = Feb 28, not Mar 3)
 * - All comparisons work on normalized dates
 * 
 * Limitations:
 * - No timezone awareness (all operations in local timezone)
 * - No DST-safe calculations across timezone changes
 * - For advanced timezone needs, use LuxonDateAdapter or DayJSDateAdapter
 * 
 * Perfect for:
 * ✅ Most enterprise apps (ERP, POS, BI) where local timezone is sufficient
 * ✅ Applications without cross-timezone requirements
 * ✅ Minimizing bundle size (zero deps)
 * ✅ Simple, predictable date handling
 */

import { Injectable } from '@angular/core';
import { DateAdapter } from './date-adapter';

@Injectable({
  providedIn: 'root'
})
export class NativeDateAdapter implements DateAdapter {
  /**
   * Normalize date to start of day (00:00:00.000) in local timezone
   * 
   * This is the foundation of timezone-safe operations.
   * All other methods use normalized dates for comparisons.
   */
  normalize(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  /**
   * Check if two dates are the same calendar day
   * 
   * Implementation: Compare YYYY-MM-DD components directly
   * Avoids timezone issues from valueOf() comparisons
   */
  isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  /**
   * Check if date A is before date B (calendar day level)
   * 
   * Implementation: Compare normalized dates using valueOf()
   */
  isBeforeDay(a: Date, b: Date): boolean {
    return this.normalize(a).valueOf() < this.normalize(b).valueOf();
  }

  /**
   * Check if date A is after date B (calendar day level)
   * 
   * Implementation: Compare normalized dates using valueOf()
   */
  isAfterDay(a: Date, b: Date): boolean {
    return this.normalize(a).valueOf() > this.normalize(b).valueOf();
  }

  /**
   * Add days to a date
   * 
   * Implementation: Use setDate() which handles month rollover automatically
   * 
   * Example:
   * Jan 31 + 3 days → Feb 3 ✅
   * Feb 28 + 1 day → Mar 1 ✅ (non-leap year)
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return this.normalize(result);
  }

  /**
   * Add months to a date
   * 
   * CRITICAL: Handles month overflow correctly
   * 
   * Algorithm:
   * 1. Add months using setMonth()
   * 2. If day-of-month changed (overflow), set to last day of target month
   * 
   * Examples:
   * - Jan 31 + 1 month → Feb 28 (or Feb 29 in leap year) ✅
   * - Jan 31 + 2 months → Mar 31 ✅
   * - Mar 31 + 1 month → Apr 30 ✅
   * - Dec 31 + 1 month → Jan 31 (next year) ✅
   */
  addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    const originalDay = result.getDate();
    
    // Add months
    result.setMonth(result.getMonth() + months);
    
    // Check for day overflow (e.g., Jan 31 → Feb 31 becomes Mar 3)
    if (result.getDate() !== originalDay) {
      // Overflow detected: set to last day of target month
      // Go to 1st of next month, then subtract 1 day
      result.setDate(0); // Sets to last day of previous month
    }
    
    return this.normalize(result);
  }

  /**
   * Get start of day (00:00:00.000)
   * 
   * Alias for normalize() with explicit intent
   */
  startOfDay(date: Date): Date {
    return this.normalize(date);
  }

  /**
   * Get end of day (23:59:59.999)
   * 
   * Useful for inclusive range queries
   */
  endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get first day of month (00:00:00.000)
   */
  startOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setDate(1);
    return this.normalize(result);
  }

  /**
   * Get last day of month (23:59:59.999)
   * 
   * Algorithm: Go to 1st of next month, subtract 1 day
   */
  endOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0); // Day 0 = last day of previous month
    return this.endOfDay(result);
  }

  /**
   * Get year (4-digit)
   */
  getYear(date: Date): number {
    return date.getFullYear();
  }

  /**
   * Get month (0-11)
   */
  getMonth(date: Date): number {
    return date.getMonth();
  }

  /**
   * Get day of month (1-31)
   */
  getDate(date: Date): number {
    return date.getDate();
  }

  /**
   * Get day of week (0-6, Sunday=0)
   */
  getDay(date: Date): number {
    return date.getDay();
  }

  /**
   * Convert Date to ISO date string (YYYY-MM-DD)
   * 
   * CRITICAL: DO NOT use toISOString() - it converts to UTC!
   * 
   * Manual construction ensures local timezone is preserved:
   * 
   * Example problem with toISOString():
   * ```
   * // Local timezone: GMT-6 (CST)
   * const date = new Date('2026-02-21T23:00:00'); // 11 PM Feb 21 local
   * 
   * // WRONG ❌
   * date.toISOString().split('T')[0]
   * // Returns "2026-02-22" (converted to UTC = Feb 22 05:00 AM)
   * 
   * // CORRECT ✅
   * toISODate(date)
   * // Returns "2026-02-21" (local date preserved)
   * ```
   * 
   * Implementation: Build YYYY-MM-DD manually from local date components
   */
  toISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse ISO date string (YYYY-MM-DD) to Date
   * 
   * CRITICAL: DO NOT use new Date(isoString) - may parse as UTC!
   * 
   * Example problem with Date constructor:
   * ```
   * // Local timezone: GMT-6 (CST)
   * 
   * // WRONG ❌
   * new Date('2026-02-21')
   * // Parsed as UTC: 2026-02-21T00:00:00Z
   * // In local timezone: Feb 20, 2026 6:00 PM (previous day!)
   * 
   * // CORRECT ✅
   * parseISODate('2026-02-21')
   * // Returns: 2026-02-21T00:00:00 local time
   * ```
   * 
   * Implementation: Parse components and construct Date in local timezone
   */
  parseISODate(isoDate: string): Date | null {
    if (!isoDate || typeof isoDate !== 'string') {
      return null;
    }

    // Match YYYY-MM-DD format
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
    
    if (!match) {
      return null;
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed
    const day = parseInt(match[3], 10);

    // Validate ranges
    if (month < 0 || month > 11) {
      return null;
    }

    if (day < 1 || day > 31) {
      return null;
    }

    // Construct date in local timezone
    const date = new Date(year, month, day);
    
    // Verify date is valid (e.g., Feb 31 would roll to Mar 3)
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return this.normalize(date);
  }

  /**
   * Get week start day for locale
   * 
   * Default: Sunday (0) for most locales
   * Monday (1) for Europe, ISO 8601
   * 
   * Implementation: Simple locale detection
   * For advanced needs, use Intl.Locale or external library
   */
  getWeekStart(locale?: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
    if (!locale) {
      locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    }

    // ISO 8601: Monday start
    const mondayStartLocales = [
      'en-GB', 'en-IE', 'en-AU', 'en-NZ', 'en-CA',
      'es', 'es-ES', 'es-MX',
      'fr', 'fr-FR', 'fr-CA',
      'de', 'de-DE', 'de-AT', 'de-CH',
      'it', 'it-IT',
      'pt', 'pt-PT', 'pt-BR',
      'nl', 'nl-NL', 'nl-BE',
      'ru', 'ru-RU',
      'zh', 'zh-CN', 'zh-TW',
      'ja', 'ja-JP',
      'ko', 'ko-KR'
    ];

    const normalizedLocale = locale.toLowerCase();
    const startsWithMonday = mondayStartLocales.some(loc => 
      normalizedLocale.startsWith(loc.toLowerCase())
    );

    return startsWithMonday ? 1 : 0;
  }
}
