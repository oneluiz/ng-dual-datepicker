/**
 * PUBLIC API for @oneluiz/dual-datepicker
 * 
 * This file defines the stable public API contract.
 * Exports from this barrel are guaranteed to follow semantic versioning.
 * 
 * @public
 * @packageDocumentation
 * @module @oneluiz/dual-datepicker/core
 * @since v4.0.0
 */

// ============================================================================
// HEADLESS STORE
// ============================================================================

/**
 * DualDateRangeStore - Signal-based headless date range store
 * 
 * Core reactive store for managing date range state without UI dependencies.
 * Perfect for SSR, global state, and custom UI implementations.
 * 
 * @public
 * @since v3.5.0
 */
export { DualDateRangeStore } from './dual-date-range.store';

// ============================================================================
// DATE ADAPTER SYSTEM
// ============================================================================

/**
 * DateAdapter - Abstract date manipulation interface
 * 
 * Provides timezone-safe date operations.
 * Implement this interface for custom date libraries (Luxon, date-fns, etc.)
 * 
 * @public
 * @since v1.0.0
 */
export type { DateAdapter } from './date-adapter';
export { DATE_ADAPTER } from './date-adapter';

/**
 * NativeDateAdapter - Built-in implementation using native Date
 * 
 * Default adapter that uses JavaScript's native Date object.
 * Provides timezone-safe operations without external dependencies.
 * 
 * @public
 * @since v1.0.0
 */
export { NativeDateAdapter } from './native-date-adapter';

// ============================================================================
// PRESET PLUGIN SYSTEM (v3.6.0+)
// ============================================================================

/**
 * RangePresetPlugin - Interface for extensible date range presets
 * 
 * Implement this interface to create custom preset plugins.
 * Supports dynamic ranges, validation, and custom logic.
 * 
 * @public
 * @since v3.6.0
 */
export type {
  RangePresetPlugin
} from './range-preset.plugin';

/**
 * PresetRegistry - Plugin management and lifecycle
 * 
 * Injectable service that manages preset plugins.
 * Handles registration, resolution, and validation.
 * 
 * @public
 * @since v3.6.0
 */
export { PresetRegistry } from './preset-registry';

/**
 * Built-in Presets - Standard date range presets as plugins
 * 
 * Pre-configured plugins for common use cases:
 * - TODAY, YESTERDAY
 * - LAST_7_DAYS, LAST_30_DAYS
 * - THIS_WEEK, LAST_WEEK
 * - THIS_MONTH, LAST_MONTH
 * - THIS_YEAR, LAST_YEAR
 * 
 * @public
 * @since v3.6.0
 */
export {
  BUILT_IN_PRESETS,
  TODAY_PRESET,
  YESTERDAY_PRESET,
  LAST_7_DAYS_PRESET,
  LAST_30_DAYS_PRESET,
  THIS_WEEK_PRESET,
  LAST_WEEK_PRESET,
  THIS_MONTH_PRESET,
  LAST_MONTH_PRESET,
  THIS_YEAR_PRESET,
  LAST_YEAR_PRESET
} from './built-in-presets';

/**
 * Provider Functions - Dependency injection helpers
 * 
 * Functions for configuring the library via Angular DI:
 * - provideCustomPresets() - Custom preset plugins
 * - providePresetPackage() - Preset packages
 * 
 * @public
 * @since v3.6.0
 */
export {
  provideCustomPresets,
  providePresetPackage
} from './preset-providers';

// ============================================================================
// VALIDATION & UTILITIES
// ============================================================================

/**
 * Range Validation Utilities
 * 
 * Pure functions for date range validation logic.
 * Used internally but exposed for custom implementations.
 * 
 * @public
 * @since v3.5.0
 */
export {
  validateRangeOrder,
  applyBounds,
  isDateDisabled,
  type ValidationResult
} from './range.validator';

/**
 * Preset Engine - Preset resolution and management
 * 
 * Core engine that handles preset plugin execution.
 * Used internally but exposed for advanced use cases.
 * 
 * @public
 * @since v3.6.0
 */
export { PresetEngine } from './preset.engine';

// ============================================================================
// TYPE EXPORTS (for TypeScript users)
// ============================================================================

/**
 * Re-export types for convenience
 * 
 * These types are already exported by their respective modules,
 * but we re-export them here for easier imports.
 */
export type {
  // From range.validator
  ValidationResult as RangeValidationResult
} from './range.validator';
