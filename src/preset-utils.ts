import { PresetConfig, PresetRange } from './dual-datepicker.component';

/**
 * Utility functions for creating common date range presets
 * Perfect for dashboards, reporting, POS, BI apps, and ERP systems
 */

/**
 * Format a date as YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the start of today
 */
export function getToday(): PresetRange {
  const today = new Date();
  return {
    start: formatDate(today),
    end: formatDate(today)
  };
}

/**
 * Get yesterday's date range
 */
export function getYesterday(): PresetRange {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return {
    start: formatDate(yesterday),
    end: formatDate(yesterday)
  };
}

/**
 * Get last N days (including today)
 */
export function getLastNDays(days: number): PresetRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

/**
 * Get this week (Monday to Sunday)
 */
export function getThisWeek(): PresetRange {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const start = new Date(today);
  // Adjust to Monday (1) as first day of week
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  start.setDate(start.getDate() - daysToMonday);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

/**
 * Get last week (Monday to Sunday)
 */
export function getLastWeek(): PresetRange {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const lastMonday = new Date(today);
  lastMonday.setDate(lastMonday.getDate() - daysToMonday - 7);
  
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastSunday.getDate() + 6);
  
  return {
    start: formatDate(lastMonday),
    end: formatDate(lastSunday)
  };
}

/**
 * Get this month (1st to last day)
 */
export function getThisMonth(): PresetRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

/**
 * Get last month (1st to last day)
 */
export function getLastMonth(): PresetRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth(), 0);
  
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

/**
 * Get month to date (1st of current month to today)
 */
export function getMonthToDate(): PresetRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  
  return {
    start: formatDate(start),
    end: formatDate(today)
  };
}

/**
 * Get this quarter (Q1, Q2, Q3, or Q4)
 */
export function getThisQuarter(): PresetRange {
  const today = new Date();
  const currentMonth = today.getMonth();
  const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
  
  const start = new Date(today.getFullYear(), quarterStartMonth, 1);
  const end = new Date(today.getFullYear(), quarterStartMonth + 3, 0);
  
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

/**
 * Get last quarter
 */
export function getLastQuarter(): PresetRange {
  const today = new Date();
  const currentMonth = today.getMonth();
  const lastQuarterStartMonth = Math.floor(currentMonth / 3) * 3 - 3;
  
  const start = new Date(today.getFullYear(), lastQuarterStartMonth, 1);
  const end = new Date(today.getFullYear(), lastQuarterStartMonth + 3, 0);
  
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

/**
 * Get quarter to date (start of current quarter to today)
 */
export function getQuarterToDate(): PresetRange {
  const today = new Date();
  const currentMonth = today.getMonth();
  const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
  
  const start = new Date(today.getFullYear(), quarterStartMonth, 1);
  
  return {
    start: formatDate(start),
    end: formatDate(today)
  };
}

/**
 * Get this year (January 1 to December 31)
 */
export function getThisYear(): PresetRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);
  const end = new Date(today.getFullYear(), 11, 31);
  
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

/**
 * Get last year
 */
export function getLastYear(): PresetRange {
  const today = new Date();
  const start = new Date(today.getFullYear() - 1, 0, 1);
  const end = new Date(today.getFullYear() - 1, 11, 31);
  
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

/**
 * Get year to date (January 1 to today)
 */
export function getYearToDate(): PresetRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);
  
  return {
    start: formatDate(start),
    end: formatDate(today)
  };
}

/**
 * Get last N months (including current partial month)
 */
export function getLastNMonths(months: number): PresetRange {
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - months);
  
  return {
    start: formatDate(start),
    end: formatDate(today)
  };
}

/**
 * Get last N years
 */
export function getLastNYears(years: number): PresetRange {
  const today = new Date();
  const start = new Date(today);
  start.setFullYear(start.getFullYear() - years);
  
  return {
    start: formatDate(start),
    end: formatDate(today)
  };
}

/**
 * Pre-built preset configurations for common use cases
 * Import and use these directly in your component
 */
export const CommonPresets = {
  /**
   * Dashboard presets - Perfect for analytics dashboards
   */
  dashboard: [
    { label: 'Today', getValue: getToday },
    { label: 'Yesterday', getValue: getYesterday },
    { label: 'Last 7 days', getValue: () => getLastNDays(7) },
    { label: 'Last 30 days', getValue: () => getLastNDays(30) },
    { label: 'This month', getValue: getThisMonth },
    { label: 'Last month', getValue: getLastMonth }
  ] as PresetConfig[],

  /**
   * Reporting presets - Perfect for business reporting
   */
  reporting: [
    { label: 'Today', getValue: getToday },
    { label: 'This week', getValue: getThisWeek },
    { label: 'Last week', getValue: getLastWeek },
    { label: 'This month', getValue: getThisMonth },
    { label: 'Last month', getValue: getLastMonth },
    { label: 'This quarter', getValue: getThisQuarter },
    { label: 'Last quarter', getValue: getLastQuarter }
  ] as PresetConfig[],

  /**
   * Financial presets - Perfect for ERP and accounting systems
   */
  financial: [
    { label: 'Month to date', getValue: getMonthToDate },
    { label: 'Quarter to date', getValue: getQuarterToDate },
    { label: 'Year to date', getValue: getYearToDate },
    { label: 'Last month', getValue: getLastMonth },
    { label: 'Last quarter', getValue: getLastQuarter },
    { label: 'Last year', getValue: getLastYear }
  ] as PresetConfig[],

  /**
   * Analytics presets - Perfect for BI and data analysis
   */
  analytics: [
    { label: 'Last 7 days', getValue: () => getLastNDays(7) },
    { label: 'Last 14 days', getValue: () => getLastNDays(14) },
    { label: 'Last 30 days', getValue: () => getLastNDays(30) },
    { label: 'Last 60 days', getValue: () => getLastNDays(60) },
    { label: 'Last 90 days', getValue: () => getLastNDays(90) },
    { label: 'Last 180 days', getValue: () => getLastNDays(180) },
    { label: 'Last 365 days', getValue: () => getLastNDays(365) }
  ] as PresetConfig[],

  /**
   * Simple presets - Basic common ranges
   */
  simple: [
    { label: 'Today', getValue: getToday },
    { label: 'Last 7 days', getValue: () => getLastNDays(7) },
    { label: 'Last 30 days', getValue: () => getLastNDays(30) },
    { label: 'This year', getValue: getThisYear }
  ] as PresetConfig[]
};
