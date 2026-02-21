/**
 * Virtual Weeks Logic Tests
 * 
 * Tests pure functions for windowed week rendering.
 * No DOM, no Angular, just pure logic with node:test.
 * 
 * @module core/tests/virtual-weeks.logic.spec
 * @version 3.9.0
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  getVisibleWeeks,
  clampWeekStart,
  navigateWeekWindow,
  getVirtualWeekWindow,
  isVirtualWeeksEnabled
} from '../calendar-grid/virtual-weeks.logic';

describe('Virtual Weeks Logic', () => {
  describe('getVisibleWeeks', () => {
    it('should return all weeks when windowSize is undefined', () => {
      const weeks = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5'];
      const visible = getVisibleWeeks(weeks, 0, undefined as any);
      
      assert.deepEqual(visible, weeks, 'Should return all weeks');
    });

    it('should return all weeks when windowSize >= total weeks', () => {
      const weeks = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5'];
      const visible = getVisibleWeeks(weeks, 0, 6);
      
      assert.deepEqual(visible, weeks, 'Should return all weeks');
    });

    it('should return first N weeks when startIndex is 0', () => {
      const weeks = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5'];
      const visible = getVisibleWeeks(weeks, 0, 3);
      
      assert.deepEqual(visible, ['w0', 'w1', 'w2'], 'Should return first 3 weeks');
    });

    it('should return middle weeks when startIndex is in middle', () => {
      const weeks = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5'];
      const visible = getVisibleWeeks(weeks, 2, 3);
      
      assert.deepEqual(visible, ['w2', 'w3', 'w4'], 'Should return weeks 2-4');
    });

    it('should return last N weeks when startIndex at end', () => {
      const weeks = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5'];
      const visible = getVisibleWeeks(weeks, 3, 3);
      
      assert.deepEqual(visible, ['w3', 'w4', 'w5'], 'Should return last 3 weeks');
    });

    it('should clamp startIndex if out of bounds', () => {
      const weeks = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5'];
      const visible = getVisibleWeeks(weeks, 10, 3); // Too high
      
      assert.deepEqual(visible, ['w3', 'w4', 'w5'], 'Should clamp to last valid position');
    });

    it('should handle empty weeks array', () => {
      const weeks: string[] = [];
      const visible = getVisibleWeeks(weeks, 0, 3);
      
      assert.deepEqual(visible, [], 'Should return empty array');
    });

    it('should work with windowSize = 1', () => {
      const weeks = ['w0', 'w1', 'w2'];
      const visible = getVisibleWeeks(weeks, 1, 1);
      
      assert.deepEqual(visible, ['w1'], 'Should return single week');
    });
  });

  describe('clampWeekStart', () => {
    it('should return 0 when startIndex is negative', () => {
      const result = clampWeekStart(-1, 6, 3);
      assert.equal(result, 0, 'Should clamp to 0');
    });

    it('should return 0 when windowSize >= totalWeeks', () => {
      const result = clampWeekStart(5, 6, 6);
      assert.equal(result, 0, 'No windowing needed');
    });

    it('should return maxStart when startIndex too high', () => {
      const result = clampWeekStart(10, 6, 3);
      assert.equal(result, 3, 'Should clamp to max (6 - 3 = 3)');
    });

    it('should return startIndex when valid', () => {
      const result = clampWeekStart(2, 6, 3);
      assert.equal(result, 2, 'Should keep valid index');
    });

    it('should handle exact boundary cases', () => {
      assert.equal(clampWeekStart(0, 6, 3), 0, 'Min boundary');
      assert.equal(clampWeekStart(3, 6, 3), 3, 'Max boundary (6 - 3 = 3)');
      assert.equal(clampWeekStart(4, 6, 3), 3, 'Over max by 1');
    });

    it('should handle windowSize = 1', () => {
      assert.equal(clampWeekStart(5, 6, 1), 5, 'Should allow up to index 5');
      assert.equal(clampWeekStart(6, 6, 1), 5, 'Should clamp to 5 (max = 6 - 1)');
    });

    it('should handle small totalWeeks', () => {
      assert.equal(clampWeekStart(0, 2, 1), 0, 'Small month - min');
      assert.equal(clampWeekStart(1, 2, 1), 1, 'Small month - max');
      assert.equal(clampWeekStart(2, 2, 1), 1, 'Small month - clamp');
    });
  });

  describe('navigateWeekWindow', () => {
    it('should navigate down (increment startIndex)', () => {
      const result = navigateWeekWindow(0, 1, 6, 3);
      assert.equal(result, 1, 'Should move to index 1');
    });

    it('should navigate up (decrement startIndex)', () => {
      const result = navigateWeekWindow(2, -1, 6, 3);
      assert.equal(result, 1, 'Should move to index 1');
    });

    it('should clamp when navigating down beyond max', () => {
      const result = navigateWeekWindow(3, 1, 6, 3); // Already at max (6 - 3 = 3)
      assert.equal(result, 3, 'Should stay at max');
    });

    it('should clamp when navigating up beyond min', () => {
      const result = navigateWeekWindow(0, -1, 6, 3);
      assert.equal(result, 0, 'Should stay at min');
    });

    it('should handle multiple step navigation', () => {
      const result = navigateWeekWindow(0, 2, 6, 3);
      assert.equal(result, 2, 'Should jump 2 steps');
    });

    it('should handle negative multiple steps', () => {
      const result = navigateWeekWindow(3, -2, 6, 3);
      assert.equal(result, 1, 'Should jump back 2 steps');
    });
  });

  describe('getVirtualWeekWindow', () => {
    it('should return correct state at start position', () => {
      const state = getVirtualWeekWindow(0, 6, 3);
      
      assert.equal(state.startIndex, 0);
      assert.equal(state.windowSize, 3);
      assert.equal(state.totalWeeks, 6);
      assert.equal(state.canNavigateUp, false, 'Cannot go up from start');
      assert.equal(state.canNavigateDown, true, 'Can go down');
    });

    it('should return correct state at end position', () => {
      const state = getVirtualWeekWindow(3, 6, 3);
      
      assert.equal(state.startIndex, 3);
      assert.equal(state.canNavigateUp, true, 'Can go up');
      assert.equal(state.canNavigateDown, false, 'Cannot go down from end');
    });

    it('should return correct state in middle position', () => {
      const state = getVirtualWeekWindow(1, 6, 3);
      
      assert.equal(state.startIndex, 1);
      assert.equal(state.canNavigateUp, true, 'Can go up');
      assert.equal(state.canNavigateDown, true, 'Can go down');
    });

    it('should clamp invalid startIndex', () => {
      const state = getVirtualWeekWindow(10, 6, 3);
      
      assert.equal(state.startIndex, 3, 'Should clamp to max');
      assert.equal(state.canNavigateDown, false, 'At max position');
    });

    it('should handle windowSize = 1', () => {
      const state = getVirtualWeekWindow(2, 6, 1);
      
      assert.equal(state.startIndex, 2);
      assert.equal(state.canNavigateUp, true);
      assert.equal(state.canNavigateDown, true, 'Can navigate within 6 weeks');
    });

    it('should handle no windowing case', () => {
      const state = getVirtualWeekWindow(0, 6, 6);
      
      assert.equal(state.startIndex, 0);
      assert.equal(state.canNavigateUp, false);
      assert.equal(state.canNavigateDown, false, 'No need to navigate');
    });
  });

  describe('isVirtualWeeksEnabled', () => {
    it('should return false when windowSize is undefined', () => {
      const enabled = isVirtualWeeksEnabled(undefined, 6);
      assert.equal(enabled, false, 'Disabled when windowSize undefined');
    });

    it('should return false when windowSize >= totalWeeks', () => {
      assert.equal(isVirtualWeeksEnabled(6, 6), false, 'Equal');
      assert.equal(isVirtualWeeksEnabled(7, 6), false, 'Greater');
    });

    it('should return true when windowSize < totalWeeks', () => {
      assert.equal(isVirtualWeeksEnabled(3, 6), true, 'Should enable');
      assert.equal(isVirtualWeeksEnabled(1, 6), true, 'Should enable');
      assert.equal(isVirtualWeeksEnabled(5, 6), true, 'Should enable');
    });

    it('should handle edge cases', () => {
      assert.equal(isVirtualWeeksEnabled(0, 6), true, '0 < 6');
      assert.equal(isVirtualWeeksEnabled(1, 1), false, '1 >= 1');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle typical 6-week month with windowSize 3', () => {
      const weeks = Array.from({ length: 6 }, (_, i) => `week${i}`);
      
      // Start at top
      let state = getVirtualWeekWindow(0, 6, 3);
      let visible = getVisibleWeeks(weeks, state.startIndex, 3);
      assert.deepEqual(visible, ['week0', 'week1', 'week2']);
      
      // Navigate down once
      const newStart = navigateWeekWindow(state.startIndex, 1, 6, 3);
      state = getVirtualWeekWindow(newStart, 6, 3);
      visible = getVisibleWeeks(weeks, state.startIndex, 3);
      assert.deepEqual(visible, ['week1', 'week2', 'week3']);
      
      // Navigate to end
      const endStart = navigateWeekWindow(state.startIndex, 10, 6, 3); // Big jump
      state = getVirtualWeekWindow(endStart, 6, 3);
      visible = getVisibleWeeks(weeks, state.startIndex, 3);
      assert.deepEqual(visible, ['week3', 'week4', 'week5']);
      assert.equal(state.canNavigateDown, false, 'At end');
    });

    it('should handle 5-week month (February non-leap, Mon start)', () => {
      const weeks = Array.from({ length: 5 }, (_, i) => `week${i}`);
      
      const state = getVirtualWeekWindow(0, 5, 3);
      const visible = getVisibleWeeks(weeks, state.startIndex, 3);
      
      assert.deepEqual(visible, ['week0', 'week1', 'week2']);
      assert.equal(state.canNavigateDown, true, 'Can navigate in 5-week month');
      
      // Navigate to end
      const endStart = navigateWeekWindow(0, 2, 5, 3);
      const endVisible = getVisibleWeeks(weeks, endStart, 3);
      assert.deepEqual(endVisible, ['week2', 'week3', 'week4']);
    });

    it('should handle disabled windowing (backward compatibility)', () => {
      const weeks = Array.from({ length: 6 }, (_, i) => `week${i}`);
      
      const enabled = isVirtualWeeksEnabled(undefined, 6);
      assert.equal(enabled, false);
      
      const visible = getVisibleWeeks(weeks, 0, undefined as any);
      assert.deepEqual(visible, weeks, 'All weeks visible');
    });
  });
});
