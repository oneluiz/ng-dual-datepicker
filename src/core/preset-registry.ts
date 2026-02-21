/**
 * Preset Registry Service
 * 
 * Version: 3.6.0
 * 
 * Central registry for all date range preset plugins (built-in and custom).
 * 
 * ARCHITECTURE:
 * - Singleton service (providedIn: 'root')
 * - Manages Map<string, RangePresetPlugin>
 * - Thread-safe registration
 * - Supports plugin override (useful for testing)
 * 
 * USAGE:
 * ```typescript
 * // In app
 * const registry = inject(PresetRegistry);
 * 
 * // Register custom preset
 * registry.register({
 *   key: 'MY_CUSTOM_PRESET',
 *   resolve: (clock, adapter) => {
 *     const now = clock.now();
 *     return { start: now, end: now };
 *   }
 * });
 * 
 * // Check if preset exists
 * if (registry.has('MY_CUSTOM_PRESET')) {
 *   store.applyPreset('MY_CUSTOM_PRESET');
 * }
 * 
 * // Get all registered presets
 * const allPresets = registry.getAll();
 * console.log('Available presets:', allPresets.map(p => p.key));
 * ```
 * 
 * EXTERNAL PACKAGES:
 * ```typescript
 * // @acme/fiscal-presets
 * export function provideFiscalPresets() {
 *   return {
 *     provide: APP_INITIALIZER,
 *     multi: true,
 *     useFactory: (registry: PresetRegistry) => {
 *       return () => {
 *         FISCAL_PRESETS.forEach(p => registry.register(p));
 *       };
 *     },
 *     deps: [PresetRegistry]
 *   };
 * }
 * ```
 */

import { Injectable } from '@angular/core';
import { RangePresetPlugin, isRangePresetPlugin } from './range-preset.plugin';

/**
 * Preset Registry Service
 * 
 * Manages registration and retrieval of date range preset plugins.
 * 
 * DESIGN:
 * - Uses Map for O(1) lookups
 * - Immutable getAll() returns copy
 * - Supports plugin override (last registration wins)
 * - Validates plugins before registration
 */
@Injectable({
  providedIn: 'root'
})
export class PresetRegistry {
  /**
   * Internal map of registered presets
   * Key: preset key (e.g., 'TODAY', 'LAST_7_DAYS')
   * Value: RangePresetPlugin instance
   */
  private readonly presets = new Map<string, RangePresetPlugin>();

  /**
   * Register a date range preset plugin
   * 
   * If a preset with the same key already exists, it will be overridden.
   * This is useful for:
   * - Testing (override built-in presets with mocks)
   * - Customization (replace default behavior)
   * - Hot-reload scenarios
   * 
   * @param plugin - The preset plugin to register
   * @throws Error if plugin is invalid (missing key or resolve function)
   * 
   * @example
   * ```typescript
   * registry.register({
   *   key: 'LAST_BUSINESS_WEEK',
   *   resolve: (clock, adapter) => {
   *     const now = clock.now();
   *     const dayOfWeek = adapter.getDayOfWeek(now);
   *     
   *     // Go back to last Friday
   *     const daysToLastFriday = dayOfWeek === 0 ? 2 : (dayOfWeek + 2) % 7;
   *     const lastFriday = adapter.addDays(now, -daysToLastFriday);
   *     
   *     // Business week: Monday to Friday
   *     const monday = adapter.addDays(lastFriday, -4);
   *     
   *     return { start: monday, end: lastFriday };
   *   }
   * });
   * ```
   */
  register(plugin: RangePresetPlugin): void {
    // Validate plugin
    if (!isRangePresetPlugin(plugin)) {
      throw new Error(
        `Invalid preset plugin: must have 'key' (string) and 'resolve' (function). ` +
        `Received: ${JSON.stringify(plugin)}`
      );
    }

    // Validate key is not empty
    if (!plugin.key || plugin.key.trim().length === 0) {
      throw new Error('Preset plugin key cannot be empty');
    }

    // Register (override if exists)
    const key = plugin.key.toUpperCase(); // Normalize to uppercase
    
    // Warn if overriding
    if (this.presets.has(key)) {
      console.warn(
        `[PresetRegistry] Overriding existing preset: "${key}". ` +
        `This is normal if you're customizing built-in presets.`
      );
    }

    this.presets.set(key, plugin);
  }

  /**
   * Register multiple preset plugins at once
   * 
   * Convenience method for bulk registration.
   * Useful when importing preset packages.
   * 
   * @param plugins - Array of preset plugins to register
   * 
   * @example
   * ```typescript
   * import { FISCAL_PRESETS } from '@acme/fiscal-presets';
   * 
   * registry.registerAll(FISCAL_PRESETS);
   * ```
   */
  registerAll(plugins: RangePresetPlugin[]): void {
    plugins.forEach(plugin => this.register(plugin));
  }

  /**
   * Get a preset plugin by key
   * 
   * @param key - Preset key (case-insensitive, e.g., 'today' or 'TODAY')
   * @returns The preset plugin or undefined if not found
   * 
   * @example
   * ```typescript
   * const preset = registry.get('LAST_7_DAYS');
   * if (preset) {
   *   const range = preset.resolve(clock, adapter);
   *   console.log('Range:', range);
   * }
   * ```
   */
  get(key: string): RangePresetPlugin | undefined {
    return this.presets.get(key.toUpperCase());
  }

  /**
   * Check if a preset exists in the registry
   * 
   * @param key - Preset key (case-insensitive)
   * @returns true if preset exists, false otherwise
   * 
   * @example
   * ```typescript
   * if (registry.has('THIS_FISCAL_QUARTER')) {
   *   store.applyPreset('THIS_FISCAL_QUARTER');
   * } else {
   *   console.error('Fiscal quarter preset not registered');
   * }
   * ```
   */
  has(key: string): boolean {
    return this.presets.has(key.toUpperCase());
  }

  /**
   * Get all registered preset plugins
   * 
   * Returns a NEW array (immutable) to prevent external modification.
   * 
   * @returns Array of all registered preset plugins
   * 
   * @example
   * ```typescript
   * const allPresets = registry.getAll();
   * console.log('Available presets:');
   * allPresets.forEach(preset => {
   *   console.log(`- ${preset.key}`);
   * });
   * ```
   */
  getAll(): RangePresetPlugin[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get all preset keys
   * 
   * Convenience method to list available preset identifiers.
   * 
   * @returns Array of preset keys (uppercase)
   * 
   * @example
   * ```typescript
   * const keys = registry.getAllKeys();
   * // ['TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'THIS_MONTH', ...]
   * ```
   */
  getAllKeys(): string[] {
    return Array.from(this.presets.keys());
  }

  /**
   * Get count of registered presets
   * 
   * @returns Number of registered presets
   * 
   * @example
   * ```typescript
   * console.log(`${registry.count()} presets available`);
   * ```
   */
  count(): number {
    return this.presets.size;
  }

  /**
   * Unregister a preset plugin
   * 
   * Useful for:
   * - Testing cleanup
   * - Dynamic preset management
   * - Removing deprecated presets
   * 
   * @param key - Preset key to remove (case-insensitive)
   * @returns true if preset was removed, false if it didn't exist
   * 
   * @example
   * ```typescript
   * registry.unregister('MY_TEMPORARY_PRESET');
   * ```
   */
  unregister(key: string): boolean {
    return this.presets.delete(key.toUpperCase());
  }

  /**
   * Clear all registered presets
   * 
   * ⚠️ USE WITH CAUTION: This removes ALL presets including built-ins.
   * 
   * Useful for:
   * - Test teardown
   * - Complete re-initialization scenarios
   * 
   * @example
   * ```typescript
   * // In test cleanup
   * afterEach(() => {
   *   registry.clear();
   * });
   * ```
   */
  clear(): void {
    this.presets.clear();
  }
}
