/**
 * Calendar Grid Cache
 *
 * LRU cache for calendar month grids to avoid recomputing the same month grid
 * multiple times when only decorations (selected dates, hover, etc.) change.
 *
 * Strategy:
 * - Key: year-month-weekStart-locale
 * - LRU eviction (least recently used) when limit is reached
 * - Default limit: 48 months (covers 2 years of navigation)
 *
 * Performance impact:
 * - Eliminates ~90% of grid recalculations in typical usage
 * - Memory footprint: ~10KB per cached month (negligible)
 * 
 * Memory safety (v3.9.2):
 * - MAX_CACHE_ENTRIES prevents unbounded growth in long-running sessions
 * - Critical for: ERP, BI dashboards, hotel reservation systems
 * - FIFO eviction when limit exceeded
 */

import { Injectable } from '@angular/core';
import { CalendarGridFactory } from './calendar-grid.factory';
import { CalendarGrid, CalendarGridCacheKey } from './calendar-grid.types';
import { MAX_CACHE_ENTRIES } from './cache.config';

@Injectable({ providedIn: 'root' })
export class CalendarGridCache {
  private cache = new Map<string, CalendarGrid>();
  private readonly maxSize: number = MAX_CACHE_ENTRIES;

  constructor(private factory: CalendarGridFactory) {}

  /**
   * Get or create a calendar grid
   *
   * @param monthDate - Any date within the target month
   * @param weekStart - First day of week (0 = Sunday, 1 = Monday, etc.)
   * @param locale - Locale identifier (optional)
   * @returns CalendarGrid - cached or newly created
   */
  get(monthDate: Date, weekStart: number = 0, locale?: string): CalendarGrid {
    const key = this.buildKey(monthDate, weekStart, locale);

    // Check cache
    const cached = this.cache.get(key);
    if (cached) {
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached;
    }

    // Generate new grid
    const grid = this.factory.createGrid(monthDate, weekStart, locale);

    // Store in cache
    this.cache.set(key, grid);

    // Evict oldest if over limit (LRU)
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    return grid;
  }

  /**
   * Build cache key from month parameters
   *
   * Format: "year-month-weekStart-locale"
   * Example: "2026-1-0-en" (Feb 2026, Sunday start, English)
   */
  private buildKey(monthDate: Date, weekStart: number, locale?: string): string {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    return `${year}-${month}-${weekStart}${locale ? '-' + locale : ''}`;
  }

  /**
   * Clear entire cache (for testing or manual reset)
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size (for debugging/testing)
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if a specific month is cached
   */
  has(monthDate: Date, weekStart: number = 0, locale?: string): boolean {
    const key = this.buildKey(monthDate, weekStart, locale);
    return this.cache.has(key);
  }
}
