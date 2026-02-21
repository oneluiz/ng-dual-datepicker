/**
 * Pure validation functions for date ranges
 * No dependencies, no side effects - just logic
 * Perfect for SSR, testing, and reusability
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate that end date is not before start date
 */
export function validateRangeOrder(start: Date | null, end: Date | null): ValidationResult {
  if (!start || !end) {
    return { valid: true }; // Allow incomplete selection
  }

  if (end < start) {
    return {
      valid: false,
      error: 'End date cannot be before start date'
    };
  }

  return { valid: true };
}

/**
 * Validate that date is within min/max bounds
 */
export function validateDateBounds(
  date: Date | null,
  minDate?: Date,
  maxDate?: Date
): ValidationResult {
  if (!date) {
    return { valid: true };
  }

  if (minDate && date < minDate) {
    return {
      valid: false,
      error: `Date cannot be before ${minDate.toISOString().split('T')[0]}`
    };
  }

  if (maxDate && date > maxDate) {
    return {
      valid: false,
      error: `Date cannot be after ${maxDate.toISOString().split('T')[0]}`
    };
  }

  return { valid: true };
}

/**
 * Validate that a range is within bounds
 */
export function validateRangeBounds(
  start: Date | null,
  end: Date | null,
  minDate?: Date,
  maxDate?: Date
): ValidationResult {
  const startValidation = validateDateBounds(start, minDate, maxDate);
  if (!startValidation.valid) {
    return startValidation;
  }

  const endValidation = validateDateBounds(end, minDate, maxDate);
  if (!endValidation.valid) {
    return endValidation;
  }

  return { valid: true };
}

/**
 * Check if a date is disabled
 */
export function isDateDisabled(
  date: Date,
  disabledDates?: Date[] | ((date: Date) => boolean)
): boolean {
  if (!disabledDates) {
    return false;
  }

  if (typeof disabledDates === 'function') {
    return disabledDates(date);
  }

  // Array of disabled dates - compare by date string
  const dateStr = date.toISOString().split('T')[0];
  return disabledDates.some(
    d => d.toISOString().split('T')[0] === dateStr
  );
}

/**
 * Apply bounds to a date (clamp it)
 */
export function applyBounds(date: Date, minDate?: Date, maxDate?: Date): Date {
  let result = date;

  if (minDate && result < minDate) {
    result = minDate;
  }

  if (maxDate && result > maxDate) {
    result = maxDate;
  }

  return result;
}

/**
 * Parse ISO date string to Date object (deterministic)
 */
export function parseISODate(dateStr: string): Date | null {
  if (!dateStr) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

/**
 * Format Date to ISO string (YYYY-MM-DD)
 */
export function formatISODate(date: Date | null): string {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
