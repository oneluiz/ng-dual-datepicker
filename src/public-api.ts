/**
 * Public API Surface of @oneluiz/dual-datepicker
 */

export { DualDatepickerComponent } from './dual-datepicker.component';
export type { DateRange, MultiDateRange, PresetConfig, PresetRange, LocaleConfig, ThemeType } from './dual-datepicker.component';

// Date Adapter System
export { DateAdapter, DATE_ADAPTER } from './date-adapter';
export { NativeDateAdapter } from './native-date-adapter';

// Preset Utilities (deprecated - use core/preset.engine instead)
export * from './preset-utils';

// NEW v3.5.0: Headless Core - Use without UI
// Perfect for SSR, global state, dashboard filters
export * from './core';
