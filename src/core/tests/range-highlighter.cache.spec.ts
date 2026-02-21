/**
 * Range Highlighter Cache Tests
 * 
 * Tests memoization of decorated grids:
 * - Cache hits return same object (===)
 * - Cache invalidation on parameter changes
 * - LRU eviction when limit exceeded
 * - Function predicates bypass cache
 * 
 * Uses deterministic dates (FixedClock) and NativeDateAdapter.
 * 
 * @module core/tests/range-highlighter.cache.spec
 * @version 3.8.0
 */

import { describe, it, before } from 'node:test';
import * as assert from 'node:assert/strict';
import { RangeHighlighterCache } from '../calendar-grid/range-highlighter.cache';
import { RangeHighlighter } from '../calendar-grid/range-highlighter';
import { CalendarGridFactory } from '../calendar-grid/calendar-grid.factory';
import { NativeDateAdapter } from '../native-date-adapter';
import { makeDate as testMakeDate } from '../testing';

// Helper: Create date in Feb 2026 context
function makeDate(day: number, month: number = 2, year: number = 2026): Date {
  return testMakeDate(year, month, day);
}

describe('RangeHighlighterCache', () => {
  let cache: RangeHighlighterCache;
  let highlighter: RangeHighlighter;
  let factory: CalendarGridFactory;
  let adapter: NativeDateAdapter;

  before(() => {
    // Use NativeDateAdapter for deterministic tests
    adapter = new NativeDateAdapter();
    
    factory = new CalendarGridFactory(adapter);
    highlighter = new RangeHighlighter(adapter);
    cache = new RangeHighlighterCache(highlighter, adapter);
  });

  describe('Cache basics', () => {
    it('should return decorated grid on first call', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      const decorated = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20)
      });

      assert.ok(decorated, 'Should return decorated grid');
      assert.equal(decorated.cells.length, 42, 'Should have 42 cells');
      assert.equal(decorated.base, grid, 'Base should match input grid');
    });

    it('should return same instance for same parameters (cache hit)', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      const params = {
        start: makeDate(10),
        end: makeDate(20),
        hoverDate: null
      };

      const first = cache.get(grid, params);
      const second = cache.get(grid, params);
      const third = cache.get(grid, params);

      assert.equal(second, first, 'Second call should return same instance');
      assert.equal(third, first, 'Third call should return same instance');
    });

    it('should cache multiple different grids', () => {
      cache.clear();
      
      const gridFeb = factory.createGrid(makeDate(1, 1, 2026), 0);
      const gridMar = factory.createGrid(makeDate(1, 2, 2026), 0);
      
      const params = { start: makeDate(10), end: makeDate(20) };

      const decoratedFeb = cache.get(gridFeb, params);
      const decoratedMar = cache.get(gridMar, params);

      assert.notEqual(decoratedFeb, decoratedMar, 'Different months should have different instances');
      
      // Verify cache hits
      const decoratedFeb2 = cache.get(gridFeb, params);
      const decoratedMar2 = cache.get(gridMar, params);
      
      assert.equal(decoratedFeb2, decoratedFeb, 'Feb should cache hit');
      assert.equal(decoratedMar2, decoratedMar, 'Mar should cache hit');
    });
  });

  describe('Cache invalidation', () => {
    it('should invalidate cache when start date changes', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20)
      });

      const second = cache.get(grid, {
        start: makeDate(15), // Different start
        end: makeDate(20)
      });

      assert.notEqual(second, first, 'Different start should produce new instance');
    });

    it('should invalidate cache when end date changes', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20)
      });

      const second = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(25) // Different end
      });

      assert.notEqual(second, first, 'Different end should produce new instance');
    });

    it('should invalidate cache when hover date changes', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: null,
        hoverDate: '2026-02-15'
      });

      const second = cache.get(grid, {
        start: makeDate(10),
        end: null,
        hoverDate: '2026-02-20' // Different hover
      });

      assert.notEqual(second, first, 'Different hover should produce new instance');
    });

    it('should invalidate cache when disabled dates change', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: [makeDate(15)]
      });

      const second = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: [makeDate(15), makeDate(16)] // Different disabled
      });

      assert.notEqual(second, first, 'Different disabled dates should produce new instance');
    });

    it('should cache hit when disabled dates array has same dates in different order', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: [makeDate(15), makeDate(10), makeDate(20)]
      });

      const second = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: [makeDate(10), makeDate(20), makeDate(15)] // Same dates, different order
      });

      assert.equal(second, first, 'Same disabled dates should cache hit (order-independent)');
    });
  });

  describe('Function predicates', () => {
    it('should NOT cache when using function predicate', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      const predicate = (date: Date) => date.getDay() === 0; // Disable Sundays
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: predicate
      });

      const second = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: predicate
      });

      // Function predicates should NOT be cached (same params = new instance)
      assert.notEqual(second, first, 'Function predicates should not be cached');
      
      // Cache should remain empty
      assert.equal(cache.size(), 0, 'Cache should be empty with function predicates');
    });

    it('should still compute decorations correctly with function predicate', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      const predicate = (date: Date) => date.getDay() === 0; // Disable Sundays
      
      const decorated = cache.get(grid, {
        start: null,
        end: null,
        disabledDates: predicate
      });

      // Feb 1, 2026 is Sunday (should be disabled)
      const feb1 = decorated.cells.find(c => c.iso === '2026-02-01');
      assert.ok(feb1, 'Feb 1 should exist');
      assert.equal(feb1.isDisabled, true, 'Feb 1 (Sunday) should be disabled');

      // Feb 2, 2026 is Monday (should not be disabled)
      const feb2 = decorated.cells.find(c => c.iso === '2026-02-02');
      assert.ok(feb2, 'Feb 2 should exist');
      assert.equal(feb2.isDisabled, false, 'Feb 2 (Monday) should not be disabled');
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entry when cache exceeds maxSize', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      // Fill cache to limit (48 entries)
      // Use different hover dates to create unique cache keys
      for (let i = 0; i < 48; i++) {
        cache.get(grid, {
          start: makeDate(10),
          end: makeDate(20),
          hoverDate: `2026-02-${(i % 28 + 1).toString().padStart(2, '0')}-${i}`
        });
      }

      assert.equal(cache.size(), 48, 'Cache should be at max size');

      // Add one more (should evict oldest)
      cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        hoverDate: '2026-02-01-NEW'
      });

      assert.equal(cache.size(), 48, 'Cache should still be at max size after eviction');
    });

    it('should keep frequently accessed entries (LRU)', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      // Add entry that we'll access frequently
      const frequentParams = {
        start: makeDate(10),
        end: makeDate(20),
        hoverDate: 'FREQUENT'
      };
      
      const frequent = cache.get(grid, frequentParams);

      // Fill cache almost to limit
      for (let i = 0; i < 46; i++) {
        cache.get(grid, {
          start: makeDate(10),
          end: makeDate(20),
          hoverDate: `OTHER-${i}`
        });
      }

      // Access frequent entry again (moves to end of LRU)
      const frequentAgain = cache.get(grid, frequentParams);
      assert.equal(frequentAgain, frequent, 'Frequent entry should still be cached');

      // Add two more (should evict oldest, but not frequent)
      cache.get(grid, { start: makeDate(10), end: makeDate(20), hoverDate: 'NEW-1' });
      cache.get(grid, { start: makeDate(10), end: makeDate(20), hoverDate: 'NEW-2' });

      // Frequent entry should still be cached (was recently accessed)
      const frequentStillThere = cache.get(grid, frequentParams);
      assert.equal(frequentStillThere, frequent, 'Frequently accessed entry should not be evicted');
    });
  });

  describe('Cache utilities', () => {
    it('should clear all entries', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      // Add multiple entries
      cache.get(grid, { start: makeDate(10), end: makeDate(20) });
      cache.get(grid, { start: makeDate(15), end: makeDate(25) });
      
      assert.ok(cache.size() > 0, 'Cache should have entries');

      cache.clear();
      
      assert.equal(cache.size(), 0, 'Cache should be empty after clear');
    });

    it('should report correct size', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      assert.equal(cache.size(), 0, 'Should start empty');

      cache.get(grid, { start: makeDate(10), end: makeDate(20) });
      assert.equal(cache.size(), 1, 'Should have 1 entry');

      cache.get(grid, { start: makeDate(15), end: makeDate(25) });
      assert.equal(cache.size(), 2, 'Should have 2 entries');

      cache.get(grid, { start: makeDate(10), end: makeDate(20) }); // Cache hit
      assert.equal(cache.size(), 2, 'Cache hit should not increase size');
    });

    it('should check if entry is cached with has()', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      const params = { start: makeDate(10), end: makeDate(20) };

      assert.equal(cache.has(grid, params), false, 'Should not be cached initially');

      cache.get(grid, params);

      assert.equal(cache.has(grid, params), true, 'Should be cached after get()');
    });
  });

  describe('Edge cases', () => {
    it('should handle null start and end dates', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, { start: null, end: null });
      const second = cache.get(grid, { start: null, end: null });

      assert.equal(second, first, 'Null dates should be cacheable');
    });

    it('should handle empty disabled dates array', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: []
      });

      const second = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: []
      });

      assert.equal(second, first, 'Empty disabled array should cache hit');
    });

    it('should differentiate between null hover and no hover', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const withNull = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        hoverDate: null
      });

      const withUndefined = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20)
        // hoverDate: undefined (omitted)
      });

      // Both should be treated as "no hover" (same cache key)
      assert.equal(withUndefined, withNull, 'null and undefined hover should cache hit');
    });

    it('should handle rapid repeated access (performance)', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      const params = {
        start: makeDate(10),
        end: makeDate(20),
        hoverDate: '2026-02-15'
      };

      // First call (cache miss)
      const first = cache.get(grid, params);

      // 100 rapid accesses (all cache hits)
      for (let i = 0; i < 100; i++) {
        const result = cache.get(grid, params);
        assert.equal(result, first, `Access ${i + 1} should cache hit`);
      }

      // Cache should only have 1 entry
      assert.equal(cache.size(), 1, 'Should only have 1 cached entry');
    });
  });

  /**
   * ANTI-RECOMPUTE GUARD (v3.9.3)
   * 
   * Tests that document and freeze the anti-recompute behavior:
   * - Same parameters = same object reference (===)
   * - No redundant decorate() calls
   * - Cache key includes all relevant parameters
   * 
   * Critical for:
   * - Preventing unnecessary re-renders in Angular
   * - Performance in long-running sessions
   * - Minimizing CPU usage in BI dashboards
   */
  describe('Anti-Recompute Guard (v3.9.3)', () => {
    it('GOLDEN: same parameters always return same instance (===)', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      const params = {
        start: makeDate(10),
        end: makeDate(20),
        minDate: makeDate(1),
        maxDate: makeDate(28),
        hoverDate: '2026-02-15'
      };

      const first = cache.get(grid, params);
      const second = cache.get(grid, params);
      const third = cache.get(grid, params);

      // FROZEN BEHAVIOR: Same params = same reference
      assert.ok(first === second, 'Second call must be identical (===)');
      assert.ok(second === third, 'Third call must be identical (===)');
      
      // Only 1 entry should exist (no duplicates)
      assert.equal(cache.size(), 1);
    });

    it('GOLDEN: changing start date triggers new computation', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20)
      });

      const second = cache.get(grid, {
        start: makeDate(11), // Changed
        end: makeDate(20)
      });

      // Different start = different instance
      assert.ok(first !== second, 'Changed start must create new instance');
      assert.equal(cache.size(), 2, 'Should have 2 entries');
    });

    it('GOLDEN: changing end date triggers new computation', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20)
      });

      const second = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(21) // Changed
      });

      // Different end = different instance
      assert.ok(first !== second, 'Changed end must create new instance');
      assert.equal(cache.size(), 2);
    });

    it('GOLDEN: changing hover triggers new computation', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        hoverDate: '2026-02-15'
      });

      const second = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        hoverDate: '2026-02-16' // Changed
      });

      // Different hover = different instance
      assert.ok(first !== second, 'Changed hover must create new instance');
      assert.equal(cache.size(), 2);
    });

    it('GOLDEN: changing minDate or maxDate triggers new computation', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        minDate: makeDate(1),
        maxDate: makeDate(28)
      });

      const second = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        minDate: makeDate(2), // Changed
        maxDate: makeDate(28)
      });

      const third = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        minDate: makeDate(1),
        maxDate: makeDate(27) // Changed
      });

      // Different bounds = different instances
      assert.ok(first !== second, 'Changed minDate must create new instance');
      assert.ok(first !== third, 'Changed maxDate must create new instance');
      assert.equal(cache.size(), 3);
    });

    it('GOLDEN: null/undefined parameters are handled correctly', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      // Params with nulls
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        minDate: undefined,
        maxDate: undefined,
        hoverDate: undefined
      });

      // Same nulls = cache hit
      const second = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        minDate: undefined,
        maxDate: undefined,
        hoverDate: undefined
      });

      assert.ok(first === second, 'Same nulls should cache hit');
      assert.equal(cache.size(), 1);

      // Adding a non-null = different instance
      const third = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        minDate: makeDate(1), // Now defined
        maxDate: undefined,
        hoverDate: undefined
      });

      assert.ok(first !== third, 'Adding minDate must create new instance');
      assert.equal(cache.size(), 2);
    });

    it('GOLDEN: disabled dates array changes trigger new computation', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: [makeDate(12), makeDate(15)]
      });

      const second = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: [makeDate(12), makeDate(16)] // Different
      });

      // Different disabled dates = different instance
      assert.ok(first !== second, 'Changed disabled dates must create new instance');
      assert.equal(cache.size(), 2);
    });

    it('GOLDEN: function predicates bypass cache (recompute every time)', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      const predicate = (date: Date) => date.getDate() % 2 === 0;
      
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: predicate
      });

      const second = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        disabledDates: predicate // Same function
      });

      // Function predicates are NOT cached (can't serialize reliably)
      // So we expect different instances
      assert.ok(first !== second, 'Function predicates must bypass cache');
      
      // Size should be 0 (functions not cached)
      assert.equal(cache.size(), 0, 'Function predicates should not be stored');
    });

    it('GOLDEN: prevents recompute storm (100 identical calls = 1 computation)', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);
      const params = {
        start: makeDate(10),
        end: makeDate(20),
        minDate: makeDate(1),
        maxDate: makeDate(28),
        hoverDate: '2026-02-15'
      };

      // First call
      const first = cache.get(grid, params);

      // Simulate rapid re-renders (100 times)
      for (let i = 0; i < 100; i++) {
        const result = cache.get(grid, params);
        
        // Each call must return the SAME instance
        assert.ok(result === first, `Call ${i + 1} must be identical reference`);
      }

      // Only 1 entry created (no redundant computations)
      assert.equal(cache.size(), 1, 'Should only have 1 cache entry');
    });

    it('GOLDEN: cache key is deterministic (property order does not matter)', () => {
      cache.clear();
      
      const grid = factory.createGrid(makeDate(1), 0);

      // Same data, different property order
      const first = cache.get(grid, {
        start: makeDate(10),
        end: makeDate(20),
        minDate: makeDate(1),
        maxDate: makeDate(28)
      });

      const second = cache.get(grid, {
        maxDate: makeDate(28), // Different order
        minDate: makeDate(1),
        end: makeDate(20),
        start: makeDate(10)
      });

      // Should be same instance (deterministic key generation)
      assert.ok(first === second, 'Property order must not affect caching');
      assert.equal(cache.size(), 1);
    });
  });
});
