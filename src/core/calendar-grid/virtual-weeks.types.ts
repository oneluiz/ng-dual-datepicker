/**
 * Virtual Weeks Types
 * 
 * Type definitions for windowed week rendering (virtual scrolling).
 * Reduces DOM nodes by rendering only visible weeks instead of full month.
 * 
 * @module core/calendar-grid/virtual-weeks.types
 * @version 3.9.0
 */

/**
 * Virtual weeks configuration
 * 
 * Controls how many weeks to render at once (windowed rendering).
 * Reduces DOM complexity for better mobile performance.
 * 
 * Example:
 * ```typescript
 * <ngx-dual-datepicker
 *   [virtualWeeks]="{ windowSize: 3 }"
 * </ngx-dual-datepicker>
 * ```
 * 
 * With windowSize=3:
 * - Renders only 3 weeks at a time (21 cells vs 42 cells)
 * - User can navigate between week windows
 * - ~50% reduction in DOM nodes per calendar
 * - ~50% reduction in reflow/repaint cost
 */
export interface VirtualWeeksConfig {
  /**
   * Number of weeks to render at once
   * 
   * Default: undefined (render all 6 weeks - backward compatible)
   * 
   * Recommended values:
   * - 3: Good balance (21 cells)
   * - 4: More context (28 cells)
   * - 2: Minimal (14 cells, may feel cramped)
   */
  windowSize: number;
}

/**
 * Virtual week window state
 * 
 * Tracks which weeks are currently visible in the window.
 * Managed by component signals.
 */
export interface VirtualWeekWindow {
  /**
   * Start index of visible week range (0-based)
   * 
   * Range: [0, totalWeeks - windowSize]
   */
  startIndex: number;

  /**
   * Window size (how many weeks visible)
   */
  windowSize: number;

  /**
   * Total weeks available in month (usually 6, sometimes 5)
   */
  totalWeeks: number;

  /**
   * Whether user can scroll/navigate up (to earlier weeks)
   */
  canNavigateUp: boolean;

  /**
   * Whether user can scroll/navigate down (to later weeks)
   */
  canNavigateDown: boolean;
}
