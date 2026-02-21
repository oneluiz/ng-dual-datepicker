/**
 * Fixed Clock for Deterministic Testing
 * 
 * Implements DateClock interface with a fixed date.
 * 
 * Usage:
 * ```typescript
 * const clock = new FixedClock(new Date(2026, 1, 21)); // Feb 21, 2026
 * const now = clock.now(); // Always returns Feb 21, 2026 (cloned)
 * ```
 * 
 * Why clone?
 * - Prevents test pollution if consumer mutates the returned date
 * - Each call to now() returns a fresh Date instance
 */

import { DateClock } from '../date-clock';

export class FixedClock implements DateClock {
  constructor(private readonly fixedDate: Date) {}

  /**
   * Returns a cloned copy of the fixed date
   * 
   * Cloning prevents test pollution from mutations
   */
  now(): Date {
    return new Date(this.fixedDate);
  }
}
