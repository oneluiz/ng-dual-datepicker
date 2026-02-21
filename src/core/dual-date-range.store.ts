/**
 * Headless Date Range Store using Angular Signals
 * 
 * Architecture:
 * - State lives HERE, not in UI component
 * - Deterministic: no hidden side effects
 * - SSR-compatible: no window/document dependencies
 * - Testable: pure signal-based state
 * - Reusable: inject anywhere (services, components, guards)
 * 
 * Usage:
 * ```typescript
 * // In component
 * const rangeStore = inject(DualDateRangeStore);
 * rangeStore.applyPreset('THIS_MONTH');
 * 
 * // In service (headless!)
 * const store = inject(DualDateRangeStore);
 * const range = store.range();
 * this.http.get(`/api/sales?start=${range.start}&end=${range.end}`);
 * ```
 */

import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { 
  validateRangeOrder, 
  validateRangeBounds, 
  isDateDisabled,
  applyBounds,
  parseISODate,
  formatISODate
} from './range.validator';
import { presetEngine, PresetRange } from './preset.engine';

export interface DateRangeState {
  start: string; // ISO date
  end: string; // ISO date
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
}

export interface DateRangeConfig {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[] | ((date: Date) => boolean);
  enableTimePicker?: boolean;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DualDateRangeStore {
  // Configuration
  private config = signal<DateRangeConfig>({
    enableTimePicker: false,
    defaultStartTime: '00:00',
    defaultEndTime: '23:59'
  });

  // Core state - using signals
  private _startDate = signal<Date | null>(null);
  private _endDate = signal<Date | null>(null);
  private _leftMonth = signal<Date>(new Date());
  private _rightMonth = signal<Date>(this.getNextMonth(new Date()));
  private _selectingStart = signal<boolean>(true);

  // Time state
  private _startTime = signal<string>('00:00');
  private _endTime = signal<string>('23:59');

  // Pending state for requireApply mode
  private _pendingStart = signal<Date | null>(null);
  private _pendingEnd = signal<Date | null>(null);
  private _hasPendingChanges = signal<boolean>(false);

  // Public read-only signals
  readonly startDate = this._startDate.asReadonly();
  readonly endDate = this._endDate.asReadonly();
  readonly leftMonth = this._leftMonth.asReadonly();
  readonly rightMonth = this._rightMonth.asReadonly();
  readonly selectingStart = this._selectingStart.asReadonly();
  readonly startTime = this._startTime.asReadonly();
  readonly endTime = this._endTime.asReadonly();
  readonly hasPendingChanges = this._hasPendingChanges.asReadonly();

  // Computed: ISO range for API consumption
  readonly range = computed<DateRangeState>(() => {
    const start = this._startDate();
    const end = this._endDate();
    const cfg = this.config();

    const result: DateRangeState = {
      start: formatISODate(start),
      end: formatISODate(end)
    };

    if (cfg.enableTimePicker) {
      result.startTime = this._startTime();
      result.endTime = this._endTime();
    }

    return result;
  });

  // Computed: validation state
  readonly isValid = computed(() => {
    const start = this._startDate();
    const end = this._endDate();
    const cfg = this.config();

    const orderValidation = validateRangeOrder(start, end);
    if (!orderValidation.valid) return false;

    const boundsValidation = validateRangeBounds(
      start,
      end,
      cfg.minDate,
      cfg.maxDate
    );
    return boundsValidation.valid;
  });

  // Computed: range text for display
  readonly rangeText = computed(() => {
    const start = this._startDate();
    const end = this._endDate();

    if (!start && !end) return '';
    if (!start) return `? - ${this.formatDateShort(end!)}`;
    if (!end) return `${this.formatDateShort(start)}`;

    return `${this.formatDateShort(start)} - ${this.formatDateShort(end)}`;
  });

  /**
   * Configure the store
   */
  configure(config: Partial<DateRangeConfig>): void {
    this.config.update(current => ({ ...current, ...config }));
  }

  /**
   * Set start date (with validation)
   */
  setStart(date: Date | string | null): void {
    const parsedDate = this.parseDate(date);
    
    if (parsedDate) {
      const cfg = this.config();
      
      // Apply bounds
      const boundedDate = applyBounds(parsedDate, cfg.minDate, cfg.maxDate);
      
      // Check if disabled
      if (isDateDisabled(boundedDate, cfg.disabledDates)) {
        console.warn('Cannot select disabled date');
        return;
      }

      this._startDate.set(boundedDate);
      this._selectingStart.set(false);

      // Auto-adjust end if it becomes invalid
      const end = this._endDate();
      if (end && end < boundedDate) {
        this._endDate.set(null);
      }
    } else {
      this._startDate.set(null);
    }
  }

  /**
   * Set end date (with validation)
   */
  setEnd(date: Date | string | null): void {
    const parsedDate = this.parseDate(date);
    
    if (parsedDate) {
      const cfg = this.config();
      
      // Apply bounds
      const boundedDate = applyBounds(parsedDate, cfg.minDate, cfg.maxDate);
      
      // Check if disabled
      if (isDateDisabled(boundedDate, cfg.disabledDates)) {
        console.warn('Cannot select disabled date');
        return;
      }

      // Validate order
      const start = this._startDate();
      if (start && boundedDate < start) {
        console.warn('End date cannot be before start date');
        return;
      }

      this._endDate.set(boundedDate);
      this._selectingStart.set(true); // Ready for next selection
    } else {
      this._endDate.set(null);
    }
  }

  /**
   * Set complete range at once
   */
  setRange(start: Date | string | null, end: Date | string | null): void {
    this.setStart(start);
    this.setEnd(end);
  }

  /**
   * Set pending selection (for requireApply mode)
   */
  setPendingStart(date: Date | string | null): void {
    const parsedDate = this.parseDate(date);
    this._pendingStart.set(parsedDate);
    this._hasPendingChanges.set(true);
  }

  setPendingEnd(date: Date | string | null): void {
    const parsedDate = this.parseDate(date);
    this._pendingEnd.set(parsedDate);
    this._hasPendingChanges.set(true);
  }

  /**
   * Apply pending changes
   */
  applyPending(): void {
    const pendingStart = this._pendingStart();
    const pendingEnd = this._pendingEnd();

    if (pendingStart) this.setStart(pendingStart);
    if (pendingEnd) this.setEnd(pendingEnd);

    this.clearPending();
  }

  /**
   * Cancel pending changes
   */
  cancelPending(): void {
    this.clearPending();
  }

  private clearPending(): void {
    this._pendingStart.set(null);
    this._pendingEnd.set(null);
    this._hasPendingChanges.set(false);
  }

  /**
   * Reset to empty state
   */
  reset(): void {
    this._startDate.set(null);
    this._endDate.set(null);
    this._selectingStart.set(true);
    this.clearPending();
  }

  /**
   * Apply a preset by key
   */
  applyPreset(presetKey: string, now: Date = new Date()): void {
    const range = presetEngine.resolve(presetKey, now);
    
    if (range) {
      this.setRange(range.start, range.end);
    } else {
      console.warn(`Preset "${presetKey}" not found`);
    }
  }

  /**
   * Navigate left calendar month
   */
  setLeftMonth(date: Date): void {
    this._leftMonth.set(date);
    
    // Ensure right month is always after left
    const right = this._rightMonth();
    if (right <= date) {
      this._rightMonth.set(this.getNextMonth(date));
    }
  }

  /**
   * Navigate right calendar month
   */
  setRightMonth(date: Date): void {
    this._rightMonth.set(date);
    
    // Ensure left month is always before right
    const left = this._leftMonth();
    if (left >= date) {
      this._leftMonth.set(this.getPreviousMonth(date));
    }
  }

  /**
   * Set time values
   */
  setStartTime(time: string): void {
    this._startTime.set(time);
  }

  setEndTime(time: string): void {
    this._endTime.set(time);
  }

  /**
   * Get current state as snapshot
   */
  getSnapshot(): DateRangeState {
    return this.range();
  }

  /**
   * Load state from snapshot
   */
  loadSnapshot(snapshot: DateRangeState): void {
    this.setRange(snapshot.start, snapshot.end);
    
    if (snapshot.startTime) {
      this.setStartTime(snapshot.startTime);
    }
    
    if (snapshot.endTime) {
      this.setEndTime(snapshot.endTime);
    }
  }

  // Helper methods
  private parseDate(date: Date | string | null): Date | null {
    if (!date) return null;
    if (date instanceof Date) return date;
    return parseISODate(date);
  }

  private getNextMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
  }

  private getPreviousMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1);
  }

  private formatDateShort(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }
}
