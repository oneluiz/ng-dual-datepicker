/**
 * Range Highlighter Types
 * 
 * Type definitions for calendar cell decorations with range highlighting.
 * Used by RangeHighlighter to cache decorated grids and avoid recomputations.
 * 
 * @module core/calendar-grid/range-highlighter.types
 * @version 3.8.0
 */

import { CalendarCell, CalendarGrid } from './calendar-grid.types';

/**
 * Calendar cell with range highlight decorations
 * 
 * Extends base CalendarCell with computed properties for:
 * - Start/end markers (selected range boundaries)
 * - Range membership (cell within selected range)
 * - Hover preview (temporary range during mouse hover)
 * - Disabled state (constraints, custom predicates)
 */
export interface DecoratedCell extends CalendarCell {
  /**
   * True if this cell is the selected start date
   */
  isSelectedStart: boolean;

  /**
   * True if this cell is the selected end date
   */
  isSelectedEnd: boolean;

  /**
   * True if this cell is within the selected range (inclusive)
   */
  isInRange: boolean;

  /**
   * True if this cell is within the hover preview range
   */
  isInHoverRange: boolean;

  /**
   * True if this cell is disabled (via constraints or custom logic)
   */
  isDisabled: boolean;
}

/**
 * Calendar grid with decorated cells
 * 
 * Contains:
 * - base: Original CalendarGrid (from CalendarGridCache)
 * - weeks: 2D array of decorated cells (6 × 7)
 * - cells: Flat array of decorated cells (42 cells)
 */
export interface DecoratedGrid {
  /**
   * Base grid structure (memoized by CalendarGridCache)
   */
  base: CalendarGrid;

  /**
   * Decorated cells organized as weeks (6 weeks × 7 days)
   */
  weeks: DecoratedCell[][];

  /**
   * Decorated cells as flat array (42 cells for layout stability)
   */
  cells: DecoratedCell[];
}

/**
 * Parameters for range decoration
 * 
 * All dates must be Date objects (pre-parsed by component).
 * Cache key is built from ISO dates (via DateAdapter.toISODate).
 * 
 * Constraints:
 * - start/end: Selected range boundaries (null if not selected)
 * - minDate/maxDate: Hard constraints (optional, for future use)
 * - hoverDate: Current hover date (null if not hovering)
 * - disabledDates: Array of disabled dates OR function predicate
 */
export interface RangeDecorationParams {
  /**
   * Selected start date (null if not selected yet)
   */
  start: Date | null;

  /**
   * Selected end date (null if not selected yet)
   */
  end: Date | null;

  /**
   * Minimum allowed date (optional, for future constraint support)
   * All dates before this will be disabled.
   */
  minDate?: Date | null;

  /**
   * Maximum allowed date (optional, for future constraint support)
   * All dates after this will be disabled.
   */
  maxDate?: Date | null;

  /**
   * Current hover date (null if not hovering)
   * Used to calculate hover preview range.
   */
  hoverDate?: string | null;

  /**
   * Disabled dates specification
   * 
   * Can be one of:
   * - Array of Date objects to disable (exact matches)
   * - Function predicate (date) => boolean
   * - undefined/null (no dates disabled)
   * 
   * NOTE: Functions cannot be cached reliably (no stable key).
   * If using function, cache will be bypassed for isDisabled computation.
   */
  disabledDates?: Date[] | ((date: Date) => boolean) | null;

  /**
   * Multi-range mode flag (affects hover range behavior)
   * Default: false
   */
  multiRange?: boolean;

  /**
   * Currently selecting start date (affects hover preview)
   * Default: false
   */
  selectingStartDate?: boolean;
}

/**
 * Cache key for decorated grid
 * 
 * Built from:
 * - monthKey: `${year}-${month}-${weekStart}-${locale}`
 * - startISO, endISO: ISO dates or 'null'
 * - minISO, maxISO: ISO dates or 'null' (optional)
 * - hoverISO: ISO date or 'null'
 * - disabledSignature: Hash of disabled dates (or 'none' / 'function')
 * 
 * Example:
 * "2026-1-0-|2026-01-15|2026-01-25|null|null|2026-01-20|2026-01-10,2026-01-11"
 * 
 * Segment breakdown:
 * 1. 2026-1-0- (month: Jan 2026, weekStart: Sunday, no locale)
 * 2. 2026-01-15 (start date)
 * 3. 2026-01-25 (end date)
 * 4. null (no minDate)
 * 5. null (no maxDate)
 * 6. 2026-01-20 (hovering over Jan 20)
 * 7. 2026-01-10,2026-01-11 (disabled dates: Jan 10 & 11)
 */
export interface DecoratedGridCacheKey {
  /**
   * Combined month key (from base grid)
   */
  monthKey: string;

  /**
   * Start date ISO (YYYY-MM-DD) or 'null'
   */
  startISO: string;

  /**
   * End date ISO (YYYY-MM-DD) or 'null'
   */
  endISO: string;

  /**
   * Min date ISO (YYYY-MM-DD) or 'null'
   */
  minISO: string;

  /**
   * Max date ISO (YYYY-MM-DD) or 'null'
   */
  maxISO: string;

  /**
   * Hover date ISO (YYYY-MM-DD) or 'null'
   */
  hoverISO: string;

  /**
   * Disabled dates signature
   * 
   * - 'none': No dates disabled
   * - 'function': Using predicate function (not cacheable)
   * - sorted ISO string: "2026-01-10,2026-01-11,..." (for array)
   */
  disabledSignature: string;

  /**
   * Full cache key (concatenation of all segments)
   */
  full: string;
}
