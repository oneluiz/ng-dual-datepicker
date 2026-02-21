/**
 * Virtual Weeks Logic (Pure Functions)
 * 
 * Pure computation layer for windowed week rendering.
 * No side effects, fully testable with node:test.
 * 
 * @module core/calendar-grid/virtual-weeks.logic
 * @version 3.9.0
 */

import { VirtualWeekWindow } from './virtual-weeks.types';

/**
 * Get visible weeks from total weeks array
 * 
 * Pure function: Given weeks array and window config, returns visible slice.
 * 
 * @param weeks Total weeks array (usually 6 weeks)
 * @param startIndex Start index of visible window (0-based)
 * @param windowSize How many weeks to show
 * @returns Visible weeks slice
 * 
 * @example
 * ```typescript
 * const allWeeks = [week0, week1, week2, week3, week4, week5]; // 6 weeks
 * const visible = getVisibleWeeks(allWeeks, 0, 3);
 * // Returns [week0, week1, week2]
 * 
 * const visible2 = getVisibleWeeks(allWeeks, 3, 3);
 * // Returns [week3, week4, week5]
 * ```
 */
export function getVisibleWeeks<T>(
  weeks: T[],
  startIndex: number,
  windowSize: number
): T[] {
  if (!weeks || weeks.length === 0) {
    return [];
  }

  // If no windowing (windowSize undefined or >= total weeks), return all
  if (windowSize === undefined || windowSize >= weeks.length) {
    return weeks;
  }

  // Clamp startIndex to valid range
  const clampedStart = clampWeekStart(startIndex, weeks.length, windowSize);

  // Return slice
  return weeks.slice(clampedStart, clampedStart + windowSize);
}

/**
 * Clamp week start index to valid range
 * 
 * Ensures startIndex is within bounds [0, totalWeeks - windowSize].
 * Prevents scrolling beyond available weeks.
 * 
 * @param startIndex Desired start index
 * @param totalWeeks Total weeks available
 * @param windowSize Window size
 * @returns Clamped start index
 * 
 * @example
 * ```typescript
 * clampWeekStart(0, 6, 3); // 0 (valid)
 * clampWeekStart(3, 6, 3); // 3 (valid, shows weeks 3-5)
 * clampWeekStart(4, 6, 3); // 3 (clamped, can't show beyond week 5)
 * clampWeekStart(-1, 6, 3); // 0 (clamped, can't go negative)
 * ```
 */
export function clampWeekStart(
  startIndex: number,
  totalWeeks: number,
  windowSize: number
): number {
  if (windowSize >= totalWeeks) {
    return 0; // No windowing needed
  }

  const maxStart = totalWeeks - windowSize;
  return Math.max(0, Math.min(startIndex, maxStart));
}

/**
 * Navigate week window (scroll up/down)
 * 
 * Returns new start index after navigation.
 * Handles clamping automatically.
 * 
 * @param currentStart Current start index
 * @param direction Navigation direction (+1 = down/later, -1 = up/earlier)
 * @param totalWeeks Total weeks available
 * @param windowSize Window size
 * @returns New start index after navigation
 * 
 * @example
 * ```typescript
 * // Start at week 0, navigate down
 * navigateWeekWindow(0, 1, 6, 3); // Returns 1 (now showing weeks 1-3)
 * 
 * // At week 3 (last valid position), navigate down
 * navigateWeekWindow(3, 1, 6, 3); // Returns 3 (can't go further)
 * 
 * // At week 1, navigate up
 * navigateWeekWindow(1, -1, 6, 3); // Returns 0 (now showing weeks 0-2)
 * ```
 */
export function navigateWeekWindow(
  currentStart: number,
  direction: number,
  totalWeeks: number,
  windowSize: number
): number {
  const newStart = currentStart + direction;
  return clampWeekStart(newStart, totalWeeks, windowSize);
}

/**
 * Get virtual week window state
 * 
 * Computes full window state including navigation capabilities.
 * 
 * @param startIndex Current start index
 * @param totalWeeks Total weeks available
 * @param windowSize Window size
 * @returns Complete window state
 * 
 * @example
 * ```typescript
 * const state = getVirtualWeekWindow(0, 6, 3);
 * // {
 * //   startIndex: 0,
 * //   windowSize: 3,
 * //   totalWeeks: 6,
 * //   canNavigateUp: false,    // Already at top
 * //   canNavigateDown: true    // Can scroll down
 * // }
 * 
 * const state2 = getVirtualWeekWindow(3, 6, 3);
 * // {
 * //   startIndex: 3,
 * //   windowSize: 3,
 * //   totalWeeks: 6,
 * //   canNavigateUp: true,     // Can scroll up
 * //   canNavigateDown: false   // Already at bottom
 * // }
 * ```
 */
export function getVirtualWeekWindow(
  startIndex: number,
  totalWeeks: number,
  windowSize: number
): VirtualWeekWindow {
  const clampedStart = clampWeekStart(startIndex, totalWeeks, windowSize);
  const maxStart = Math.max(0, totalWeeks - windowSize);

  return {
    startIndex: clampedStart,
    windowSize,
    totalWeeks,
    canNavigateUp: clampedStart > 0,
    canNavigateDown: clampedStart < maxStart
  };
}

/**
 * Check if virtual weeks mode is enabled
 * 
 * @param windowSize Window size from config (undefined = disabled)
 * @param totalWeeks Total weeks available
 * @returns True if windowing should be applied
 */
export function isVirtualWeeksEnabled(
  windowSize: number | undefined,
  totalWeeks: number
): boolean {
  return windowSize !== undefined && windowSize < totalWeeks;
}
