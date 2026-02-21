/**
 * NativeDateAdapter Tests
 * 
 * Tests for timezone-safe date operations.
 * 
 * Run with: node --test
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { NativeDateAdapter } from '../native-date-adapter';
import { FixedClock, makeDate, iso, isSameCalendarDay } from '../testing';

describe('NativeDateAdapter', () => {
  const adapter = new NativeDateAdapter();

  describe('toISODate - timezone-safe string conversion', () => {
    test('should convert Date to YYYY-MM-DD without timezone shift', () => {
      const date = makeDate(2026, 2, 21); // Feb 21, 2026
      const result = adapter.toISODate(date);
      
      assert.equal(result, '2026-02-21');
    });

    test('should handle edge case: last day of month', () => {
      const date = makeDate(2026, 2, 28); // Feb 28, 2026 (non-leap year)
      const result = adapter.toISODate(date);
      
      assert.equal(result, '2026-02-28');
    });

    test('should handle edge case: first day of year', () => {
      const date = makeDate(2026, 1, 1); // Jan 1, 2026
      const result = adapter.toISODate(date);
      
      assert.equal(result, '2026-01-01');
    });

    test('should handle edge case: last day of year', () => {
      const date = makeDate(2026, 12, 31); // Dec 31, 2026
      const result = adapter.toISODate(date);
      
      assert.equal(result, '2026-12-31');
    });

    test('should ignore time component', () => {
      const morning = new Date(2026, 1, 21, 8, 30, 45, 123); // Feb 21, 2026 08:30:45.123
      const evening = new Date(2026, 1, 21, 20, 15, 30, 999); // Feb 21, 2026 20:15:30.999
      
      assert.equal(adapter.toISODate(morning), '2026-02-21');
      assert.equal(adapter.toISODate(evening), '2026-02-21');
    });
  });

  describe('parseISODate - timezone-safe string parsing', () => {
    test('should parse YYYY-MM-DD to local Date', () => {
      const result = adapter.parseISODate('2026-02-21');
      
      assert(result !== null);
      assert.equal(result.getFullYear(), 2026);
      assert.equal(result.getMonth(), 1); // 0-indexed (February)
      assert.equal(result.getDate(), 21);
    });

    test('should roundtrip: iso -> Date -> iso', () => {
      const original = '2026-02-21';
      const parsed = adapter.parseISODate(original);
      const backToString = adapter.toISODate(parsed!);
      
      assert.equal(backToString, original);
    });

    test('should roundtrip: Date -> iso -> Date', () => {
      const original = makeDate(2026, 2, 21);
      const isoString = adapter.toISODate(original);
      const parsed = adapter.parseISODate(isoString);
      
      assert(isSameCalendarDay(parsed!, original));
    });

    test('should return null for invalid formats', () => {
      assert.equal(adapter.parseISODate('2026/02/21'), null); // wrong separator
      assert.equal(adapter.parseISODate('21-02-2026'), null); // wrong order
      assert.equal(adapter.parseISODate('2026-2-21'), null); // missing leading zero
      assert.equal(adapter.parseISODate('invalid'), null);
      assert.equal(adapter.parseISODate(''), null);
    });

    test('should return null for invalid dates', () => {
      assert.equal(adapter.parseISODate('2026-02-31'), null); // Feb 31 doesn't exist
      assert.equal(adapter.parseISODate('2026-13-01'), null); // month 13 doesn't exist
      assert.equal(adapter.parseISODate('2026-00-15'), null); // month 0 doesn't exist
    });

    test('should normalize parsed date to start of day', () => {
      const parsed = adapter.parseISODate('2026-02-21');
      
      assert.equal(parsed!.getHours(), 0);
      assert.equal(parsed!.getMinutes(), 0);
      assert.equal(parsed!.getSeconds(), 0);
      assert.equal(parsed!.getMilliseconds(), 0);
    });
  });

  describe('isSameDay - ignores time component', () => {
    test('should return true for same calendar day, different times', () => {
      const dateA = new Date(2026, 1, 21, 0, 0, 0, 0); // Feb 21, 2026 00:00
      const dateB = new Date(2026, 1, 21, 23, 59, 59, 999); // Feb 21, 2026 23:59:59.999
      
      assert.equal(adapter.isSameDay(dateA, dateB), true);
    });

    test('should return false for different calendar days', () => {
      const dateA = makeDate(2026, 2, 21); // Feb 21, 2026
      const dateB = makeDate(2026, 2, 22); // Feb 22, 2026
      
      assert.equal(adapter.isSameDay(dateA, dateB), false);
    });

    test('should return false for adjacent days at midnight', () => {
      const dateA = new Date(2026, 1, 21, 23, 59, 59, 999); // Feb 21 end of day
      const dateB = new Date(2026, 1, 22, 0, 0, 0, 0); // Feb 22 start of day
      
      assert.equal(adapter.isSameDay(dateA, dateB), false);
    });
  });

  describe('isBeforeDay - calendar day comparison', () => {
    test('should return true when date A is before date B', () => {
      const dateA = makeDate(2026, 2, 20);
      const dateB = makeDate(2026, 2, 21);
      
      assert.equal(adapter.isBeforeDay(dateA, dateB), true);
    });

    test('should return false when date A is after date B', () => {
      const dateA = makeDate(2026, 2, 22);
      const dateB = makeDate(2026, 2, 21);
      
      assert.equal(adapter.isBeforeDay(dateA, dateB), false);
    });

    test('should return false when dates are same day', () => {
      const dateA = new Date(2026, 1, 21, 8, 0);
      const dateB = new Date(2026, 1, 21, 20, 0);
      
      assert.equal(adapter.isBeforeDay(dateA, dateB), false);
    });
  });

  describe('isAfterDay - calendar day comparison', () => {
    test('should return true when date A is after date B', () => {
      const dateA = makeDate(2026, 2, 22);
      const dateB = makeDate(2026, 2, 21);
      
      assert.equal(adapter.isAfterDay(dateA, dateB), true);
    });

    test('should return false when date A is before date B', () => {
      const dateA = makeDate(2026, 2, 20);
      const dateB = makeDate(2026, 2, 21);
      
      assert.equal(adapter.isAfterDay(dateA, dateB), false);
    });

    test('should return false when dates are same day', () => {
      const dateA = new Date(2026, 1, 21, 20, 0);
      const dateB = new Date(2026, 1, 21, 8, 0);
      
      assert.equal(adapter.isAfterDay(dateA, dateB), false);
    });
  });

  describe('addDays - date arithmetic', () => {
    test('should add days within same month', () => {
      const date = makeDate(2026, 2, 21); // Feb 21
      const result = adapter.addDays(date, 3);
      
      assert.equal(adapter.toISODate(result), '2026-02-24');
    });

    test('should subtract days within same month', () => {
      const date = makeDate(2026, 2, 21); // Feb 21
      const result = adapter.addDays(date, -10);
      
      assert.equal(adapter.toISODate(result), '2026-02-11');
    });

    test('should handle month rollover forward', () => {
      const date = makeDate(2026, 1, 30); // Jan 30
      const result = adapter.addDays(date, 3); // -> Feb 2
      
      assert.equal(adapter.toISODate(result), '2026-02-02');
    });

    test('should handle month rollover backward', () => {
      const date = makeDate(2026, 2, 2); // Feb 2
      const result = adapter.addDays(date, -3); // -> Jan 30
      
      assert.equal(adapter.toISODate(result), '2026-01-30');
    });

    test('should handle year rollover forward', () => {
      const date = makeDate(2026, 12, 30); // Dec 30, 2026
      const result = adapter.addDays(date, 5); // -> Jan 4, 2027
      
      assert.equal(adapter.toISODate(result), '2027-01-04');
    });

    test('should handle year rollover backward', () => {
      const date = makeDate(2027, 1, 4); // Jan 4, 2027
      const result = adapter.addDays(date, -5); // -> Dec 30, 2026
      
      assert.equal(adapter.toISODate(result), '2026-12-30');
    });
  });

  describe('addMonths - end-of-month stability', () => {
    test('should add months within same year', () => {
      const date = makeDate(2026, 2, 15); // Feb 15
      const result = adapter.addMonths(date, 2); // -> Apr 15
      
      assert.equal(adapter.toISODate(result), '2026-04-15');
    });

    test('should subtract months within same year', () => {
      const date = makeDate(2026, 5, 15); // May 15
      const result = adapter.addMonths(date, -2); // -> Mar 15
      
      assert.equal(adapter.toISODate(result), '2026-03-15');
    });

    test('CRITICAL: Jan 31 + 1 month => Feb 28 (non-leap year)', () => {
      const date = makeDate(2026, 1, 31); // Jan 31, 2026 (non-leap)
      const result = adapter.addMonths(date, 1);
      
      // Expected: Feb 28, 2026 (last day of February in non-leap year)
      assert.equal(adapter.toISODate(result), '2026-02-28');
    });

    test('CRITICAL: Jan 31 + 1 month => Feb 29 (leap year)', () => {
      const date = makeDate(2024, 1, 31); // Jan 31, 2024 (leap year)
      const result = adapter.addMonths(date, 1);
      
      // Expected: Feb 29, 2024 (last day of February in leap year)
      assert.equal(adapter.toISODate(result), '2024-02-29');
    });

    test('CRITICAL: Mar 31 + 1 month => Apr 30', () => {
      const date = makeDate(2026, 3, 31); // Mar 31
      const result = adapter.addMonths(date, 1);
      
      // Expected: Apr 30 (April has 30 days)
      assert.equal(adapter.toISODate(result), '2026-04-30');
    });

    test('CRITICAL: May 31 + 1 month => Jun 30', () => {
      const date = makeDate(2026, 5, 31); // May 31
      const result = adapter.addMonths(date, 1);
      
      // Expected: Jun 30 (June has 30 days)
      assert.equal(adapter.toISODate(result), '2026-06-30');
    });

    test('should handle year rollover', () => {
      const date = makeDate(2026, 11, 15); // Nov 15, 2026
      const result = adapter.addMonths(date, 3); // -> Feb 15, 2027
      
      assert.equal(adapter.toISODate(result), '2027-02-15');
    });

    test('CRITICAL: Dec 31 + 1 month => Jan 31 (next year)', () => {
      const date = makeDate(2026, 12, 31); // Dec 31, 2026
      const result = adapter.addMonths(date, 1);
      
      // Expected: Jan 31, 2027 (January has 31 days)
      assert.equal(adapter.toISODate(result), '2027-01-31');
    });
  });

  describe('normalize - set to start of day', () => {
    test('should set time to 00:00:00.000', () => {
      const date = new Date(2026, 1, 21, 15, 45, 30, 500);
      const result = adapter.normalize(date);
      
      assert.equal(result.getHours(), 0);
      assert.equal(result.getMinutes(), 0);
      assert.equal(result.getSeconds(), 0);
      assert.equal(result.getMilliseconds(), 0);
    });

    test('should preserve date component', () => {
      const date = new Date(2026, 1, 21, 15, 45, 30, 500);
      const result = adapter.normalize(date);
      
      assert.equal(result.getFullYear(), 2026);
      assert.equal(result.getMonth(), 1);
      assert.equal(result.getDate(), 21);
    });

    test('should not mutate original date', () => {
      const date = new Date(2026, 1, 21, 15, 45, 30, 500);
      const originalTime = date.getTime();
      
      adapter.normalize(date);
      
      assert.equal(date.getTime(), originalTime); // unchanged
    });
  });

  describe('startOfMonth', () => {
    test('should return first day of month', () => {
      const date = makeDate(2026, 2, 21); // Feb 21
      const result = adapter.startOfMonth(date);
      
      assert.equal(adapter.toISODate(result), '2026-02-01');
    });

    test('should handle date already at start of month', () => {
      const date = makeDate(2026, 2, 1);
      const result = adapter.startOfMonth(date);
      
      assert.equal(adapter.toISODate(result), '2026-02-01');
    });
  });

  describe('endOfMonth', () => {
    test('should return last day of month (31 days)', () => {
      const date = makeDate(2026, 1, 15); // Jan 15
      const result = adapter.endOfMonth(date);
      
      assert.equal(adapter.toISODate(result), '2026-01-31');
    });

    test('should return last day of month (30 days)', () => {
      const date = makeDate(2026, 4, 15); // Apr 15
      const result = adapter.endOfMonth(date);
      
      assert.equal(adapter.toISODate(result), '2026-04-30');
    });

    test('should return last day of February (non-leap year)', () => {
      const date = makeDate(2026, 2, 15); // Feb 15, 2026
      const result = adapter.endOfMonth(date);
      
      assert.equal(adapter.toISODate(result), '2026-02-28');
    });

    test('should return last day of February (leap year)', () => {
      const date = makeDate(2024, 2, 15); // Feb 15, 2024 (leap year)
      const result = adapter.endOfMonth(date);
      
      assert.equal(adapter.toISODate(result), '2024-02-29');
    });
  });

  describe('getYear, getMonth, getDate accessors', () => {
    test('should extract year', () => {
      const date = makeDate(2026, 2, 21);
      assert.equal(adapter.getYear(date), 2026);
    });

    test('should extract month (0-indexed)', () => {
      const date = makeDate(2026, 2, 21); // February
      assert.equal(adapter.getMonth(date), 1); // 0-indexed
    });

    test('should extract day of month', () => {
      const date = makeDate(2026, 2, 21);
      assert.equal(adapter.getDate(date), 21);
    });

    test('should extract day of week', () => {
      const date = makeDate(2026, 2, 21); // Feb 21, 2026 is a Saturday
      assert.equal(adapter.getDay(date), 6); // 0=Sunday, 6=Saturday
    });
  });
});
