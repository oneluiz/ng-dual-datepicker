/**
 * Public API Surface of @oneluiz/dual-datepicker
 * 
 * v4.0.0: Formalized Public API
 * - Only stable, documented APIs are exported
 * - Internal implementation details removed
 * - Backward compatibility maintained where possible
 * 
 * @public
 * @packageDocumentation
 * @module @oneluiz/dual-datepicker
 */

// ============================================================================
// UI COMPONENT
// ============================================================================

/**
 * DualDatepickerComponent - Main Angular component
 * 
 * Standalone component for dual-calendar date range selection.
 * Supports reactive forms, signals, themes, and extensive customization.
 * 
 * @public
 * @since v1.0.0
 */
export { DualDatepickerComponent } from './dual-datepicker.component';

/**
 * Component Types
 * 
 * TypeScript types for component inputs/outputs.
 * 
 * @public
 */
export type {
  DateRange,
  MultiDateRange,
  PresetConfig,
  PresetRange,
  LocaleConfig,
  ThemeType
} from './dual-datepicker.component';

// ============================================================================
// HEADLESS CORE (v3.5.0+)
// ============================================================================

/**
 * Headless Core API
 * 
 * Signal-based headless store, preset plugins, and date adapter system.
 * Use without UI for:
 * - SSR applications
 * - Global state management
 * - Dashboard filters
 * - Custom UI implementations
 * 
 * @public
 * @since v3.5.0
 */
export * from './core/public';
