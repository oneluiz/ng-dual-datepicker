/**
 * Date Clock Abstraction for SSR-Safe Date Resolution
 * 
 * Problem:
 * Presets like "Last 7 Days" or "This Month" use new Date() which causes:
 * - SSR hydration mismatch
 * - Server renders "2026-02-14", client renders "2026-02-15"
 * - Different filters in dashboards
 * - Different queries in ERP/BI
 * - Cache inconsistency
 * 
 * Solution:
 * Inject a DateClock to control time deterministically:
 * 
 * Server (SSR):
 * provide(DATE_CLOCK, {
 *   useValue: { now: () => new Date('2026-02-21T00:00:00Z') }
 * })
 * 
 * Client (Browser):
 * Uses SystemClock by default (new Date())
 * 
 * Testing:
 * provide(DATE_CLOCK, {
 *   useValue: { now: () => new Date('2026-01-15T10:30:00Z') }
 * })
 * 
 * Architecture:
 * - PresetEngine receives DateClock via DI
 * - All preset calculations use clock.now() instead of new Date()
 * - Deterministic: Same clock.now() → Same preset result
 * - SSR-compatible: Server and client resolve identical ranges
 */

import { InjectionToken } from '@angular/core';

/**
 * Clock abstraction for deterministic date resolution
 * 
 * Use cases:
 * - SSR: Ensure server and client generate identical presets
 * - Testing: Control time for predictable test results
 * - Replay: Reproduce exact user state from past sessions
 * - Demo: Freeze time for reproducible demos
 */
export interface DateClock {
  /**
   * Get current date/time
   * 
   * Default implementation returns new Date()
   * Override for SSR, testing, or time-travel scenarios
   */
  now(): Date;
}

/**
 * Injection token for DateClock
 * 
 * Usage:
 * ```typescript
 * // Default (uses SystemClock)
 * bootstrapApplication(AppComponent);
 * 
 * // SSR Override
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     {
 *       provide: DATE_CLOCK,
 *       useValue: { now: () => new Date('2026-02-21T00:00:00Z') }
 *     }
 *   ]
 * });
 * 
 * // Testing Override
 * TestBed.configureTestingModule({
 *   providers: [
 *     {
 *       provide: DATE_CLOCK,
 *       useValue: { now: () => new Date('2026-01-15T12:00:00Z') }
 *     }
 *   ]
 * });
 * ```
 */
export const DATE_CLOCK = new InjectionToken<DateClock>('DATE_CLOCK');
