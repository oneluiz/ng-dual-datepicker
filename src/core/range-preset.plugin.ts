/**
 * Range Preset Plugin System
 * 
 * Version: 3.6.0
 * 
 * Plugin-based architecture for date range presets following Open/Closed Principle.
 * 
 * WHY THIS EXISTS:
 * - Enterprise apps need industry-specific presets (fiscal, hotel, logistics)
 * - Presets should be distributable as external packages
 * - Core should NOT know about all possible presets
 * - Users should extend presets without modifying library code
 * 
 * ARCHITECTURE:
 * ```
 * RangePresetPlugin (interface) - Contract for all presets
 *     ↓
 * PresetRegistry (service) - Manages plugin registration
 *     ↓
 * PresetEngine (refactored) - Resolves presets via registry
 *     ↓
 * DualDateRangeStore - No changes, backward compatible
 * ```
 * 
 * USAGE:
 * ```typescript
 * // Built-in presets work automatically
 * store.applyPreset('LAST_7_DAYS'); // ✅ Works
 * 
 * // Register custom preset
 * const registry = inject(PresetRegistry);
 * registry.register({
 *   key: 'THIS_FISCAL_QUARTER',
 *   resolve: (clock, adapter) => {
 *     const now = clock.now();
 *     const fiscalStart = adapter.startOfMonth(now);
 *     const fiscalEnd = adapter.endOfMonth(now);
 *     return { start: fiscalStart, end: fiscalEnd };
 *   }
 * });
 * 
 * // Use custom preset
 * store.applyPreset('THIS_FISCAL_QUARTER'); // ✅ Works
 * ```
 * 
 * EXTERNAL PACKAGES:
 * ```typescript
 * // @acme/fiscal-presets package
 * export const FISCAL_PRESETS: RangePresetPlugin[] = [
 *   { key: 'FISCAL_Q1', resolve: ... },
 *   { key: 'FISCAL_Q2', resolve: ... }
 * ];
 * 
 * // In app
 * FISCAL_PRESETS.forEach(p => registry.register(p));
 * ```
 */

import { DateClock } from './date-clock';
import { DateAdapter } from './date-adapter';

/**
 * Date range returned by preset plugins
 */
export interface DateRange {
  /**
   * Start date of the range (inclusive)
   */
  start: Date;

  /**
   * End date of the range (inclusive)
   */
  end: Date;
}

/**
 * Range Preset Plugin Interface
 * 
 * All date range presets (built-in or external) implement this interface.
 * 
 * DESIGN PRINCIPLES:
 * - **Deterministic**: Given the same clock.now(), always returns same range
 * - **Timezone-safe**: Uses DateAdapter for all date operations
 * - **SSR-compatible**: Uses DateClock injection, no global Date()
 * - **Testable**: Pure function, no side effects
 * 
 * EXAMPLE - Built-in preset:
 * ```typescript
 * const todayPreset: RangePresetPlugin = {
 *   key: 'TODAY',
 *   resolve: (clock, adapter) => {
 *     const now = clock.now();
 *     const normalized = adapter.normalize(now);
 *     return { start: normalized, end: normalized };
 *   }
 * };
 * ```
 * 
 * EXAMPLE - Custom fiscal preset:
 * ```typescript
 * const fiscalQuarterPreset: RangePresetPlugin = {
 *   key: 'THIS_FISCAL_QUARTER',
 *   resolve: (clock, adapter) => {
 *     const now = clock.now();
 *     const month = adapter.getMonth(now); // 0-11
 *     
 *     // Fiscal year starts in April (month 3)
 *     const fiscalMonth = (month + 9) % 12; // Offset to fiscal calendar
 *     const quarterStartMonth = Math.floor(fiscalMonth / 3) * 3;
 *     const adjustedMonth = (quarterStartMonth - 9 + 12) % 12;
 *     
 *     const yearOffset = month < 3 ? -1 : 0;
 *     const year = adapter.getYear(now) + yearOffset;
 *     
 *     const start = new Date(year, adjustedMonth, 1);
 *     const end = new Date(year, adjustedMonth + 3, 0);
 *     
 *     return {
 *       start: adapter.normalize(start),
 *       end: adapter.normalize(end)
 *     };
 *   }
 * };
 * ```
 * 
 * EXAMPLE - Hotel industry preset:
 * ```typescript
 * const checkInWeekPreset: RangePresetPlugin = {
 *   key: 'CHECK_IN_WEEK',
 *   resolve: (clock, adapter) => {
 *     const now = clock.now();
 *     // Hotel check-ins are Friday to Friday
 *     const dayOfWeek = adapter.getDayOfWeek(now);
 *     const daysToFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
 *     
 *     const nextFriday = adapter.addDays(now, daysToFriday);
 *     const followingFriday = adapter.addDays(nextFriday, 7);
 *     
 *     return { start: nextFriday, end: followingFriday };
 *   }
 * };
 * ```
 */
export interface RangePresetPlugin {
  /**
   * Unique identifier for the preset
   * 
   * Convention: SCREAMING_SNAKE_CASE
   * 
   * Examples:
   * - Built-in: 'TODAY', 'LAST_7_DAYS', 'THIS_MONTH'
   * - Fiscal: 'FISCAL_Q1', 'FISCAL_YEAR_TO_DATE'
   * - Hotel: 'CHECK_IN_WEEK', 'NEXT_30_NIGHTS'
   * - Logistics: 'SHIPPING_WEEK', 'DELIVERY_WINDOW'
   */
  key: string;

  /**
   * Resolve the date range for this preset
   * 
   * MUST use:
   * - `clock.now()` for current time (SSR-safe, deterministic)
   * - `adapter.*` for all date operations (timezone-safe)
   * 
   * MUST NOT use:
   * - `new Date()` directly (breaks SSR determinism)
   * - `date.toISOString()` (timezone bugs)
   * - `date.setDate()` (mutates, use adapter.addDays() instead)
   * 
   * @param clock - Injected DateClock for SSR-safe time access
   * @param adapter - Injected DateAdapter for timezone-safe operations
   * @returns Date range with start and end dates (both inclusive)
   * 
   * @example
   * ```typescript
   * resolve: (clock, adapter) => {
   *   const now = clock.now();
   *   const start = adapter.addDays(now, -7);
   *   const end = adapter.normalize(now);
   *   return { start, end };
   * }
   * ```
   */
  resolve(clock: DateClock, adapter: DateAdapter): DateRange;
}

/**
 * Type guard to check if object is a valid RangePresetPlugin
 * 
 * @param obj - Object to check
 * @returns true if object implements RangePresetPlugin interface
 */
export function isRangePresetPlugin(obj: any): obj is RangePresetPlugin {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.key === 'string' &&
    typeof obj.resolve === 'function'
  );
}
