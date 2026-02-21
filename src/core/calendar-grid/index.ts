/**
 * Calendar Grid Module
 *
 * Performance-optimized calendar month grid generation with memoization.
 *
 * v3.7.0: Grid Structure Cache
 * - CalendarGridFactory for deterministic 42-cell grids
 * - CalendarGridCache with LRU (24 months)
 * 
 * v3.8.0: Range Highlight Cache
 * - RangeHighlighter for decoration logic
 * - RangeHighlighterCache with LRU (48 grids)
 * - Separates grid structure from decorations
 *
 * Usage:
 * ```typescript
 * constructor(
 *   private gridCache: CalendarGridCache,
 *   private highlighterCache: RangeHighlighterCache
 * ) {}
 *
 * const grid = this.gridCache.get(monthDate, weekStart);
 * const decorated = this.highlighterCache.get(grid, {
 *   start, end, hoverDate, disabledDates
 * });
 * // decorated.cells[0].iso => '2026-02-01'
 * // decorated.cells[0].isInRange => true
 * ```
 */

export * from './calendar-grid.types';
export * from './calendar-grid.factory';
export * from './calendar-grid.cache';
export * from './range-highlighter.types';
export * from './range-highlighter';
export * from './range-highlighter.cache';
