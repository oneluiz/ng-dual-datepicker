/**
 * Built-in Date Range Preset Plugins
 * 
 * Version: 3.6.0
 * 
 * Standard presets provided by the library.
 * All presets use DateClock and DateAdapter for SSR-safety and timezone-safety.
 * 
 * PRESETS INCLUDED:
 * - TODAY, YESTERDAY
 * - LAST_7_DAYS, LAST_14_DAYS, LAST_30_DAYS, LAST_60_DAYS, LAST_90_DAYS
 * - THIS_WEEK, LAST_WEEK
 * - THIS_MONTH, LAST_MONTH, MONTH_TO_DATE
 * - THIS_QUARTER, LAST_QUARTER, QUARTER_TO_DATE
 * - THIS_YEAR, LAST_YEAR, YEAR_TO_DATE
 */

import { RangePresetPlugin } from './range-preset.plugin';

/**
 * TODAY - Current day
 */
export const TODAY_PRESET: RangePresetPlugin = {
  key: 'TODAY',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const normalized = adapter.normalize(now);
    return { start: normalized, end: normalized };
  }
};

/**
 * YESTERDAY - Previous day
 */
export const YESTERDAY_PRESET: RangePresetPlugin = {
  key: 'YESTERDAY',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const date = adapter.addDays(now, -1);
    return { start: date, end: date };
  }
};

/**
 * LAST_7_DAYS - Last 7 days including today
 */
export const LAST_7_DAYS_PRESET: RangePresetPlugin = {
  key: 'LAST_7_DAYS',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const end = adapter.normalize(now);
    const start = adapter.addDays(now, -6);
    return { start, end };
  }
};

/**
 * LAST_14_DAYS - Last 14 days including today
 */
export const LAST_14_DAYS_PRESET: RangePresetPlugin = {
  key: 'LAST_14_DAYS',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const end = adapter.normalize(now);
    const start = adapter.addDays(now, -13);
    return { start, end };
  }
};

/**
 * LAST_30_DAYS - Last 30 days including today
 */
export const LAST_30_DAYS_PRESET: RangePresetPlugin = {
  key: 'LAST_30_DAYS',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const end = adapter.normalize(now);
    const start = adapter.addDays(now, -29);
    return { start, end };
  }
};

/**
 * LAST_60_DAYS - Last 60 days including today
 */
export const LAST_60_DAYS_PRESET: RangePresetPlugin = {
  key: 'LAST_60_DAYS',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const end = adapter.normalize(now);
    const start = adapter.addDays(now, -59);
    return { start, end };
  }
};

/**
 * LAST_90_DAYS - Last 90 days including today
 */
export const LAST_90_DAYS_PRESET: RangePresetPlugin = {
  key: 'LAST_90_DAYS',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const end = adapter.normalize(now);
    const start = adapter.addDays(now, -89);
    return { start, end };
  }
};

/**
 * THIS_WEEK - Current week (Monday to Sunday)
 */
export const THIS_WEEK_PRESET: RangePresetPlugin = {
  key: 'THIS_WEEK',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const dayOfWeek = adapter.getDay(now);
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const start = adapter.addDays(now, -daysToMonday);
    const end = adapter.addDays(start, 6);
    return { start, end };
  }
};

/**
 * LAST_WEEK - Previous week (Monday to Sunday)
 */
export const LAST_WEEK_PRESET: RangePresetPlugin = {
  key: 'LAST_WEEK',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const dayOfWeek = adapter.getDay(now);
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = adapter.addDays(now, -daysToMonday - 7);
    const lastSunday = adapter.addDays(lastMonday, 6);
    return { start: lastMonday, end: lastSunday };
  }
};

/**
 * THIS_MONTH - Current calendar month (1st to last day)
 */
export const THIS_MONTH_PRESET: RangePresetPlugin = {
  key: 'THIS_MONTH',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const start = adapter.startOfMonth(now);
    const end = adapter.endOfMonth(now);
    return { start, end };
  }
};

/**
 * LAST_MONTH - Previous calendar month
 */
export const LAST_MONTH_PRESET: RangePresetPlugin = {
  key: 'LAST_MONTH',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const lastMonth = adapter.addMonths(now, -1);
    const start = adapter.startOfMonth(lastMonth);
    const end = adapter.endOfMonth(lastMonth);
    return { start, end };
  }
};

/**
 * MONTH_TO_DATE - From start of current month to today
 */
export const MONTH_TO_DATE_PRESET: RangePresetPlugin = {
  key: 'MONTH_TO_DATE',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const start = adapter.startOfMonth(now);
    const end = adapter.normalize(now);
    return { start, end };
  }
};

/**
 * THIS_QUARTER - Current quarter (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec)
 */
export const THIS_QUARTER_PRESET: RangePresetPlugin = {
  key: 'THIS_QUARTER',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const currentMonth = adapter.getMonth(now);
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
    const year = adapter.getYear(now);
    
    const start = new Date(year, quarterStartMonth, 1);
    const normalizedStart = adapter.normalize(start);
    
    const end = new Date(year, quarterStartMonth + 3, 0);
    const normalizedEnd = adapter.normalize(end);
    
    return { start: normalizedStart, end: normalizedEnd };
  }
};

/**
 * LAST_QUARTER - Previous quarter
 */
export const LAST_QUARTER_PRESET: RangePresetPlugin = {
  key: 'LAST_QUARTER',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const currentMonth = adapter.getMonth(now);
    const lastQuarterStartMonth = Math.floor(currentMonth / 3) * 3 - 3;
    const year = adapter.getYear(now);
    
    const adjustedYear = lastQuarterStartMonth < 0 ? year - 1 : year;
    const adjustedMonth = lastQuarterStartMonth < 0 ? 9 : lastQuarterStartMonth;
    
    const start = new Date(adjustedYear, adjustedMonth, 1);
    const normalizedStart = adapter.normalize(start);
    
    const end = new Date(adjustedYear, adjustedMonth + 3, 0);
    const normalizedEnd = adapter.normalize(end);
    
    return { start: normalizedStart, end: normalizedEnd };
  }
};

/**
 * QUARTER_TO_DATE - From start of current quarter to today
 */
export const QUARTER_TO_DATE_PRESET: RangePresetPlugin = {
  key: 'QUARTER_TO_DATE',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const currentMonth = adapter.getMonth(now);
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
    const year = adapter.getYear(now);
    
    const start = new Date(year, quarterStartMonth, 1);
    const normalizedStart = adapter.normalize(start);
    const end = adapter.normalize(now);
    
    return { start: normalizedStart, end };
  }
};

/**
 * THIS_YEAR - Current calendar year (Jan 1 to Dec 31)
 */
export const THIS_YEAR_PRESET: RangePresetPlugin = {
  key: 'THIS_YEAR',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const year = adapter.getYear(now);
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    return { 
      start: adapter.normalize(start), 
      end: adapter.normalize(end) 
    };
  }
};

/**
 * LAST_YEAR - Previous calendar year
 */
export const LAST_YEAR_PRESET: RangePresetPlugin = {
  key: 'LAST_YEAR',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const year = adapter.getYear(now);
    const start = new Date(year - 1, 0, 1);
    const end = new Date(year - 1, 11, 31);
    return { 
      start: adapter.normalize(start), 
      end: adapter.normalize(end) 
    };
  }
};

/**
 * YEAR_TO_DATE - From start of current year to today
 */
export const YEAR_TO_DATE_PRESET: RangePresetPlugin = {
  key: 'YEAR_TO_DATE',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const year = adapter.getYear(now);
    const start = new Date(year, 0, 1);
    const end = adapter.normalize(now);
    return { start: adapter.normalize(start), end };
  }
};

/**
 * All built-in presets as an array
 * 
 * Use this to register all built-in presets at once:
 * ```typescript
 * BUILT_IN_PRESETS.forEach(preset => registry.register(preset));
 * ```
 */
export const BUILT_IN_PRESETS: RangePresetPlugin[] = [
  TODAY_PRESET,
  YESTERDAY_PRESET,
  LAST_7_DAYS_PRESET,
  LAST_14_DAYS_PRESET,
  LAST_30_DAYS_PRESET,
  LAST_60_DAYS_PRESET,
  LAST_90_DAYS_PRESET,
  THIS_WEEK_PRESET,
  LAST_WEEK_PRESET,
  THIS_MONTH_PRESET,
  LAST_MONTH_PRESET,
  MONTH_TO_DATE_PRESET,
  THIS_QUARTER_PRESET,
  LAST_QUARTER_PRESET,
  QUARTER_TO_DATE_PRESET,
  THIS_YEAR_PRESET,
  LAST_YEAR_PRESET,
  YEAR_TO_DATE_PRESET
];
