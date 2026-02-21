/**
 * Calendar Grid Factory
 *
 * Generates calendar month grids using DateAdapter for deterministic,
 * timezone-safe date operations.
 *
 * Grid structure:
 * - Always 6 weeks x 7 days (42 cells) for layout stability
 * - Includes padding days from previous/next month
 * - No decorations (selected, disabled, etc.) - those are applied separately
 */

import { Injectable, Inject } from '@angular/core';
import { DateAdapter, DATE_ADAPTER } from '../date-adapter';
import { CalendarCell, CalendarGrid } from './calendar-grid.types';

@Injectable({ providedIn: 'root' })
export class CalendarGridFactory {
  constructor(
    @Inject(DATE_ADAPTER) private adapter: DateAdapter
  ) {}

  /**
   * Create a calendar grid for a given month
   *
   * @param monthDate - Any date within the target month (will be normalized to start of month)
   * @param weekStart - First day of week (0 = Sunday, 1 = Monday, etc.)
   * @param locale - Locale identifier (optional, for future use)
   * @returns CalendarGrid - 6 weeks x 7 days grid
   */
  createGrid(monthDate: Date, weekStart: number = 0, locale?: string): CalendarGrid {
    // Normalize to start of month
    const year = this.adapter.getYear(monthDate);
    const month = this.adapter.getMonth(monthDate);
    const firstDayOfMonth = new Date(year, month, 1);
    const normalizedFirst = this.adapter.normalize(firstDayOfMonth);

    // Get days in month (day 0 of next month = last day of current month)
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = this.adapter.getDate(lastDayOfMonth);

    // Get first day of week offset
    const firstDayOfWeek = this.adapter.getDay(normalizedFirst);
    const offset = this.calculateOffset(firstDayOfWeek, weekStart);

    // Generate 42 cells (6 weeks x 7 days)
    const cells: CalendarCell[] = [];
    let currentDate = this.adapter.addDays(normalizedFirst, -offset);

    for (let i = 0; i < 42; i++) {
      const cellDate = this.adapter.normalize(currentDate);
      const cellYear = this.adapter.getYear(cellDate);
      const cellMonth = this.adapter.getMonth(cellDate);
      const cellDay = this.adapter.getDate(cellDate);
      const cellDayOfWeek = this.adapter.getDay(cellDate);

      cells.push({
        date: cellDate,
        inCurrentMonth: cellYear === year && cellMonth === month,
        iso: this.adapter.toISODate(cellDate),
        day: cellDay,
        month: cellMonth,
        year: cellYear,
        dayOfWeek: cellDayOfWeek
      });

      currentDate = this.adapter.addDays(currentDate, 1);
    }

    // Split into weeks
    const weeks: CalendarCell[][] = [];
    for (let i = 0; i < 6; i++) {
      weeks.push(cells.slice(i * 7, (i + 1) * 7));
    }

    return {
      month: { year, month },
      weekStart,
      locale,
      weeks,
      cells
    };
  }

  /**
   * Calculate offset (number of padding days from previous month)
   *
   * @param firstDayOfWeek - Day of week for first day of month (0-6)
   * @param weekStart - Desired week start (0-6)
   * @returns Number of padding days needed
   */
  private calculateOffset(firstDayOfWeek: number, weekStart: number): number {
    let offset = firstDayOfWeek - weekStart;
    if (offset < 0) {
      offset += 7;
    }
    return offset;
  }
}
