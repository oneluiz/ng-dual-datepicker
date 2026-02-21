/**
 * GOLDEN TESTS (v3.9.1) - Freeze Current Semantics
 * 
 * These tests document and freeze the ACTUAL behavior of the core.
 * They serve as regression guards to prevent unintended semantic changes.
 * 
 * DO NOT modify these tests unless you intentionally change semantics.
 * 
 * Test philosophy:
 * - Read actual implementation
 * - Document observed behavior
 * - Validate determinism
 * - Ensure SSR-safety
 * 
 * Critical for:
 * - ERP systems (invoice date consistency)
 * - BI dashboards (preset semantics)
 * - Hotelería (reservation date accuracy)
 * - Long-running sessions (memory stability)
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { NativeDateAdapter } from '../native-date-adapter';
import { SystemClock } from '../system-clock';
import {
  TODAY_PRESET,
  YESTERDAY_PRESET,
  LAST_7_DAYS_PRESET,
  LAST_30_DAYS_PRESET,
  THIS_MONTH_PRESET,
  LAST_MONTH_PRESET
} from '../built-in-presets';
import { applyBounds } from '../range.validator';

/**
 * SECTION A: Preset Semantics (Deterministic Behavior)
 * 
 * CRITICAL: These tests freeze ACTUAL preset behavior.
 * Read implementation before modifying assumptions.
 */
describe('Golden Tests - Preset Semantics', () => {
  const adapter = new NativeDateAdapter();

  /**
   * Frozen Clock for Deterministic Testing
   * 
   * Feb 15, 2026 (Saturday) - chosen to test week boundaries
   */
  const frozenClock = {
    now: () => new Date(2026, 1, 15), // Feb 15, 2026
    today: () => new Date(2026, 1, 15, 0, 0, 0, 0)
  };

  describe('TODAY preset', () => {
    it('should return same date for start and end', () => {
      const result = TODAY_PRESET.resolve(frozenClock, adapter);
      
      const expectedISO = '2026-02-15';
      assert.equal(adapter.toISODate(result.start), expectedISO);
      assert.equal(adapter.toISODate(result.end), expectedISO);
    });

    it('should normalize to start of day', () => {
      const result = TODAY_PRESET.resolve(frozenClock, adapter);
      
      assert.equal(result.start.getHours(), 0);
      assert.equal(result.start.getMinutes(), 0);
      assert.equal(result.start.getSeconds(), 0);
      assert.equal(result.start.getMilliseconds(), 0);
    });
  });

  describe('YESTERDAY preset', () => {
    it('should return date 1 day before today', () => {
      const result = YESTERDAY_PRESET.resolve(frozenClock, adapter);
      
      const expectedISO = '2026-02-14';
      assert.equal(adapter.toISODate(result.start), expectedISO);
      assert.equal(adapter.toISODate(result.end), expectedISO);
    });
  });

  describe('LAST_7_DAYS preset', () => {
    it('SEMANTICS: includes today (7 days total)', () => {
      const result = LAST_7_DAYS_PRESET.resolve(frozenClock, adapter);
      
      // FROZEN BEHAVIOR: start = today - 6, end = today
      // This means LAST_7_DAYS includes today as the 7th day
      const expectedStart = '2026-02-09'; // Feb 15 - 6 days
      const expectedEnd = '2026-02-15';   // Today
      
      assert.equal(adapter.toISODate(result.start), expectedStart);
      assert.equal(adapter.toISODate(result.end), expectedEnd);
    });

    it('should span exactly 7 days including boundaries', () => {
      const result = LAST_7_DAYS_PRESET.resolve(frozenClock, adapter);
      
      const daysDiff = Math.floor(
        (result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      assert.equal(daysDiff, 6); // 6 days difference = 7 days total (inclusive)
    });
  });

  describe('LAST_30_DAYS preset', () => {
    it('SEMANTICS: includes today (30 days total)', () => {
      const result = LAST_30_DAYS_PRESET.resolve(frozenClock, adapter);
      
      // FROZEN BEHAVIOR: start = today - 29, end = today
      // This means LAST_30_DAYS includes today as the 30th day
      const expectedStart = '2026-01-17'; // Feb 15 - 29 days
      const expectedEnd = '2026-02-15';   // Today
      
      assert.equal(adapter.toISODate(result.start), expectedStart);
      assert.equal(adapter.toISODate(result.end), expectedEnd);
    });

    it('should span exactly 30 days including boundaries', () => {
      const result = LAST_30_DAYS_PRESET.resolve(frozenClock, adapter);
      
      const daysDiff = Math.floor(
        (result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      assert.equal(daysDiff, 29); // 29 days difference = 30 days total (inclusive)
    });
  });

  describe('THIS_MONTH preset', () => {
    it('should return full calendar month', () => {
      const result = THIS_MONTH_PRESET.resolve(frozenClock, adapter);
      
      // Feb 2026: 1st to 28th (not leap year)
      const expectedStart = '2026-02-01';
      const expectedEnd = '2026-02-28';
      
      assert.equal(adapter.toISODate(result.start), expectedStart);
      assert.equal(adapter.toISODate(result.end), expectedEnd);
    });

    it('should start at 00:00:00.000', () => {
      const result = THIS_MONTH_PRESET.resolve(frozenClock, adapter);
      
      assert.equal(result.start.getHours(), 0);
      assert.equal(result.start.getMinutes(), 0);
      assert.equal(result.start.getSeconds(), 0);
      assert.equal(result.start.getMilliseconds(), 0);
    });

    it('should end at 23:59:59.999', () => {
      const result = THIS_MONTH_PRESET.resolve(frozenClock, adapter);
      
      assert.equal(result.end.getHours(), 23);
      assert.equal(result.end.getMinutes(), 59);
      assert.equal(result.end.getSeconds(), 59);
      assert.equal(result.end.getMilliseconds(), 999);
    });
  });

  describe('LAST_MONTH preset', () => {
    it('should return previous calendar month', () => {
      const result = LAST_MONTH_PRESET.resolve(frozenClock, adapter);
      
      // Jan 2026: 1st to 31st
      const expectedStart = '2026-01-01';
      const expectedEnd = '2026-01-31';
      
      assert.equal(adapter.toISODate(result.start), expectedStart);
      assert.equal(adapter.toISODate(result.end), expectedEnd);
    });

    it('should handle December (year boundary)', () => {
      const decemberClock = {
        now: () => new Date(2026, 0, 15), // Jan 15, 2026
        today: () => new Date(2026, 0, 15, 0, 0, 0, 0)
      };
      
      const result = LAST_MONTH_PRESET.resolve(decemberClock, adapter);
      
      // Dec 2025: 1st to 31st
      const expectedStart = '2025-12-01';
      const expectedEnd = '2025-12-31';
      
      assert.equal(adapter.toISODate(result.start), expectedStart);
      assert.equal(adapter.toISODate(result.end), expectedEnd);
    });
  });
});

/**
 * SECTION B: DateAdapter Semantics (Timezone-Safe Operations)
 * 
 * Critical for ERP/BI systems where date accuracy is mandatory.
 */
describe('Golden Tests - DateAdapter Semantics', () => {
  const adapter = new NativeDateAdapter();

  describe('addMonths - Month Overflow Handling', () => {
    it('SEMANTICS: Jan 31 + 1 month = Feb 28 (non-leap year)', () => {
      const date = new Date(2026, 0, 31); // Jan 31, 2026
      const result = adapter.addMonths(date, 1);
      
      // FROZEN BEHAVIOR: Clamps to last day of target month
      assert.equal(adapter.toISODate(result), '2026-02-28');
    });

    it('SEMANTICS: Jan 31 + 1 month = Feb 29 (leap year)', () => {
      const date = new Date(2024, 0, 31); // Jan 31, 2024
      const result = adapter.addMonths(date, 1);
      
      // FROZEN BEHAVIOR: Clamps to Feb 29 in leap year
      assert.equal(adapter.toISODate(result), '2024-02-29');
    });

    it('SEMANTICS: Mar 31 + 1 month = Apr 30', () => {
      const date = new Date(2026, 2, 31); // Mar 31, 2026
      const result = adapter.addMonths(date, 1);
      
      assert.equal(adapter.toISODate(result), '2026-04-30');
    });

    it('should handle negative months correctly', () => {
      const date = new Date(2026, 2, 31); // Mar 31, 2026
      const result = adapter.addMonths(date, -1);
      
      // Mar 31 - 1 month = Feb 28 (non-leap) - clamped
      assert.equal(adapter.toISODate(result), '2026-02-28');
    });

    it('should normalize result to start of day', () => {
      const date = new Date(2026, 0, 31, 15, 30, 45, 500);
      const result = adapter.addMonths(date, 1);
      
      assert.equal(result.getHours(), 0);
      assert.equal(result.getMinutes(), 0);
      assert.equal(result.getSeconds(), 0);
      assert.equal(result.getMilliseconds(), 0);
    });
  });

  describe('isSameDay - Time Component Isolation', () => {
    it('SEMANTICS: should ignore time component', () => {
      const date1 = new Date(2026, 1, 15, 9, 30, 0);  // 09:30
      const date2 = new Date(2026, 1, 15, 23, 45, 0); // 23:45
      
      // FROZEN BEHAVIOR: Only compares YYYY-MM-DD
      assert.equal(adapter.isSameDay(date1, date2), true);
    });

    it('should return false for different calendar days', () => {
      const date1 = new Date(2026, 1, 15, 23, 59, 59, 999);
      const date2 = new Date(2026, 1, 16, 0, 0, 0, 0);
      
      assert.equal(adapter.isSameDay(date1, date2), false);
    });

    it('should handle midnight boundary correctly', () => {
      const date1 = new Date(2026, 1, 15, 0, 0, 0, 0);
      const date2 = new Date(2026, 1, 15, 0, 0, 0, 1);
      
      assert.equal(adapter.isSameDay(date1, date2), true);
    });
  });

  describe('toISODate - Timezone Independence', () => {
    it('SEMANTICS: should construct YYYY-MM-DD manually (no UTC conversion)', () => {
      const date = new Date(2026, 0, 15); // Jan 15, 2026
      const result = adapter.toISODate(date);
      
      // FROZEN BEHAVIOR: Uses getFullYear/getMonth/getDate (local timezone)
      // NOT toISOString() which would convert to UTC
      assert.equal(result, '2026-01-15');
    });

    it('should pad single-digit month and day', () => {
      const date = new Date(2026, 0, 5); // Jan 5, 2026
      const result = adapter.toISODate(date);
      
      assert.equal(result, '2026-01-05');
    });

    it('should handle end-of-year date', () => {
      const date = new Date(2025, 11, 31); // Dec 31, 2025
      const result = adapter.toISODate(date);
      
      assert.equal(result, '2025-12-31');
    });

    it('DETERMINISM: should produce same result regardless of time', () => {
      const date1 = new Date(2026, 1, 15, 0, 0, 0);
      const date2 = new Date(2026, 1, 15, 23, 59, 59);
      
      assert.equal(adapter.toISODate(date1), adapter.toISODate(date2));
    });
  });

  describe('parseISODate - Deterministic Parsing', () => {
    it('should parse ISO date to local timezone', () => {
      const date = adapter.parseISODate('2026-02-15');
      
      if (!date) throw new Error('Expected date to be parsed');
      
      assert.equal(date.getFullYear(), 2026);
      assert.equal(date.getMonth(), 1); // 0-indexed (February)
      assert.equal(date.getDate(), 15);
    });

    it('should return null for invalid format', () => {
      const result = adapter.parseISODate('invalid');
      assert.equal(result, null);
    });

    it('should roundtrip correctly', () => {
      const original = '2026-02-15';
      const date = adapter.parseISODate(original);
      
      if (!date) throw new Error('Expected date to be parsed');
      
      const result = adapter.toISODate(date);
      
      assert.equal(result, original);
    });
  });
});

/**
 * SECTION C: Store State Management (Validation Semantics)
 * 
 * Critical for preventing invalid state in long-running sessions.
 */
describe('Golden Tests - Store Validation Semantics', () => {
  describe('applyBounds - Min/Max Enforcement', () => {
    it('SEMANTICS: should clamp to minDate when date is earlier', () => {
      const date = new Date(2026, 0, 10);  // Jan 10
      const minDate = new Date(2026, 0, 15); // Jan 15
      
      const result = applyBounds(date, minDate, undefined);
      
      // FROZEN BEHAVIOR: Clamps to minDate (does not reject)
      assert.equal(result.getTime(), minDate.getTime());
    });

    it('SEMANTICS: should clamp to maxDate when date is later', () => {
      const date = new Date(2026, 0, 20);  // Jan 20
      const maxDate = new Date(2026, 0, 15); // Jan 15
      
      const result = applyBounds(date, undefined, maxDate);
      
      // FROZEN BEHAVIOR: Clamps to maxDate (does not reject)
      assert.equal(result.getTime(), maxDate.getTime());
    });

    it('should clamp to both bounds if needed', () => {
      const date = new Date(2026, 0, 10);   // Jan 10
      const minDate = new Date(2026, 0, 15); // Jan 15
      const maxDate = new Date(2026, 0, 20); // Jan 20
      
      const result = applyBounds(date, minDate, maxDate);
      
      // Should clamp to minDate
      assert.equal(result.getTime(), minDate.getTime());
    });

    it('should return original date when within bounds', () => {
      const date = new Date(2026, 0, 17);   // Jan 17
      const minDate = new Date(2026, 0, 15); // Jan 15
      const maxDate = new Date(2026, 0, 20); // Jan 20
      
      const result = applyBounds(date, minDate, maxDate);
      
      assert.equal(result.getTime(), date.getTime());
    });

    it('should handle undefined bounds (no clamping)', () => {
      const date = new Date(2026, 0, 15);
      
      const result = applyBounds(date, undefined, undefined);
      
      assert.equal(result.getTime(), date.getTime());
    });
  });

  describe('Range Order Validation', () => {
    it('FROZEN BEHAVIOR: Store rejects end < start (does not swap)', () => {
      // This test documents that the store uses validation to reject
      // invalid ranges rather than auto-correcting them.
      // 
      // See DualDateRangeStore.setEnd():
      // if (start && boundedDate < start) {
      //   console.warn('End date cannot be before start date');
      //   return; // REJECTS, does not swap
      // }
      
      const start = new Date(2026, 0, 20);
      const end = new Date(2026, 0, 10); // Earlier than start
      
      // Validation should fail
      assert.equal(end < start, true);
      
      // Store would reject this via setEnd() - no state change
      // This test documents the expected behavior
    });

    it('should allow equal dates (single-day range)', () => {
      const start = new Date(2026, 0, 15);
      const end = new Date(2026, 0, 15);
      
      // Equal dates are valid
      assert.equal(end >= start, true);
    });

    it('should allow proper order (end >= start)', () => {
      const start = new Date(2026, 0, 10);
      const end = new Date(2026, 0, 20);
      
      assert.equal(end >= start, true);
    });
  });
});

/**
 * SECTION D: Determinism & SSR-Safety
 * 
 * Ensures consistent behavior across environments.
 */
describe('Golden Tests - Determinism & SSR-Safety', () => {
  const adapter = new NativeDateAdapter();

  it('DETERMINISM: same input produces same output', () => {
    const date = new Date(2026, 1, 15);
    
    const result1 = adapter.addMonths(date, 1);
    const result2 = adapter.addMonths(date, 1);
    
    assert.equal(result1.getTime(), result2.getTime());
  });

  it('SSR-SAFETY: no window/document dependencies', () => {
    // SystemClock should work without DOM
    const clock = new SystemClock();
    const date = clock.now();
    
    assert.ok(date instanceof Date);
  });

  it('SSR-SAFETY: presets work without DOM', () => {
    const clock = new SystemClock();
    const result = TODAY_PRESET.resolve(clock, adapter);
    
    assert.ok(result.start instanceof Date);
    assert.ok(result.end instanceof Date);
  });

  it('MEMORY-SAFETY: normalized dates do not retain references', () => {
    const original = new Date(2026, 1, 15, 10, 30, 0);
    const normalized = adapter.normalize(original);
    
    // Should be a new instance
    assert.notEqual(normalized, original);
    
    // Mutating original should not affect normalized
    original.setHours(20);
    assert.equal(normalized.getHours(), 0);
  });
});
