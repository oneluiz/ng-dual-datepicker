/**
 * Headless Preset Engine
 * Pure functions that resolve date ranges WITHOUT render dependency
 * Perfect for SSR, global state, dashboard filters
 * 
 * v3.5.0: SSR-Safe via Clock Injection
 * All date calculations use DateClock instead of new Date()
 * This ensures server and client resolve identical presets
 * 
 * v3.5.1: Timezone-Safe via DateAdapter
 * All date operations use DateAdapter for consistent behavior
 * Fixes timezone bugs common in ERP/BI/POS systems
 * 
 * v3.6.0: Plugin-Driven Architecture
 * Preset Engine now uses PresetRegistry for plugin-based extensibility
 * Follows Open/Closed Principle - extend without modifying core
 * Supports external preset packages for industry-specific needs
 */

import { Injectable, inject } from '@angular/core';
import { DateClock, DATE_CLOCK } from './date-clock';
import { SystemClock } from './system-clock';
import { DateAdapter, DATE_ADAPTER } from './date-adapter';
import { NativeDateAdapter } from './native-date-adapter';
import { PresetRegistry } from './preset-registry';

/**
 * @deprecated Use RangePresetPlugin from './range-preset.plugin' instead
 * Kept for backward compatibility
 */
export interface RangePreset {
  /**
   * Resolve preset to actual date range
   * @param now - Current date for deterministic calculation
   */
  resolve(now: Date): { start: Date; end: Date };
}

export interface PresetRange {
  start: string; // ISO format
  end: string; // ISO format
}

/**
 * Preset Engine - Plugin-Driven Architecture
 * 
 * ARCHITECTURE (v3.6.0):
 * - NO longer contains presets internally
 * - Uses PresetRegistry for plugin management
 * - Injects DateClock for SSR-safe time
 * - Injects DateAdapter for timezone-safe operations
 * - Follows Open/Closed Principle
 * 
 * BACKWARD COMPATIBILITY:
 * - Old API unchanged: resolve(), register(), getPresetKeys()
 * - Built-in presets auto-registered via provider
 * - Existing code continues to work
 * 
 * EXTENSIBILITY:
 * ```typescript
 * // Register custom preset via registry
 * const registry = inject(PresetRegistry);
 * registry.register({
 *   key: 'MY_PRESET',
 *   resolve: (clock, adapter) => {
 *     const now = clock.now();
 *     return { start: now, end: now };
 *   }
 * });
 * 
 * // Use via engine
 * const engine = inject(PresetEngine);
 * const range = engine.resolve('MY_PRESET');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class PresetEngine {
  private clock: DateClock;
  private adapter: DateAdapter;
  private registry: PresetRegistry;

  constructor() {
    // Inject dependencies with fallbacks
    try {
      this.clock = inject(DATE_CLOCK, { optional: true }) ?? new SystemClock();
      this.adapter = inject(DATE_ADAPTER, { optional: true }) ?? new NativeDateAdapter();
      this.registry = inject(PresetRegistry);
    } catch {
      // Fallback if inject() fails outside injection context
      this.clock = new SystemClock();
      this.adapter = new NativeDateAdapter();
      this.registry = new PresetRegistry();
    }
  }

  /**
   * Register a custom preset
   * 
   * @deprecated Use PresetRegistry.register() directly for new code
   * Kept for backward compatibility
   * 
   * @param key - Preset key (e.g., 'MY_CUSTOM_PRESET')
   * @param preset - Legacy RangePreset object
   */
  register(key: string, preset: RangePreset): void {
    // Convert legacy RangePreset to RangePresetPlugin
    this.registry.register({
      key: key,
      resolve: (clock, adapter) => {
        const now = clock.now();
        return preset.resolve(now);
      }
    });
  }

  /**
   * Resolve a preset to date range
   * 
   * Plugin Architecture:
   * 1. Looks up plugin in PresetRegistry
   * 2. Calls plugin.resolve(clock, adapter)
   * 3. Returns ISO date range
   * 
   * SSR Note: Uses injected DateClock for deterministic resolution
   * Timezone Note: Uses injected DateAdapter for consistent operations
   * 
   * @param key - Preset key (e.g., 'TODAY', 'LAST_7_DAYS')
   * @param now - Optional override for current date (defaults to clock.now())
   * @returns ISO date range or null if preset not found
   */
  resolve(key: string, now?: Date): PresetRange | null {
    const plugin = this.registry.get(key);
    
    if (!plugin) {
      console.warn(`[PresetEngine] Preset "${key}" not found in registry`);
      return null;
    }

    // Create temporary clock if now is provided
    const effectiveClock = now 
      ? { now: () => now } 
      : this.clock;

    // Resolve via plugin
    const { start, end } = plugin.resolve(effectiveClock, this.adapter);

    // Convert to ISO format
    return {
      start: this.adapter.toISODate(start),
      end: this.adapter.toISODate(end)
    };
  }

  /**
   * Get all available preset keys
   * 
   * Delegates to PresetRegistry
   * 
   * @returns Array of registered preset keys
   */
  getPresetKeys(): string[] {
    return this.registry.getAllKeys();
  }

  /**
   * Check if a preset exists
   * 
   * @param key - Preset key to check
   * @returns true if preset is registered
   */
  hasPreset(key: string): boolean {
    return this.registry.has(key);
  }
}

/**
 * Create a custom preset from a function
 * 
 * @deprecated Use RangePresetPlugin interface instead
 * Kept for backward compatibility
 */
export function createPreset(
  resolver: (now: Date) => { start: Date; end: Date }
): RangePreset {
  return { resolve: resolver };
}

/**
 * @deprecated Use dependency injection instead:
 * ```typescript
 * private engine = inject(PresetEngine);
 * ```
 * 
 * Singleton preset engine instance for backward compatibility
 * 
 * WARNING: This singleton uses SystemClock directly and is NOT SSR-safe.
 * For SSR applications, inject PresetEngine and override DATE_CLOCK token.
 * 
 * This export will be removed in v4.0.0
 */
export const presetEngine = new PresetEngine();
