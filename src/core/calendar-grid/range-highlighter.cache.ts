/**
 * Range Highlighter Cache
 * 
 * LRU cache for decorated calendar grids.
 * Eliminates redundant decoration computations when range/constraints don't change.
 * 
 * @module core/calendar-grid/range-highlighter.cache
 * @version 3.9.2
 */

import { Injectable, Inject } from '@angular/core';
import { DateAdapter, DATE_ADAPTER } from '../date-adapter';
import { CalendarGrid } from './calendar-grid.types';
import { DecoratedGrid, RangeDecorationParams, DecoratedGridCacheKey } from './range-highlighter.types';
import { RangeHighlighter } from './range-highlighter';
import { MAX_CACHE_ENTRIES } from './cache.config';

/**
 * Range Highlighter Cache
 * 
 * Memoizes decorated grids to avoid recomputing decorations.
 * 
 * Cache strategy:
 * - LRU eviction (Map preserves insertion order)
 * - Max 48 entries (v3.9.2: Memory safety for long-running sessions)
 * - Key: month + start + end + hover + disabled signature
 * 
 * Performance:
 * - Cache hit: ~0.1ms (object lookup)
 * - Cache miss: ~1ms (decoration + store)
 * - Hit rate: Expected >80% in typical usage
 * 
 * Memory safety (v3.9.2):
 * - MAX_CACHE_ENTRIES prevents unbounded growth
 * - Critical for: ERP, BI dashboards, hotel systems
 * - FIFO eviction when limit exceeded
 * - ~720KB max memory footprint
 * 
 * Edge cases handled:
 * - Function predicates: Not cacheable (recompute every time)
 * - Large disabled arrays: Sorted + joined for stable key
 * - Hover changes: Separate cache entries
 * - Multi-range mode: Included in key
 * 
 * Usage:
 * ```typescript
 * const grid = calendarGridCache.get(monthDate, 0);
 * const decorated = rangeHighlighterCache.get(grid, {
 *   start: startDate,
 *   end: endDate,
 *   hoverDate: '2026-01-20',
 *   disabledDates: [...]
 * });
 * // Same params = same object reference (===)
 * ```
 */
@Injectable({ providedIn: 'root' })
export class RangeHighlighterCache {
  private cache = new Map<string, DecoratedGrid>();
  private maxSize = MAX_CACHE_ENTRIES;

  constructor(
    private highlighter: RangeHighlighter,
    @Inject(DATE_ADAPTER) private adapter: DateAdapter
  ) {}

  /**
   * Get decorated grid (cached or computed)
   * 
   * If cache hit: Returns existing DecoratedGrid (same object reference)
   * If cache miss: Computes decorations, stores in cache, returns new grid
   * 
   * @param grid Base calendar grid (from CalendarGridCache)
   * @param params Decoration parameters
   * @returns Decorated grid with range highlights
   */
  get(
    grid: CalendarGrid,
    params: RangeDecorationParams
  ): DecoratedGrid {
    // Build cache key
    const cacheKey = this.buildKey(grid, params);

    // Check cache (function predicates can't be cached reliably)
    const hasFunction = typeof params.disabledDates === 'function';
    if (!hasFunction && this.cache.has(cacheKey.full)) {
      // Cache hit: Return existing grid
      const cached = this.cache.get(cacheKey.full)!;
      
      // LRU update: Delete and re-insert (moves to end)
      this.cache.delete(cacheKey.full);
      this.cache.set(cacheKey.full, cached);
      
      return cached;
    }

    // Cache miss: Compute decorations
    const decorated = this.highlighter.decorate(grid, params);

    // Store in cache (only if not using function predicate)
    if (!hasFunction) {
      this.cache.set(cacheKey.full, decorated);

      // Evict oldest if over limit
      if (this.cache.size > this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
    }

    return decorated;
  }

  /**
   * Build cache key from grid and params
   * 
   * Key structure:
   * `${monthKey}|${startISO}|${endISO}|${minISO}|${maxISO}|${hoverISO}|${disabledSig}`
   * 
   * Example:
   * "2026-1-0-|2026-01-15|2026-01-25|null|null|2026-01-20|2026-01-10,2026-01-11"
   * 
   * @param grid Base calendar grid
   * @param params Decoration parameters
   * @returns Cache key components
   */
  private buildKey(
    grid: CalendarGrid,
    params: RangeDecorationParams
  ): DecoratedGridCacheKey {
    // Month key (from base grid)
    const monthKey = `${grid.month.year}-${grid.month.month}-${grid.weekStart}-${grid.locale || ''}`;

    // Date ISOs (null if not provided)
    const startISO = params.start ? this.adapter.toISODate(params.start) : 'null';
    const endISO = params.end ? this.adapter.toISODate(params.end) : 'null';
    const minISO = params.minDate ? this.adapter.toISODate(params.minDate) : 'null';
    const maxISO = params.maxDate ? this.adapter.toISODate(params.maxDate) : 'null';
    const hoverISO = params.hoverDate || 'null';

    // Disabled dates signature
    const disabledSignature = this.buildDisabledSignature(params.disabledDates);

    // Multi-range flag (affects hover behavior)
    const multiRangeFlag = params.multiRange ? '1' : '0';
    const selectingStartFlag = params.selectingStartDate ? '1' : '0';

    // Full key (pipe-separated for readability)
    const full = `${monthKey}|${startISO}|${endISO}|${minISO}|${maxISO}|${hoverISO}|${disabledSignature}|${multiRangeFlag}|${selectingStartFlag}`;

    return {
      monthKey,
      startISO,
      endISO,
      minISO,
      maxISO,
      hoverISO,
      disabledSignature,
      full
    };
  }

  /**
   * Build signature for disabled dates
   * 
   * Strategies:
   * - null/undefined: 'none'
   * - Function: 'function' (not cacheable)
   * - Array: Sorted ISO dates joined with commas
   * 
   * @param disabledDates Disabled dates specification
   * @returns Signature string for cache key
   */
  private buildDisabledSignature(
    disabledDates?: Date[] | ((date: Date) => boolean) | null
  ): string {
    if (!disabledDates) return 'none';

    if (typeof disabledDates === 'function') {
      return 'function';
    }

    if (Array.isArray(disabledDates)) {
      if (disabledDates.length === 0) return 'none';

      // Convert to ISO dates, sort, join
      const isoArray = disabledDates
        .map(date => this.adapter.toISODate(date))
        .sort();

      return isoArray.join(',');
    }

    return 'none';
  }

  /**
   * Clear all cached grids
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if key is cached
   * 
   * @param grid Base calendar grid
   * @param params Decoration parameters
   * @returns True if this grid+params is cached
   */
  has(grid: CalendarGrid, params: RangeDecorationParams): boolean {
    const key = this.buildKey(grid, params);
    return this.cache.has(key.full);
  }
}
