/**
 * Headless Preset Engine
 * Pure functions that resolve date ranges WITHOUT render dependency
 * Perfect for SSR, global state, dashboard filters
 */

import { formatISODate } from './range.validator';

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
 */
export class PresetEngine {
  private presets = new Map<string, RangePreset>();

  constructor() {
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
   */
  resolve(key: string, now: Date = new Date()): PresetRange | null {
    const preset = this.presets.get(key);
    if (!preset) return null;

    const { start, end } = preset.resolve(now);
    return {
      start: formatISODate(start),
      end: formatISODate(end)
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
   */
  private registerBuiltInPresets(): void {
    // Today
    this.register('TODAY', {
      resolve: (now) => ({ start: now, end: now })
    });

    // Yesterday
    this.register('YESTERDAY', {
      resolve: (now) => {
        const date = new Date(now);
        date.setDate(date.getDate() - 1);
        return { start: date, end: date };
      }
    });

    // Last N Days
    this.register('LAST_7_DAYS', {
      resolve: (now) => {
        const end = new Date(now);
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        return { start, end };
      }
    });

    this.register('LAST_14_DAYS', {
      resolve: (now) => {
        const end = new Date(now);
        const start = new Date(now);
        start.setDate(start.getDate() - 13);
        return { start, end };
      }
    });

    this.register('LAST_30_DAYS', {
      resolve: (now) => {
        const end = new Date(now);
        const start = new Date(now);
        start.setDate(start.getDate() - 29);
        return { start, end };
      }
    });

    this.register('LAST_60_DAYS', {
      resolve: (now) => {
        const end = new Date(now);
        const start = new Date(now);
        start.setDate(start.getDate() - 59);
        return { start, end };
      }
    });

    this.register('LAST_90_DAYS', {
      resolve: (now) => {
        const end = new Date(now);
        const start = new Date(now);
        start.setDate(start.getDate() - 89);
        return { start, end };
      }
    });

    // This Week (Monday to Sunday)
    this.register('THIS_WEEK', {
      resolve: (now) => {
        const dayOfWeek = now.getDay();
        const start = new Date(now);
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        start.setDate(start.getDate() - daysToMonday);

        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        return { start, end };
      }
    });

    // Last Week
    this.register('LAST_WEEK', {
      resolve: (now) => {
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        const lastMonday = new Date(now);
        lastMonday.setDate(lastMonday.getDate() - daysToMonday - 7);

        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastSunday.getDate() + 6);

        return { start: lastMonday, end: lastSunday };
      }
    });

    // This Month
    this.register('THIS_MONTH', {
      resolve: (now) => {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
      }
    });

    // Last Month
    this.register('LAST_MONTH', {
      resolve: (now) => {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start, end };
      }
    });

    // Month to Date
    this.register('MONTH_TO_DATE', {
      resolve: (now) => {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start, end: now };
      }
    });

    // This Quarter
    this.register('THIS_QUARTER', {
      resolve: (now) => {
        const currentMonth = now.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        const start = new Date(now.getFullYear(), quarterStartMonth, 1);
        const end = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
        return { start, end };
      }
    });

    // Last Quarter
    this.register('LAST_QUARTER', {
      resolve: (now) => {
        const currentMonth = now.getMonth();
        const lastQuarterStartMonth = Math.floor(currentMonth / 3) * 3 - 3;
        const start = new Date(now.getFullYear(), lastQuarterStartMonth, 1);
        const end = new Date(now.getFullYear(), lastQuarterStartMonth + 3, 0);
        return { start, end };
      }
    });

    // Quarter to Date
    this.register('QUARTER_TO_DATE', {
      resolve: (now) => {
        const currentMonth = now.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        const start = new Date(now.getFullYear(), quarterStartMonth, 1);
        return { start, end: now };
      }
    });

    // This Year
    this.register('THIS_YEAR', {
      resolve: (now) => {
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return { start, end };
      }
    });

    // Last Year
    this.register('LAST_YEAR', {
      resolve: (now) => {
        const start = new Date(now.getFullYear() - 1, 0, 1);
        const end = new Date(now.getFullYear() - 1, 11, 31);
        return { start, end };
      }
    });

    // Year to Date
    this.register('YEAR_TO_DATE', {
      resolve: (now) => {
        const start = new Date(now.getFullYear(), 0, 1);
        return { start, end: now };
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
 * Singleton preset engine instance
 */
export const presetEngine = new PresetEngine();
