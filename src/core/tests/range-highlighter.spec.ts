/**
 * Range Highlighter Tests
 * 
 * Tests decoration logic for calendar cells:
 * - isSelectedStart/isSelectedEnd markers
 * - isInRange membership
 * - isInHoverRange preview
 * - isDisabled constraints
 * 
 * Uses deterministic dates (FixedClock) and NativeDateAdapter.
 * 
 * @module core/tests/range-highlighter.spec
 * @version 3.8.0
 */

import { describe, it, before } from 'node:test';
import * as assert from 'node:assert/strict';
import { RangeHighlighter } from '../calendar-grid/range-highlighter';
import { CalendarGridFactory } from '../calendar-grid/calendar-grid.factory';
import { NativeDateAdapter } from '../native-date-adapter';
import { makeDate as testMakeDate } from '../testing';

// Helper: Create date in Feb 2026 context
function makeDate(day: number, month: number = 2, year: number = 2026): Date {
  return testMakeDate(year, month, day);
}

describe('RangeHighlighter', () => {
  let highlighter: RangeHighlighter;
  let factory: CalendarGridFactory;
  let adapter: NativeDateAdapter;

  before(() => {
    // Use NativeDateAdapter for deterministic tests
    adapter = new NativeDateAdapter();
    
    factory = new CalendarGridFactory(adapter);
    highlighter = new RangeHighlighter(adapter);
  });

  describe('Basic decoration structure', () => {
    it('should decorate grid without changing base grid', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const decorated = highlighter.decorate(grid, {
        start: null,
        end: null
      });

      assert.equal(decorated.base, grid, 'Base grid should be same reference');
      assert.equal(decorated.cells.length, 42, 'Should have 42 decorated cells');
      assert.equal(decorated.weeks.length, 6, 'Should have 6 weeks');
      assert.equal(decorated.weeks[0].length, 7, 'Each week should have 7 days');
    });

    it('should preserve cell properties from base grid', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const decorated = highlighter.decorate(grid, {
        start: null,
        end: null
      });

      // Check first current-month cell (Feb 1, 2026 is Sunday)
      const firstCell = decorated.cells.find(c => c.inCurrentMonth);
      assert.ok(firstCell, 'Should have current month cells');
      assert.equal(firstCell.day, 1, 'First day should be 1');
      assert.equal(firstCell.month, 1, 'Month should be 1 (Feb)');
      assert.equal(firstCell.year, 2026, 'Year should be 2026');
      assert.equal(firstCell.iso, '2026-02-01', 'ISO should match');
    });
  });

  describe('Range selection markers', () => {
    it('should mark isSelectedStart correctly', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const startDate = makeDate(10); // Feb 10, 2026
      
      const decorated = highlighter.decorate(grid, {
        start: startDate,
        end: null
      });

      const feb10 = decorated.cells.find(c => c.iso === '2026-02-10');
      const feb11 = decorated.cells.find(c => c.iso === '2026-02-11');

      assert.ok(feb10, 'Feb 10 should exist');
      assert.equal(feb10.isSelectedStart, true, 'Feb 10 should be start');
      assert.equal(feb10.isSelectedEnd, false, 'Feb 10 should not be end');
      
      assert.ok(feb11, 'Feb 11 should exist');
      assert.equal(feb11.isSelectedStart, false, 'Feb 11 should not be start');
    });

    it('should mark isSelectedEnd correctly', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const startDate = makeDate(10);
      const endDate = makeDate(20); // Feb 20, 2026
      
      const decorated = highlighter.decorate(grid, {
        start: startDate,
        end: endDate
      });

      const feb20 = decorated.cells.find(c => c.iso === '2026-02-20');
      const feb21 = decorated.cells.find(c => c.iso === '2026-02-21');

      assert.ok(feb20, 'Feb 20 should exist');
      assert.equal(feb20.isSelectedEnd, true, 'Feb 20 should be end');
      assert.equal(feb20.isSelectedStart, false, 'Feb 20 should not be start');
      
      assert.ok(feb21, 'Feb 21 should exist');
      assert.equal(feb21.isSelectedEnd, false, 'Feb 21 should not be end');
    });

    it('should handle same day as start and end', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const sameDate = makeDate(15);
      
      const decorated = highlighter.decorate(grid, {
        start: sameDate,
        end: sameDate
      });

      const feb15 = decorated.cells.find(c => c.iso === '2026-02-15');
      
      assert.ok(feb15, 'Feb 15 should exist');
      assert.equal(feb15.isSelectedStart, true, 'Should be start');
      assert.equal(feb15.isSelectedEnd, true, 'Should be end');
      assert.equal(feb15.isInRange, true, 'Should be in range');
    });
  });

  describe('Range membership (isInRange)', () => {
    it('should mark cells in range correctly', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const startDate = makeDate(10);
      const endDate = makeDate(15);
      
      const decorated = highlighter.decorate(grid, {
        start: startDate,
        end: endDate
      });

      // Feb 10-15 should be in range
      for (let day = 10; day <= 15; day++) {
        const cell = decorated.cells.find(c => c.iso === `2026-02-${day.toString().padStart(2, '0')}`);
        assert.ok(cell, `Feb ${day} should exist`);
        assert.equal(cell.isInRange, true, `Feb ${day} should be in range`);
      }

      // Feb 9 and 16 should NOT be in range
      const feb9 = decorated.cells.find(c => c.iso === '2026-02-09');
      const feb16 = decorated.cells.find(c => c.iso === '2026-02-16');
      
      assert.ok(feb9, 'Feb 9 should exist');
      assert.equal(feb9.isInRange, false, 'Feb 9 should not be in range');
      
      assert.ok(feb16, 'Feb 16 should exist');
      assert.equal(feb16.isInRange, false, 'Feb 16 should not be in range');
    });

    it('should return false for isInRange when only start is selected', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const startDate = makeDate(10);
      
      const decorated = highlighter.decorate(grid, {
        start: startDate,
        end: null
      });

      // No cells should be in range (need both start and end)
      const inRangeCells = decorated.cells.filter(c => c.isInRange);
      assert.equal(inRangeCells.length, 0, 'No cells should be in range without end date');
    });

    it('should return false for isInRange when neither start nor end selected', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      
      const decorated = highlighter.decorate(grid, {
        start: null,
        end: null
      });

      const inRangeCells = decorated.cells.filter(c => c.isInRange);
      assert.equal(inRangeCells.length, 0, 'No cells should be in range');
    });
  });

  describe('Hover preview (isInHoverRange)', () => {
    it('should show hover range when hovering (not selecting start)', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const startDate = makeDate(10);
      const hoverISO = '2026-02-15';
      
      const decorated = highlighter.decorate(grid, {
        start: startDate,
        end: null,
        hoverDate: hoverISO,
        selectingStartDate: false
      });

      // Feb 10-15 should be in hover range
      for (let day = 10; day <= 15; day++) {
        const cell = decorated.cells.find(c => c.iso === `2026-02-${day.toString().padStart(2, '0')}`);
        assert.ok(cell, `Feb ${day} should exist`);
        assert.equal(cell.isInHoverRange, true, `Feb ${day} should be in hover range`);
      }
    });

    it('should NOT show hover range when selecting start', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const startDate = makeDate(10);
      const hoverISO = '2026-02-15';
      
      const decorated = highlighter.decorate(grid, {
        start: startDate,
        end: null,
        hoverDate: hoverISO,
        selectingStartDate: true
      });

      const hoverCells = decorated.cells.filter(c => c.isInHoverRange);
      assert.equal(hoverCells.length, 0, 'No hover preview when selecting start');
    });

    it('should handle hover before start (reversed range)', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const startDate = makeDate(15);
      const hoverISO = '2026-02-10'; // Hover before start
      
      const decorated = highlighter.decorate(grid, {
        start: startDate,
        end: null,
        hoverDate: hoverISO,
        selectingStartDate: false
      });

      // Feb 10-15 should be in hover range (normalized order)
      for (let day = 10; day <= 15; day++) {
        const cell = decorated.cells.find(c => c.iso === `2026-02-${day.toString().padStart(2, '0')}`);
        assert.ok(cell, `Feb ${day} should exist`);
        assert.equal(cell.isInHoverRange, true, `Feb ${day} should be in hover range`);
      }
    });

    it('should NOT show hover when no start date', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const hoverISO = '2026-02-15';
      
      const decorated = highlighter.decorate(grid, {
        start: null,
        end: null,
        hoverDate: hoverISO,
        selectingStartDate: false
      });

      const hoverCells = decorated.cells.filter(c => c.isInHoverRange);
      assert.equal(hoverCells.length, 0, 'No hover preview without start date');
    });
  });

  describe('Disabled state (isDisabled)', () => {
    it('should mark disabled dates from array', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      const disabledDates = [
        makeDate(10),
        makeDate(15),
        makeDate(20)
      ];
      
      const decorated = highlighter.decorate(grid, {
        start: null,
        end: null,
        disabledDates
      });

      const feb10 = decorated.cells.find(c => c.iso === '2026-02-10');
      const feb15 = decorated.cells.find(c => c.iso === '2026-02-15');
      const feb20 = decorated.cells.find(c => c.iso === '2026-02-20');
      const feb11 = decorated.cells.find(c => c.iso === '2026-02-11');

      assert.ok(feb10, 'Feb 10 should exist');
      assert.equal(feb10.isDisabled, true, 'Feb 10 should be disabled');
      
      assert.ok(feb15, 'Feb 15 should exist');
      assert.equal(feb15.isDisabled, true, 'Feb 15 should be disabled');
      
      assert.ok(feb20, 'Feb 20 should exist');
      assert.equal(feb20.isDisabled, true, 'Feb 20 should be disabled');
      
      assert.ok(feb11, 'Feb 11 should exist');
      assert.equal(feb11.isDisabled, false, 'Feb 11 should not be disabled');
    });

    it('should use disabled predicate function', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      
      // Disable weekends (Saturday=6, Sunday=0)
      const disabledPredicate = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
      };
      
      const decorated = highlighter.decorate(grid, {
        start: null,
        end: null,
        disabledDates: disabledPredicate
      });

      // Feb 1, 2026 is Sunday (disabled)
      const feb1 = decorated.cells.find(c => c.iso === '2026-02-01');
      assert.ok(feb1, 'Feb 1 should exist');
      assert.equal(feb1.isDisabled, true, 'Feb 1 (Sunday) should be disabled');

      // Feb 2, 2026 is Monday (enabled)
      const feb2 = decorated.cells.find(c => c.iso === '2026-02-02');
      assert.ok(feb2, 'Feb 2 should exist');
      assert.equal(feb2.isDisabled, false, 'Feb 2 (Monday) should not be disabled');

      // Feb 7, 2026 is Saturday (disabled)
      const feb7 = decorated.cells.find(c => c.iso === '2026-02-07');
      assert.ok(feb7, 'Feb 7 should exist');
      assert.equal(feb7.isDisabled, true, 'Feb 7 (Saturday) should be disabled');
    });

    it('should have no disabled dates when disabledDates is null', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      
      const decorated = highlighter.decorate(grid, {
        start: null,
        end: null,
        disabledDates: null
      });

      const disabledCells = decorated.cells.filter(c => c.isDisabled);
      assert.equal(disabledCells.length, 0, 'No cells should be disabled');
    });
  });

  describe('Padding cells (previous/next month)', () => {
    it('should set all decoration flags to false for padding cells', () => {
      const grid = factory.createGrid(makeDate(1), 0);
      
      const decorated = highlighter.decorate(grid, {
        start: makeDate(10),
        end: makeDate(20),
        hoverDate: '2026-02-15',
        disabledDates: [makeDate(10)]
      });

      const paddingCells = decorated.cells.filter(c => !c.inCurrentMonth);
      
      assert.ok(paddingCells.length > 0, 'Should have padding cells');
      
      paddingCells.forEach(cell => {
        assert.equal(cell.isSelectedStart, false, 'Padding: isSelectedStart should be false');
        assert.equal(cell.isSelectedEnd, false, 'Padding: isSelectedEnd should be false');
        assert.equal(cell.isInRange, false, 'Padding: isInRange should be false');
        assert.equal(cell.isInHoverRange, false, 'Padding: isInHoverRange should be false');
        assert.equal(cell.isDisabled, false, 'Padding: isDisabled should be false');
      });
    });
  });
});
