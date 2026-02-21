/**
 * Range Highlighter Service
 * 
 * Decorates calendar grids with range highlights, hover previews, and disabled states.
 * Pure computation layer - no caching (see RangeHighlighterCache for memoization).
 * 
 * @module core/calendar-grid/range-highlighter
 * @version 3.8.0
 */

import { Injectable, Inject } from '@angular/core';
import { DateAdapter, DATE_ADAPTER } from '../date-adapter';
import { CalendarGrid, CalendarCell } from './calendar-grid.types';
import { DecoratedGrid, DecoratedCell, RangeDecorationParams } from './range-highlighter.types';

/**
 * Range Highlighter
 * 
 * Applies decorations to calendar grids:
 * - isSelectedStart, isSelectedEnd (range boundaries)
 * - isInRange (cells within selected range)
 * - isInHoverRange (hover preview)
 * - isDisabled (constraints, custom predicates)
 * 
 * Design:
 * - Pure functions (same input = same output)
 * - Uses DateAdapter for all date operations (SSR-safe)
 * - No side effects, no state
 * - Fast (~1ms for 42 cells on mobile)
 * 
 * Usage:
 * ```typescript
 * const grid = calendarGridCache.get(monthDate, 0);
 * const decorated = rangeHighlighter.decorate(grid, {
 *   start: startDate,
 *   end: endDate,
 *   hoverDate: '2026-01-20',
 *   disabledDates: [...]
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class RangeHighlighter {
  constructor(
    @Inject(DATE_ADAPTER) private adapter: DateAdapter
  ) {}

  /**
   * Decorate calendar grid with range highlights
   * 
   * @param grid Base calendar grid (from CalendarGridCache)
   * @param params Decoration parameters (start, end, hover, disabled, etc.)
   * @returns Decorated grid with computed properties
   */
  decorate(
    grid: CalendarGrid,
    params: RangeDecorationParams
  ): DecoratedGrid {
    // Normalize dates (ensure start of day, consistent ISO strings)
    const startISO = params.start ? this.adapter.toISODate(params.start) : null;
    const endISO = params.end ? this.adapter.toISODate(params.end) : null;
    const minISO = params.minDate ? this.adapter.toISODate(params.minDate) : null;
    const maxISO = params.maxDate ? this.adapter.toISODate(params.maxDate) : null;
    const hoverISO = params.hoverDate || null;

    // Compute hover range boundaries (if applicable)
    const hoverRange = this.computeHoverRange(
      startISO,
      hoverISO,
      params.selectingStartDate || false,
      params.multiRange || false
    );

    // Decorate all cells
    const decoratedCells = grid.cells.map((cell: CalendarCell): DecoratedCell => {
      // Padding cells (previous/next month) get default decorations
      if (!cell.inCurrentMonth) {
        return {
          ...cell,
          isSelectedStart: false,
          isSelectedEnd: false,
          isInRange: false,
          isInHoverRange: false,
          isDisabled: false
        };
      }

      // Current month cells: apply full decoration logic
      const cellISO = cell.iso;

      return {
        ...cell,
        isSelectedStart: startISO === cellISO,
        isSelectedEnd: endISO === cellISO,
        isInRange: this.isInRange(cellISO, startISO, endISO),
        isInHoverRange: this.isInHoverRange(cellISO, hoverRange),
        isDisabled: this.isDisabled(cell.date, minISO, maxISO, params.disabledDates)
      };
    });

    // Organize cells into weeks (6 × 7)
    const weeks: DecoratedCell[][] = [];
    for (let i = 0; i < decoratedCells.length; i += 7) {
      weeks.push(decoratedCells.slice(i, i + 7));
    }

    return {
      base: grid,
      cells: decoratedCells,
      weeks
    };
  }

  /**
   * Check if cell is within selected range
   * 
   * @param cellISO Cell date (ISO format)
   * @param startISO Start date (ISO or null)
   * @param endISO End date (ISO or null)
   * @returns True if cell is in range [start, end] (inclusive)
   */
  private isInRange(
    cellISO: string,
    startISO: string | null,
    endISO: string | null
  ): boolean {
    if (!startISO || !endISO) return false;
    return cellISO >= startISO && cellISO <= endISO;
  }

  /**
   * Check if cell is within hover preview range
   * 
   * @param cellISO Cell date (ISO format)
   * @param hoverRange Hover range boundaries (or null)
   * @returns True if cell is in hover range
   */
  private isInHoverRange(
    cellISO: string,
    hoverRange: { min: string; max: string } | null
  ): boolean {
    if (!hoverRange) return false;
    return cellISO >= hoverRange.min && cellISO <= hoverRange.max;
  }

  /**
   * Check if cell is disabled
   * 
   * @param date Cell date object
   * @param minISO Minimum allowed date (ISO or null)
   * @param maxISO Maximum allowed date (ISO or null)
   * @param disabledDates Disabled dates (array, function, or null)
   * @returns True if cell is disabled
   */
  private isDisabled(
    date: Date,
    minISO: string | null,
    maxISO: string | null,
    disabledDates?: Date[] | ((date: Date) => boolean) | null
  ): boolean {
    const dateISO = this.adapter.toISODate(date);

    // Check min/max constraints
    if (minISO && dateISO < minISO) return true;
    if (maxISO && dateISO > maxISO) return true;

    // Check disabled dates
    if (!disabledDates) return false;

    if (typeof disabledDates === 'function') {
      // Custom predicate
      return disabledDates(date);
    } else if (Array.isArray(disabledDates)) {
      // Array of disabled dates (exact day match)
      return disabledDates.some(disabledDate => {
        return this.adapter.getYear(date) === this.adapter.getYear(disabledDate) &&
               this.adapter.getMonth(date) === this.adapter.getMonth(disabledDate) &&
               this.adapter.getDate(date) === this.adapter.getDate(disabledDate);
      });
    }

    return false;
  }

  /**
   * Compute hover preview range
   * 
   * When user hovers over a date (and not selecting start):
   * - Show preview range from start to hover
   * - Range is always [min, max] where min <= max
   * 
   * @param startISO Current start date (ISO or null)
   * @param hoverISO Hovered date (ISO or null)
   * @param selectingStart True if selecting start date (hover disabled)
   * @param multiRange True if in multi-range mode
   * @returns Hover range boundaries or null
   */
  private computeHoverRange(
    startISO: string | null,
    hoverISO: string | null,
    selectingStart: boolean,
    multiRange: boolean
  ): { min: string; max: string } | null {
    // No hover preview when selecting start
    if (selectingStart || !hoverISO || !startISO) return null;

    // Compute min/max (always normalized order)
    const min = startISO < hoverISO ? startISO : hoverISO;
    const max = startISO > hoverISO ? startISO : hoverISO;

    return { min, max };
  }
}
