/**
 * Public API Surface of @oneluiz/dual-datepicker
 */

export { DualDatepickerComponent } from './dual-datepicker.component';
export type { DateRange, MultiDateRange, PresetConfig, PresetRange, LocaleConfig } from './dual-datepicker.component';

// Date Adapter System
export { DateAdapter, DATE_ADAPTER } from './date-adapter';
export { NativeDateAdapter } from './native-date-adapter';

// Preset Utilities
export * from './preset-utils';
