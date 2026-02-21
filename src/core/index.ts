/**
 * Core headless date range logic
 * 
 * v4.0.0: PUBLIC API FORMALIZATION
 * - Public API exported via ./public.ts
 * - Internal implementation exported via ./internal.ts
 * - Backward compatibility maintained (re-exports public API)
 * 
 * ⚠️ BREAKING CHANGE in v4.0.0:
 * - Internal APIs (CalendarGridFactory, RangeHighlighter, etc.) no longer exported
 * - Migrate to public API before upgrading
 * 
 * @deprecated Import from '@oneluiz/dual-datepicker/core' (public API only)
 * @see {@link ./public.ts} for public exports
 * @see {@link ./internal.ts} for internal exports (use at your own risk)
 */

/**
 * Re-export PUBLIC API for backward compatibility
 * 
 * This maintains compatibility with existing code that imports from:
 * import { ... } from '@oneluiz/dual-datepicker/core';
 * 
 * After v4.0.0, only public APIs are exported.
 */
export * from './public';

/**
 * INTERNAL APIs are NO LONGER exported from this barrel.
 * 
 * If you were using internal APIs directly, migrate to:
 * - Use public APIs where possible
 * - Or import from './core/internal' (NOT recommended, may break anytime)
 * 
 * Previously exported (now internal):
 * - CalendarGridFactory, CalendarGridCache
 * - RangeHighlighter, RangeHighlighterCache
 * - Virtual weeks logic
 * - DateClock, SystemClock
 * - Testing utilities
 */
