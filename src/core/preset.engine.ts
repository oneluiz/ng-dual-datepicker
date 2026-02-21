/**
 * Headless Preset Engine
 * Pure functions that resolve date ranges WITHOUT render dependency
 * Perfect for SSR, global state, dashboard filters
 * 
 * v3.5.0: SSR-Safe via Clock Injection
 * All date calculations use DateClock instead of new Date()
 * This ensures server and client resolve identical presets
 * 
 * v3.5.1: Timezone-Safe via DateAdapter
 * All date operations use DateAdapter for consistent behavior
 * Fixes timezone bugs common in ERP/BI/POS systems
 */

import { Injectable, inject, Optional } from '@angular/core';
import { DateClock, DATE_CLOCK } from './date-clock';
import { SystemClock } from './system-clock';
import { DateAdapter, DATE_ADAPTER } from './date-adapter';
import { NativeDateAdapter } from './native-date-adapter';

export interface RangePreset {
  /**
   * Resolve preset to actual date range
   * @param now - Current date for deterministic calculation
   */
  resolve(now: Date): { start: Date; end: Date };
}

export interface PresetRange {
  start: string; // ISO format
  end: string; // ISO format
}

/**
 * Registry of built-in presets
 * Can be extended by consumers
 * 
 * SSR-Safe Architecture:
 * - Injects DateClock via DI
 * - All presets use clock.now() instead of new Date()
 * - Deterministic: same clock.now() → same preset
 * - Override DATE_CLOCK token in SSR to ensure consistency
 * 
 * Timezone-Safe Architecture:
 * - Injects DateAdapter via DI
 * - All date operations use adapter methods
 * - Prevents timezone bugs in cross-timezone scenarios
 * - Override DATE_ADAPTER for Luxon/DayJS/custom implementations
 */
@Injectable({
  providedIn: 'root'
})
export class PresetEngine {
  private presets = new Map<string, RangePreset>();
  private clock: DateClock;
  private adapter: DateAdapter;

  constructor() {
    // Try to inject DATE_CLOCK, fallback to SystemClock if not provided
    try {
      this.clock = inject(DATE_CLOCK, { optional: true }) ?? new SystemClock();
    } catch {
      // In case inject() fails (e.g., called outside injection context)
      this.clock = new SystemClock();
    }

    // Try to inject DATE_ADAPTER, fallback to NativeDateAdapter if not provided
    try {
      this.adapter = inject(DATE_ADAPTER, { optional: true }) ?? new NativeDateAdapter();
    } catch {
      // In case inject() fails (e.g., called outside injection context)
      this.adapter = new NativeDateAdapter();
    }

    this.registerBuiltInPresets();
  }

  /**
   * Register a custom preset
   */
  register(key: string, preset: RangePreset): void {
    this.presets.set(key, preset);
  }

  /**
   * Resolve a preset to date range
   * 
   * SSR Note: Uses injected DateClock for deterministic resolution
   * Timezone Note: Uses injected DateAdapter for consistent date operations
   * 
   * Override tokens in SSR scenarios:
   * - DATE_CLOCK: Control current time
   * - DATE_ADAPTER: Control date operations (e.g., Luxon for timezone support)
   * 
   * @param key - Preset key (e.g., 'TODAY', 'LAST_7_DAYS')
   * @param now - Optional override for current date (defaults to clock.now())
   */
  resolve(key: string, now?: Date): PresetRange | null {
    const preset = this.presets.get(key);
    if (!preset) return null;

    const currentDate = now ?? this.clock.now();
    const { start, end } = preset.resolve(currentDate);
    return {
      start: this.adapter.toISODate(start),
      end: this.adapter.toISODate(end)
    };
  }

  /**
   * Get all available preset keys
   */
  getPresetKeys(): string[] {
    return Array.from(this.presets.keys());
  }

  /**
   * Register all built-in presets
   * 
   * All presets now use DateAdapter for timezone-safe operations
   */
  private registerBuiltInPresets(): void {
    const adapter = this.adapter;

    // Today
    this.register('TODAY', {
      resolve: (now) => {
        const normalized = adapter.normalize(now);
        return { start: normalized, end: normalized };
      }
    });

    // Yesterday
    this.register('YESTERDAY', {
      resolve: (now) => {
        const date = adapter.addDays(now, -1);
        return { start: date, end: date };
      }
    });

    // Last N Days
    this.register('LAST_7_DAYS', {
      resolve: (now) => {
        const end = adapter.normalize(now);
        const start = adapter.addDays(now, -6);
        return { start, end };
      }
    });

    this.register('LAST_14_DAYS', {
      resolve: (now) => {
        const end = adapter.normalize(now);
        const start = adapter.addDays(now, -13);
        return { start, end };
      }
    });

    this.register('LAST_30_DAYS', {
      resolve: (now) => {
        const end = adapter.normalize(now);
        const start = adapter.addDays(now, -29);
        return { start, end };
      }
    });

    this.register('LAST_60_DAYS', {
      resolve: (now) => {
        const end = adapter.normalize(now);
        const start = adapter.addDays(now, -59);
        return { start, end };
      }
    });

    this.register('LAST_90_DAYS', {
      resolve: (now) => {
        const end = adapter.normalize(now);
        const start = adapter.addDays(now, -89);
        return { start, end };
      }
    });

    // This Week (Monday to Sunday)
    this.register('THIS_WEEK', {
      resolve: (now) => {
        const dayOfWeek = adapter.getDay(now);
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const start = adapter.addDays(now, -daysToMonday);
        const end = adapter.addDays(start, 6);
        return { start, end };
      }
    });

    // Last Week
    this.register('LAST_WEEK', {
      resolve: (now) => {
        const dayOfWeek = adapter.getDay(now);
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const lastMonday = adapter.addDays(now, -daysToMonday - 7);
        const lastSunday = adapter.addDays(lastMonday, 6);
        return { start: lastMonday, end: lastSunday };
      }
    });

    // This Month
    this.register('THIS_MONTH', {
      resolve: (now) => {
        const start = adapter.startOfMonth(now);
        const end = adapter.endOfMonth(now);
        return { start, end };
      }
    });

    // Last Month
    this.register('LAST_MONTH', {
      resolve: (now) => {
        const lastMonth = adapter.addMonths(now, -1);
        const start = adapter.startOfMonth(lastMonth);
        const end = adapter.endOfMonth(lastMonth);
        return { start, end };
      }
    });

    // Month to Date
    this.register('MONTH_TO_DATE', {
      resolve: (now) => {
        const start = adapter.startOfMonth(now);
        const end = adapter.normalize(now);
        return { start, end };
      }
    });

    // This Quarter
    this.register('THIS_QUARTER', {
      resolve: (now) => {
        const currentMonth = adapter.getMonth(now);
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        const year = adapter.getYear(now);
        
        // Construct start of quarter
        const start = new Date(year, quarterStartMonth, 1);
        const normalizedStart = adapter.normalize(start);
        
        // Construct end of quarter (last day of 3rd month)
        const end = new Date(year, quarterStartMonth + 3, 0);
        const normalizedEnd = adapter.normalize(end);
        
        return { start: normalizedStart, end: normalizedEnd };
      }
    });

    // Last Quarter
    this.register('LAST_QUARTER', {
      resolve: (now) => {
        const currentMonth = adapter.getMonth(now);
        const lastQuarterStartMonth = Math.floor(currentMonth / 3) * 3 - 3;
        const year = adapter.getYear(now);
        
        // Handle year rollover (Q1 - 1 = Q4 of previous year)
        const adjustedYear = lastQuarterStartMonth < 0 ? year - 1 : year;
        const adjustedMonth = lastQuarterStartMonth < 0 ? 9 : lastQuarterStartMonth;
        
        const start = new Date(adjustedYear, adjustedMonth, 1);
        const normalizedStart = adapter.normalize(start);
        
        const end = new Date(adjustedYear, adjustedMonth + 3, 0);
        const normalizedEnd = adapter.normalize(end);
        
        return { start: normalizedStart, end: normalizedEnd };
      }
    });

    // Quarter to Date
    this.register('QUARTER_TO_DATE', {
      resolve: (now) => {
        const currentMonth = adapter.getMonth(now);
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        const year = adapter.getYear(now);
        
        const start = new Date(year, quarterStartMonth, 1);
        const normalizedStart = adapter.normalize(start);
        const end = adapter.normalize(now);
        
        return { start: normalizedStart, end };
      }
    });

    // This Year
    this.register('THIS_YEAR', {
      resolve: (now) => {
        const year = adapter.getYear(now);
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        return { 
          start: adapter.normalize(start), 
          end: adapter.normalize(end) 
        };
      }
    });

    // Last Year
    this.register('LAST_YEAR', {
      resolve: (now) => {
        const year = adapter.getYear(now);
        const start = new Date(year - 1, 0, 1);
        const end = new Date(year - 1, 11, 31);
        return { 
          start: adapter.normalize(start), 
          end: adapter.normalize(end) 
        };
      }
    });

    // Year to Date
    this.register('YEAR_TO_DATE', {
      resolve: (now) => {
        const year = adapter.getYear(now);
        const start = new Date(year, 0, 1);
        const end = adapter.normalize(now);
        return { start: adapter.normalize(start), end };
      }
    });
  }
}

/**
 * Create a custom preset from a function
 */
export function createPreset(
  resolver: (now: Date) => { start: Date; end: Date }
): RangePreset {
  return { resolve: resolver };
}

/**
 * @deprecated Use dependency injection instead:
 * ```typescript
 * private engine = inject(PresetEngine);
 * ```
 * 
 * Singleton preset engine instance for backward compatibility
 * 
 * WARNING: This singleton uses SystemClock directly and is NOT SSR-safe.
 * For SSR applications, inject PresetEngine and override DATE_CLOCK token.
 * 
 * This export will be removed in v4.0.0
 */
export const presetEngine = new PresetEngine();
