/**
 * Calendar Grid Types
 *
 * Defines the structure for memoized calendar month grids.
 * Separates base grid structure (cacheable) from decorations (dynamic).
 */

/**
 * A single calendar cell representing one day
 */
export interface CalendarCell {
  /** Date object (normalized to start of day) */
  date: Date;

  /** Whether this day belongs to the current rendered month */
  inCurrentMonth: boolean;

  /** ISO string 'YYYY-MM-DD' (timezone-safe via DateAdapter) */
  iso: string;

  /** Day of month (1-31) */
  day: number;

  /** Month (0-11, JavaScript convention) */
  month: number;

  /** Full year */
  year: number;

  /** Day of week (0 = Sunday, 6 = Saturday) */
  dayOfWeek: number;
}

/**
 * A calendar grid representing one month
 *
 * Grid is always 6 weeks x 7 days (42 cells) for layout stability.
 * Includes padding days from previous/next month.
 */
export interface CalendarGrid {
  /** Month identifier */
  month: {
    /** Year */
    year: number;
    /** Month 0-11 */
    month: number;
  };

  /** Week start day (0 = Sunday, 1 = Monday, etc.) */
  weekStart: number;

  /** Locale (for future i18n, optional) */
  locale?: string;

  /** 6 weeks x 7 days matrix */
  weeks: CalendarCell[][];

  /** Flat array of all cells (convenience accessor) */
  cells: CalendarCell[];
}

/**
 * Cache key for calendar grids
 */
export interface CalendarGridCacheKey {
  year: number;
  month: number;
  weekStart: number;
  locale?: string;
}
