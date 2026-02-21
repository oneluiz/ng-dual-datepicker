/**
 * Calendar Grid Module
 *
 * Performance-optimized calendar month grid generation with memoization.
 *
 * Usage:
 * ```typescript
 * constructor(private gridCache: CalendarGridCache) {}
 *
 * const grid = this.gridCache.get(monthDate, weekStart);
 * // grid.weeks[0][0].iso => '2026-02-01'
 * ```
 */

export * from './calendar-grid.types';
export * from './calendar-grid.factory';
export * from './calendar-grid.cache';
