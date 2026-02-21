/**
 * Core headless date range logic
 * 
 * v3.6.0: Plugin Architecture
 * - RangePresetPlugin interface for extensible presets
 * - PresetRegistry for plugin management
 * - Built-in presets as plugins
 * - Provider functions for custom presets
 * 
 * v3.7.0: Calendar Grid Cache
 * - CalendarGridFactory for deterministic grid generation
 * - CalendarGridCache with LRU memoization
 * - Separates grid structure from decorations for performance
 * 
 * Import from here for clean barrel exports
 */

export * from './dual-date-range.store';
export * from './preset.engine';
export * from './range.validator';
export * from './date-clock';
export * from './system-clock';
export * from './date-adapter';
export * from './native-date-adapter';

// v3.6.0: Plugin System
export * from './range-preset.plugin';
export * from './preset-registry';
export * from './built-in-presets';
export * from './preset-providers';

// v3.7.0: Calendar Grid Cache
export * from './calendar-grid';
