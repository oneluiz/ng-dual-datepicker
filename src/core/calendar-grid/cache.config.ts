/**
 * Cache Configuration
 * 
 * Centralized cache limits for memory safety.
 * 
 * @module core/calendar-grid/cache.config
 * @version 3.9.2
 */

/**
 * Maximum cache entries before FIFO eviction
 * 
 * Applied to both:
 * - CalendarGridCache: Raw month grids
 * - RangeHighlighterCache: Decorated grids
 * 
 * Memory footprint:
 * - CalendarGrid (raw): ~10KB each
 * - DecoratedGrid: ~15KB each
 * - Total worst case: (10KB + 15KB) × 48 = ~1.2MB
 * 
 * Coverage:
 * - 48 months = 4 years of navigation
 * - Sufficient for long-running sessions
 * 
 * Critical for:
 * - ERP systems (invoice date selection)
 * - BI dashboards (date range filters)
 * - Hotel reservation systems (availability calendars)
 * - Point-of-sale systems (report generation)
 * 
 * @constant
 * @since v3.9.2
 */
export const MAX_CACHE_ENTRIES = 48;
