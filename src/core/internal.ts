/**
 * INTERNAL API for @oneluiz/dual-datepicker
 * 
 * This file exports implementation details required by the component itself.
 * These exports are NOT part of the public API and may change without notice.
 * 
 * ⚠️ DO NOT import from this file in your application code.
 * ⚠️ Use the public API from '@oneluiz/dual-datepicker/core' instead.
 * 
 * @internal
 * @packageDocumentation
 * @since v4.0.0
 */

// ============================================================================
// CALENDAR GRID SYSTEM (v3.7.0+)
// ============================================================================

/**
 * Calendar Grid Types
 * 
 * Core types for 42-cell calendar grid structure.
 * Used by the component for rendering month views.
 * 
 * @internal
 */
export type {
  CalendarGrid,
  CalendarCell,
  CalendarGridCacheKey
} from './calendar-grid/calendar-grid.types';

/**
 * CalendarGridFactory - Deterministic grid generation
 * 
 * Creates normalized 42-cell grids (6 weeks × 7 days).
 * Pure function approach with no side effects.
 * 
 * @internal
 */
export { CalendarGridFactory } from './calendar-grid/calendar-grid.factory';

/**
 * CalendarGridCache - LRU cache for grid structures
 * 
 * Memoizes calendar grids by month/weekStart/locale.
 * Prevents redundant grid generation on re-renders.
 * 
 * @internal
 */
export { CalendarGridCache } from './calendar-grid/calendar-grid.cache';

// ============================================================================
// RANGE HIGHLIGHTING SYSTEM (v3.8.0+)
// ============================================================================

/**
 * Range Highlighter Types
 * 
 * Types for decorated grids with range highlighting.
 * Used by the component for visual decorations.
 * 
 * @internal
 */
export type {
  DecoratedGrid,
  DecoratedCell,
  RangeDecorationParams,
  DecoratedGridCacheKey
} from './calendar-grid/range-highlighter.types';

/**
 * RangeHighlighter - Pure decoration logic
 * 
 * Applies range highlighting to calendar grids.
 * Handles start/end/hover/disabled states.
 * 
 * @internal
 */
export { RangeHighlighter } from './calendar-grid/range-highlighter';

/**
 * RangeHighlighterCache - LRU cache for decorated grids
 * 
 * Memoizes decorated grids by range parameters.
 * Eliminates redundant decoration computations.
 * 
 * @internal
 */
export { RangeHighlighterCache } from './calendar-grid/range-highlighter.cache';

// ============================================================================
// VIRTUAL WEEKS SYSTEM (v3.9.0+)
// ============================================================================

/**
 * Virtual Weeks Types
 * 
 * Types for windowed rendering of calendar weeks.
 * Reduces DOM complexity for large calendars.
 * 
 * @internal
 */
export type {
  VirtualWeeksConfig,
  VirtualWeekWindow
} from './calendar-grid/virtual-weeks.types';

/**
 * Virtual Weeks Logic
 * 
 * Functions for calculating visible week windows.
 * Enables progressive rendering and infinite scroll.
 * 
 * @internal
 */
export {
  getVisibleWeeks,
  navigateWeekWindow,
  isVirtualWeeksEnabled
} from './calendar-grid/virtual-weeks.logic';

// ============================================================================
// CACHE CONFIGURATION (v3.9.2+)
// ============================================================================

/**
 * Cache Configuration
 * 
 * Shared cache size limits for memory safety.
 * MAX_CACHE_ENTRIES = 48 (4 years of navigation)
 * 
 * @internal
 */
export { MAX_CACHE_ENTRIES } from './calendar-grid/cache.config';

// ============================================================================
// DATE CLOCK SYSTEM
// ============================================================================

/**
 * DateClock - Abstract time source
 * 
 * Interface for injecting custom time sources.
 * Enables deterministic testing and SSR.
 * 
 * @internal
 */
export type { DateClock } from './date-clock';

/**
 * SystemClock - Default implementation
 * 
 * Uses native Date.now() and new Date().
 * Default time source for production.
 * 
 * @internal
 */
export { SystemClock } from './system-clock';

// ============================================================================
// TESTING UTILITIES
// ============================================================================

/**
 * Testing Helpers
 * 
 * Utilities for writing deterministic tests.
 * FixedClock, makeDate, etc.
 * 
 * @internal
 */
export * from './testing';
