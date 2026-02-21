/**
 * Calendar Grid Factory Tests
 *
 * Tests deterministic calendar grid generation with FixedClock.
 *
 * Run with: node --test
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CalendarGridFactory } from '../calendar-grid/calendar-grid.factory';
import { NativeDateAdapter } from '../native-date-adapter';
import { FixedClock, makeDate } from '../testing';

describe('CalendarGridFactory', () => {
  const adapter = new NativeDateAdapter();
  const factory = new CalendarGridFactory(adapter);

  // Fixed date: Feb 21, 2026 (Friday)
  const feb2026 = makeDate(2026, 2, 1);

  describe('createGrid - structure', () => {
    test('should generate 42 cells (6 weeks x 7 days)', () => {
      const grid = factory.createGrid(feb2026, 0);

      assert.equal(grid.cells.length, 42);
      assert.equal(grid.weeks.length, 6);
      grid.weeks.forEach(week => {
        assert.equal(week.length, 7);
      });
    });

    test('should flatten weeks into cells array', () => {
      const grid = factory.createGrid(feb2026, 0);

      // cells should be the same as flattened weeks
      const flattenedWeeks = grid.weeks.flat();
      assert.equal(grid.cells.length, flattenedWeeks.length);
      assert.deepEqual(grid.cells, flattenedWeeks);
    });

    test('should include month metadata', () => {
      const grid = factory.createGrid(feb2026, 0);

      assert.equal(grid.month.year, 2026);
      assert.equal(grid.month.month, 1); // February = 1 (0-indexed)
      assert.equal(grid.weekStart, 0);
    });
  });

  describe('createGrid - February 2026 with Sunday start', () => {
    test('should have 28 days in current month', () => {
      const grid = factory.createGrid(feb2026, 0);
      const currentMonthCells = grid.cells.filter(c => c.inCurrentMonth);

      assert.equal(currentMonthCells.length, 28); // Feb 2026 is not leap
    });

    test('should start with Feb 1, 2026 (Sunday)', () => {
      const grid = factory.createGrid(feb2026, 0);
      
      // Feb 1, 2026 is Sunday (dayOfWeek = 0)
      // With Sunday start (weekStart = 0), we need 0 padding days
      // Grid should start directly with Feb 1, 2026
      const firstCell = grid.cells[0];
      assert.equal(firstCell.iso, '2026-02-01'); // Sunday Feb 1
      assert.equal(firstCell.inCurrentMonth, true);
      assert.equal(firstCell.dayOfWeek, 0); // Sunday
    });

    test('should have Feb 1 on first cell (Sunday)', () => {
      const grid = factory.createGrid(feb2026, 0);
      
      // Feb 1 is Sunday, so it's the 1st cell (index 0)
      const feb1Cell = grid.cells[0];
      assert.equal(feb1Cell.iso, '2026-02-01');
      assert.equal(feb1Cell.inCurrentMonth, true);
      assert.equal(feb1Cell.day, 1);
      assert.equal(feb1Cell.dayOfWeek, 0); // Sunday
    });

    test('should end with days from March 2026', () => {
      const grid = factory.createGrid(feb2026, 0);
      
      // Feb 28, 2026 is Saturday (last day of month, index 27)
      // So we have Sunday Mar 1 through Saturday Mar 14 as padding
      const lastCell = grid.cells[41]; // Index 41 = 42nd cell
      assert.equal(lastCell.iso, '2026-03-14');
      assert.equal(lastCell.inCurrentMonth, false);
      assert.equal(lastCell.month, 2); // March = 2
    });
  });

  describe('createGrid - Monday start (weekStart = 1)', () => {
    test('should start week on Monday', () => {
      const grid = factory.createGrid(feb2026, 1); // Monday start
      
      // First cell should be Monday
      const firstCell = grid.cells[0];
      assert.equal(firstCell.dayOfWeek, 1); // Monday
    });

    test('should adjust padding for Monday start', () => {
      const grid = factory.createGrid(feb2026, 1);
      
      // Feb 1, 2026 is Sunday
      // With Monday start, we need to go back 6 days to previous Monday
      // That's Monday Jan 26, 2026
      const firstCell = grid.cells[0];
      assert.equal(firstCell.iso, '2026-01-26'); // Monday before Feb 1
      assert.equal(firstCell.dayOfWeek, 1); // Monday
    });
  });

  describe('createGrid - cell properties', () => {
    test('each cell should have all required properties', () => {
      const grid = factory.createGrid(feb2026, 0);
      
      grid.cells.forEach(cell => {
        assert.ok(cell.date instanceof Date);
        assert.equal(typeof cell.inCurrentMonth, 'boolean');
        assert.equal(typeof cell.iso, 'string');
        assert.ok(cell.iso.match(/^\d{4}-\d{2}-\d{2}$/)); // YYYY-MM-DD
        assert.equal(typeof cell.day, 'number');
        assert.equal(typeof cell.month, 'number');
        assert.equal(typeof cell.year, 'number');
        assert.equal(typeof cell.dayOfWeek, 'number');
        assert.ok(cell.dayOfWeek >= 0 && cell.dayOfWeek <= 6);
      });
    });

    test('iso should match date components', () => {
      const grid = factory.createGrid(feb2026, 0);
      
      const cell = grid.cells[10]; // Pick a cell
      const expectedISO = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
      assert.equal(cell.iso, expectedISO);
    });

    test('dates should be normalized to start of day', () => {
      const grid = factory.createGrid(feb2026, 0);
      
      grid.cells.forEach(cell => {
        assert.equal(cell.date.getHours(), 0);
        assert.equal(cell.date.getMinutes(), 0);
        assert.equal(cell.date.getSeconds(), 0);
        assert.equal(cell.date.getMilliseconds(), 0);
      });
    });
  });

  describe('createGrid - special cases', () => {
    test('should handle leap year February (2024)', () => {
      const feb2024 = makeDate(2024, 2, 1);
      const grid = factory.createGrid(feb2024, 0);
      
      const currentMonthCells = grid.cells.filter(c => c.inCurrentMonth);
      assert.equal(currentMonthCells.length, 29); // Leap year
    });

    test('should handle December (year boundary)', () => {
      const dec2026 = makeDate(2026, 12, 1);
      const grid = factory.createGrid(dec2026, 0);
      
      const currentMonthCells = grid.cells.filter(c => c.inCurrentMonth);
      assert.equal(currentMonthCells.length, 31);
      
      // Should have January 2027 cells at the end
      const lastCell = grid.cells[41];
      assert.equal(lastCell.year, 2027);
      assert.equal(lastCell.month, 0); // January
    });

    test('should handle January (year boundary)', () => {
      const jan2026 = makeDate(2026, 1, 1);
      const grid = factory.createGrid(jan2026, 0);
      
      // Should have December 2025 cells at the beginning
      const firstCell = grid.cells[0];
      if (!firstCell.inCurrentMonth) {
        assert.equal(firstCell.year, 2025);
        assert.equal(firstCell.month, 11); // December
      }
    });
  });

  describe('createGrid - normalization', () => {
    test('should normalize monthDate to start of month', () => {
      const midMonth = makeDate(2026, 2, 15); // Feb 15
      const grid = factory.createGrid(midMonth, 0);
      
      assert.equal(grid.month.year, 2026);
      assert.equal(grid.month.month, 1); // February
      
      // Should still generate correct grid starting from Feb 1
      const feb1Cell = grid.cells.find(c => c.inCurrentMonth && c.day === 1);
      assert.ok(feb1Cell);
      assert.equal(feb1Cell.iso, '2026-02-01');
    });

    test('should handle end of month date', () => {
      const endMonth = makeDate(2026, 2, 28); // Feb 28 (last day)
      const grid = factory.createGrid(endMonth, 0);
      
      assert.equal(grid.month.year, 2026);
      assert.equal(grid.month.month, 1); // Still February
    });
  });
});
