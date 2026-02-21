/**
 * Plugin Architecture Examples
 * 
 * Version: 3.6.0
 * 
 * Examples demonstrating the new plugin-driven preset system
 * for @oneluiz/dual-datepicker
 */

import { ApplicationConfig } from '@angular/core';
import { inject } from '@angular/core';
import { 
  PresetRegistry, 
  RangePresetPlugin, 
  provideCustomPresets,
  providePresetPackage 
} from '@oneluiz/dual-datepicker/core';

// =============================================================================
// EXAMPLE 1: Built-in Presets (Automatic - No Setup Needed)
// =============================================================================

/**
 * Built-in presets work automatically with ZERO configuration:
 * 
 * - TODAY, YESTERDAY
 * - LAST_7_DAYS, LAST_14_DAYS, LAST_30_DAYS, LAST_60_DAYS, LAST_90_DAYS
 * - THIS_WEEK, LAST_WEEK
 * - THIS_MONTH, LAST_MONTH, MONTH_TO_DATE
 * - THIS_QUARTER, LAST_QUARTER, QUARTER_TO_DATE
 * - THIS_YEAR, LAST_YEAR, YEAR_TO_DATE
 * 
 * Simply use them:
 */
export class MyDashboardComponent {
  private rangeStore = inject(DualDateRangeStore);

  ngOnInit() {
    // ✅ Works automatically
    this.rangeStore.applyPreset('LAST_30_DAYS');
  }
}

// =============================================================================
// EXAMPLE 2: Fiscal Year Presets
// =============================================================================

/**
 * Fiscal year starting April 1
 */
const THIS_FISCAL_QUARTER: RangePresetPlugin = {
  key: 'THIS_FISCAL_QUARTER',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const month = adapter.getMonth(now); // 0-11
    const year = adapter.getYear(now);
    
    // Fiscal year starts April (month 3)
    // Adjust calendar month to fiscal quarter
    const fiscalMonth = (month + 9) % 12; // Shift: Apr=0, May=1, ..., Mar=11
    const quarterStartMonth = Math.floor(fiscalMonth / 3) * 3;
    const calendarMonth = (quarterStartMonth - 9 + 12) % 12; // Back to calendar
    
    const fiscalYear = month < 3 ? year - 1 : year;
    
    const start = new Date(fiscalYear, calendarMonth, 1);
    const end = new Date(fiscalYear, calendarMonth + 3, 0);
    
    return {
      start: adapter.normalize(start),
      end: adapter.normalize(end)
    };
  }
};

const THIS_FISCAL_YEAR: RangePresetPlugin = {
  key: 'THIS_FISCAL_YEAR',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const month = adapter.getMonth(now);
    const year = adapter.getYear(now);
    
    // Fiscal year: April 1 to March 31
    const fiscalYear = month >= 3 ? year : year - 1;
    
    const start = new Date(fiscalYear, 3, 1); // April 1
    const end = new Date(fiscalYear + 1, 2, 31); // March 31
    
    return {
      start: adapter.normalize(start),
      end: adapter.normalize(end)
    };
  }
};

const FISCAL_YEAR_TO_DATE: RangePresetPlugin = {
  key: 'FISCAL_YEAR_TO_DATE',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const month = adapter.getMonth(now);
    const year = adapter.getYear(now);
    
    const fiscalYear = month >= 3 ? year : year - 1;
    const start = new Date(fiscalYear, 3, 1);
    
    return {
      start: adapter.normalize(start),
      end: adapter.normalize(now)
    };
  }
};

/**
 * Register fiscal presets in app config
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideCustomPresets([
      THIS_FISCAL_QUARTER,
      THIS_FISCAL_YEAR,
      FISCAL_YEAR_TO_DATE
    ])
  ]
};

// Usage in component:
export class FiscalDashboardComponent {
  private rangeStore = inject(DualDateRangeStore);

  loadQuarterlyReport() {
    this.rangeStore.applyPreset('THIS_FISCAL_QUARTER');
    const range = this.rangeStore.range();
    // API call with fiscal dates
  }
}

// =============================================================================
// EXAMPLE 3: Hotel/Hospitality Presets
// =============================================================================

const CHECK_IN_WEEK: RangePresetPlugin = {
  key: 'CHECK_IN_WEEK',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const dayOfWeek = adapter.getDay(now); // 0=Sunday, 5=Friday
    
    // Hotels often use Friday-to-Friday check-in weeks
    const daysToNextFriday = dayOfWeek <= 5 
      ? 5 - dayOfWeek 
      : 7 - dayOfWeek + 5;
    
    const nextFriday = adapter.addDays(now, daysToNextFriday);
    const followingFriday = adapter.addDays(nextFriday, 7);
    
    return { start: nextFriday, end: followingFriday };
  }
};

const NEXT_30_NIGHTS: RangePresetPlugin = {
  key: 'NEXT_30_NIGHTS',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const tomorrow = adapter.addDays(now, 1);
    const end = adapter.addDays(tomorrow, 30);
    return { start: tomorrow, end };
  }
};

const WEEKEND_STAYS: RangePresetPlugin = {
  key: 'WEEKEND_STAYS',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const dayOfWeek = adapter.getDay(now);
    
    // Next Friday check-in
    const daysToFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
    const friday = adapter.addDays(now, daysToFriday);
    
    // Sunday check-out
    const sunday = adapter.addDays(friday, 2);
    
    return { start: friday, end: sunday };
  }
};

export const hotelConfig: ApplicationConfig = {
  providers: [
    provideCustomPresets([
      CHECK_IN_WEEK,
      NEXT_30_NIGHTS,
      WEEKEND_STAYS
    ])
  ]
};

// =============================================================================
// EXAMPLE 4: Logistics/Shipping Presets
// =============================================================================

const SHIPPING_WEEK: RangePresetPlugin = {
  key: 'SHIPPING_WEEK',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const dayOfWeek = adapter.getDay(now);
    
    // Shipping week: Tuesday to following Monday
    const daysToTuesday = dayOfWeek <= 2 ? 2 - dayOfWeek : 7 - dayOfWeek + 2;
    const tuesday = adapter.addDays(now, daysToTuesday);
    const monday = adapter.addDays(tuesday, 6);
    
    return { start: tuesday, end: monday };
  }
};

const DELIVERY_WINDOW_3_5_DAYS: RangePresetPlugin = {
  key: 'DELIVERY_WINDOW_3_5_DAYS',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const start = adapter.addDays(now, 3);
    const end = adapter.addDays(now, 5);
    return { start, end };
  }
};

const LAST_BUSINESS_WEEK: RangePresetPlugin = {
  key: 'LAST_BUSINESS_WEEK',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const dayOfWeek = adapter.getDay(now);
    
    // Last Friday
    const daysToLastFriday = dayOfWeek === 0 ? 2 : 
                            dayOfWeek === 6 ? 1 : 
                            dayOfWeek + 2;
    const lastFriday = adapter.addDays(now, -daysToLastFriday);
    
    // Previous Monday
    const lastMonday = adapter.addDays(lastFriday, -4);
    
    return { start: lastMonday, end: lastFriday };
  }
};

export const logisticsConfig: ApplicationConfig = {
  providers: [
    provideCustomPresets([
      SHIPPING_WEEK,
      DELIVERY_WINDOW_3_5_DAYS,
      LAST_BUSINESS_WEEK
    ])
  ]
};

// =============================================================================
// EXAMPLE 5: External Preset Package Pattern
// =============================================================================

/**
 * Pattern for creating distributable preset packages
 * 
 * Example: @acme/fiscal-presets npm package
 */

// File: @acme/fiscal-presets/index.ts
export const FISCAL_PRESETS: RangePresetPlugin[] = [
  THIS_FISCAL_QUARTER,
  THIS_FISCAL_YEAR,
  FISCAL_YEAR_TO_DATE
];

export function provideFiscalPresets() {
  return providePresetPackage('@acme/fiscal-presets', FISCAL_PRESETS);
}

// Usage in app:
// import { provideFiscalPresets } from '@acme/fiscal-presets';
// 
// export const appConfig: ApplicationConfig = {
//   providers: [provideFiscalPresets()]
// };

// =============================================================================
// EXAMPLE 6: Dynamic Registration (Advanced)
// =============================================================================

/**
 * Register presets dynamically at runtime
 */
export class PresetManagerService {
  private registry = inject(PresetRegistry);

  registerCustomPreset(key: string, logic: (now: Date) => { start: Date; end: Date }) {
    this.registry.register({
      key: key.toUpperCase(),
      resolve: (clock, adapter) => {
        const now = clock.now();
        const result = logic(now);
        return {
          start: adapter.normalize(result.start),
          end: adapter.normalize(result.end)
        };
      }
    });
  }

  unregisterPreset(key: string) {
    this.registry.unregister(key);
  }

  listAllPresets(): string[] {
    return this.registry.getAllKeys();
  }
}

// Usage:
export class AdminPanelComponent {
  private presetManager = inject(PresetManagerService);

  addCompanyPreset() {
    this.presetManager.registerCustomPreset('COMPANY_REPORTING_PERIOD', (now) => {
      // Custom logic
      const start = new Date(now.getFullYear(), 0, 15);
      const end = new Date(now.getFullYear(), 11, 14);
      return { start, end };
    });
  }
}

// =============================================================================
// EXAMPLE 7: Testing Custom Presets
// =============================================================================

import { TestBed } from '@angular/core/testing';

describe('Custom Fiscal Preset', () => {
  let registry: PresetRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideCustomPresets([THIS_FISCAL_QUARTER])
      ]
    });
    registry = TestBed.inject(PresetRegistry);
  });

  it('should register fiscal quarter preset', () => {
    expect(registry.has('THIS_FISCAL_QUARTER')).toBe(true);
  });

  it('should resolve fiscal quarter correctly', () => {
    const preset = registry.get('THIS_FISCAL_QUARTER')!;
    
    // Mock clock for deterministic test
    const testDate = new Date(2026, 1, 21); // Feb 21, 2026
    const clock = { now: () => testDate };
    const adapter = new NativeDateAdapter();
    
    const result = preset.resolve(clock, adapter);
    
    // Fiscal Q4 (Jan-Mar of fiscal year 2025)
    expect(adapter.toISODate(result.start)).toBe('2026-01-01');
    expect(adapter.toISODate(result.end)).toBe('2026-03-31');
  });
});

// =============================================================================
// EXAMPLE 8: Override Built-in Preset (Advanced)
// =============================================================================

/**
 * Override a built-in preset with custom logic
 * (useful for special business requirements)
 */
export const CUSTOM_THIS_MONTH: RangePresetPlugin = {
  key: 'THIS_MONTH', // Same key as built-in
  resolve: (clock, adapter) => {
    const now = clock.now();
    // Custom: Start from 15th of month instead of 1st
    const year = adapter.getYear(now);
    const month = adapter.getMonth(now);
    
    const start = new Date(year, month, 15);
    const end = adapter.endOfMonth(now);
    
    return {
      start: adapter.normalize(start),
      end: adapter.normalize(end)
    };
  }
};

export const appConfigWithOverride: ApplicationConfig = {
  providers: [
    provideCustomPresets([CUSTOM_THIS_MONTH])
    // ⚠️ This will override the built-in THIS_MONTH
  ]
};

// =============================================================================
// SUMMARY
// =============================================================================

/**
 * Plugin Architecture Benefits:
 * 
 * ✅ Open/Closed Principle - Extend without modifying library
 * ✅ Industry Presets - Fiscal, Hotel, Logistics, etc.
 * ✅ External Packages - Distribute as npm packages
 * ✅ Dynamic Registration - Add/remove presets at runtime
 * ✅ Testable - Pure functions, deterministic
 * ✅ Type-Safe - Full TypeScript support
 * ✅ SSR-Compatible - Uses DateClock injection
 * ✅ Timezone-Safe - Uses DateAdapter
 * ✅ Backward Compatible - Existing code works unchanged
 * 
 * Documentation: See docs/PRESET_PLUGINS.md (to be created)
 */
