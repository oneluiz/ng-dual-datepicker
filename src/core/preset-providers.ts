/**
 * Provider Functions for Built-in Presets
 * 
 * Version: 3.6.0
 * 
 * Automatic registration of built-in date range presets.
 * These providers ensure backward compatibility by auto-registering
 * all standard presets (TODAY, LAST_7_DAYS, THIS_MONTH, etc.)
 * 
 * USAGE IN LIBRARY (Internal):
 * Built-in presets are registered automatically via Angular providers.
 * Library consumers don't need to do anything.
 * 
 * USAGE IN APP (Custom Presets):
 * ```typescript
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     // ... other providers
 *     provideCustomPresets([
 *       {
 *         key: 'THIS_FISCAL_QUARTER',
 *         resolve: (clock, adapter) => {
 *           const now = clock.now();
 *           // ... fiscal logic
 *           return { start, end };
 *         }
 *       }
 *     ])
 *   ]
 * };
 * ```
 */

import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders, inject } from '@angular/core';
import { PresetRegistry } from './preset-registry';
import { BUILT_IN_PRESETS } from './built-in-presets';
import { RangePresetPlugin } from './range-preset.plugin';

/**
 * Initializer function that registers built-in presets
 * 
 * Runs at application startup (APP_INITIALIZER)
 * 
 * @param registry - PresetRegistry instance
 * @returns Initialization function
 */
function initializeBuiltInPresets(registry: PresetRegistry): () => void {
  return () => {
    // Register all built-in presets
    BUILT_IN_PRESETS.forEach(preset => {
      registry.register(preset);
    });

    // Log registration for debugging (can be removed in production)
    if (typeof console !== 'undefined' && console.debug) {
      console.debug(
        `[ng-dual-datepicker] Registered ${BUILT_IN_PRESETS.length} built-in presets:`,
        BUILT_IN_PRESETS.map(p => p.key).join(', ')
      );
    }
  };
}

/**
 * Provide built-in date range presets
 * 
 * This provider is automatically included in the library's root providers.
 * Library consumers don't need to add this manually.
 * 
 * @returns EnvironmentProviders for built-in presets
 * 
 * @internal
 */
export function provideBuiltInPresets(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: initializeBuiltInPresets,
      deps: [PresetRegistry]
    }
  ]);
}

/**
 * Provide custom date range presets
 * 
 * Use this to register your own industry-specific presets:
 * - Fiscal presets
 * - Hotel/hospitality presets
 * - Logistics presets
 * - Custom business logic
 * 
 * @param presets - Array of custom RangePresetPlugin implementations
 * @returns EnvironmentProviders for custom presets
 * 
 * @example
 * ```typescript
 * // Fiscal presets
 * const FISCAL_PRESETS: RangePresetPlugin[] = [
 *   {
 *     key: 'THIS_FISCAL_QUARTER',
 *     resolve: (clock, adapter) => {
 *       const now = clock.now();
 *       const month = adapter.getMonth(now);
 *       
 *       // Fiscal year starts April (month 3)
 *       const fiscalMonth = (month + 9) % 12;
 *       const quarterStart = Math.floor(fiscalMonth / 3) * 3;
 *       const calendarMonth = (quarterStart - 9 + 12) % 12;
 *       
 *       const year = adapter.getYear(now);
 *       const fiscalYear = month < 3 ? year - 1 : year;
 *       
 *       const start = new Date(fiscalYear, calendarMonth, 1);
 *       const end = new Date(fiscalYear, calendarMonth + 3, 0);
 *       
 *       return {
 *         start: adapter.normalize(start),
 *         end: adapter.normalize(end)
 *       };
 *     }
 *   },
 *   {
 *     key: 'FISCAL_YEAR_TO_DATE',
 *     resolve: (clock, adapter) => {
 *       const now = clock.now();
 *       const month = adapter.getMonth(now);
 *       const year = adapter.getYear(now);
 *       
 *       // Fiscal year starts April 1
 *       const fiscalYearStart = month >= 3 
 *         ? new Date(year, 3, 1)
 *         : new Date(year - 1, 3, 1);
 *       
 *       return {
 *         start: adapter.normalize(fiscalYearStart),
 *         end: adapter.normalize(now)
 *       };
 *     }
 *   }
 * ];
 * 
 * // In app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideCustomPresets(FISCAL_PRESETS)
 *   ]
 * };
 * 
 * // Use in components
 * store.applyPreset('THIS_FISCAL_QUARTER');
 * store.applyPreset('FISCAL_YEAR_TO_DATE');
 * ```
 * 
 * @example
 * ```typescript
 * // Hotel presets
 * const HOTEL_PRESETS: RangePresetPlugin[] = [
 *   {
 *     key: 'CHECK_IN_WEEK',
 *     resolve: (clock, adapter) => {
 *       const now = clock.now();
 *       const dayOfWeek = adapter.getDayOfWeek(now);
 *       
 *       // Check-in week: Friday to Friday
 *       const daysToNextFriday = dayOfWeek <= 5 
 *         ? 5 - dayOfWeek 
 *         : 7 - dayOfWeek + 5;
 *       
 *       const nextFriday = adapter.addDays(now, daysToNextFriday);
 *       const followingFriday = adapter.addDays(nextFriday, 7);
 *       
 *       return { start: nextFriday, end: followingFriday };
 *     }
 *   },
 *   {
 *     key: 'NEXT_30_NIGHTS',
 *     resolve: (clock, adapter) => {
 *       const now = clock.now();
 *       const tomorrow = adapter.addDays(now, 1);
 *       const end = adapter.addDays(tomorrow, 30);
 *       return { start: tomorrow, end };
 *     }
 *   }
 * ];
 * 
 * providers: [provideCustomPresets(HOTEL_PRESETS)]
 * ```
 */
export function provideCustomPresets(presets: RangePresetPlugin[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (registry: PresetRegistry) => {
        return () => {
          presets.forEach(preset => {
            registry.register(preset);
          });

          if (typeof console !== 'undefined' && console.debug) {
            console.debug(
              `[ng-dual-datepicker] Registered ${presets.length} custom presets:`,
              presets.map(p => p.key).join(', ')
            );
          }
        };
      },
      deps: [PresetRegistry]
    }
  ]);
}

/**
 * Provide preset package
 * 
 * Convenience function for external preset packages.
 * 
 * @param packageName - Name of the preset package (for logging)
 * @param presets - Array of presets from the package
 * @returns EnvironmentProviders
 * 
 * @example
 * ```typescript
 * // @acme/fiscal-presets package
 * export function provideFiscalPresets(): EnvironmentProviders {
 *   return providePresetPackage('@acme/fiscal-presets', FISCAL_PRESETS);
 * }
 * 
 * // In app
 * import { provideFiscalPresets } from '@acme/fiscal-presets';
 * 
 * providers: [provideFiscalPresets()]
 * ```
 */
export function providePresetPackage(
  packageName: string,
  presets: RangePresetPlugin[]
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (registry: PresetRegistry) => {
        return () => {
          presets.forEach(preset => {
            registry.register(preset);
          });

          if (typeof console !== 'undefined' && console.debug) {
            console.debug(
              `[${packageName}] Registered ${presets.length} presets:`,
              presets.map(p => p.key).join(', ')
            );
          }
        };
      },
      deps: [PresetRegistry]
    }
  ]);
}
