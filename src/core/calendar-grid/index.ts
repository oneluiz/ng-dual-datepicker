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
 * v3.9.0: Virtual Weeks (Windowed Rendering)
 * - Virtual-weeks logic for reduced DOM complexity
 * - Render only visible weeks (configurable window)
 * - ~50% reduction in DOM nodes with windowSize=3
 * 
 * v3.9.2: Cache Bounds (Memory Safety)
 * - MAX_CACHE_ENTRIES = 48 prevents unbounded growth
 * - FIFO eviction for long-running sessions
 * - Critical for ERP, BI, hotel systems
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
 * 
 * // Optional: Windowed rendering (v3.9.0+)
 * const windowSize = 3; // Render only 3 weeks
 * const visibleWeeks = getVisibleWeeks(
 *   decorated.weeks, 
 *   weekStartIndex, 
 *   windowSize
 * );
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
export * from './virtual-weeks.types';
export * from './virtual-weeks.logic';
export * from './cache.config';
