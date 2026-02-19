import { InjectionToken } from '@angular/core';

/**
 * Abstract class for date adapters.
 * Allows the component to work with different date libraries (Date, DayJS, date-fns, Luxon, etc.)
 */
export abstract class DateAdapter<T = any> {
  /**
   * Parses a value into a date object
   * @param value - Value to parse (string, number, or date object)
   * @returns Parsed date object
   */
  abstract parse(value: any): T | null;

  /**
   * Formats a date object into a string
   * @param date - Date object to format
   * @param format - Optional format string
   * @returns Formatted date string
   */
  abstract format(date: T, format?: string): string;

  /**
   * Adds days to a date
   * @param date - Date object
   * @param days - Number of days to add (can be negative)
   * @returns New date object
   */
  abstract addDays(date: T, days: number): T;

  /**
   * Adds months to a date
   * @param date - Date object
   * @param months - Number of months to add (can be negative)
   * @returns New date object
   */
  abstract addMonths(date: T, months: number): T;

  /**
   * Gets the year from a date
   * @param date - Date object
   * @returns Year number
   */
  abstract getYear(date: T): number;

  /**
   * Gets the month from a date (0-11)
   * @param date - Date object
   * @returns Month number (0-11)
   */
  abstract getMonth(date: T): number;

  /**
   * Gets the day of month from a date
   * @param date - Date object
   * @returns Day of month (1-31)
   */
  abstract getDate(date: T): number;

  /**
   * Gets the day of week from a date (0-6, Sunday = 0)
   * @param date - Date object
   * @returns Day of week (0-6)
   */
  abstract getDay(date: T): number;

  /**
   * Creates a new date object
   * @param year - Year
   * @param month - Month (0-11)
   * @param date - Day of month (1-31)
   * @returns New date object
   */
  abstract createDate(year: number, month: number, date: number): T;

  /**
   * Gets today's date
   * @returns Today's date object
   */
  abstract today(): T;

  /**
   * Checks if two dates are the same day
   * @param a - First date
   * @param b - Second date
   * @returns True if same day
   */
  abstract isSameDay(a: T | null, b: T | null): boolean;

  /**
   * Checks if a date is before another
   * @param a - First date
   * @param b - Second date
   * @returns True if a is before b
   */
  abstract isBefore(a: T | null, b: T | null): boolean;

  /**
   * Checks if a date is after another
   * @param a - First date
   * @param b - Second date
   * @returns True if a is after b
   */
  abstract isAfter(a: T | null, b: T | null): boolean;

  /**
   * Checks if a date is between two other dates
   * @param date - Date to check
   * @param start - Start date
   * @param end - End date
   * @returns True if date is between start and end
   */
  abstract isBetween(date: T | null, start: T | null, end: T | null): boolean;

  /**
   * Clones a date object
   * @param date - Date to clone
   * @returns Cloned date object
   */
  abstract clone(date: T): T;

  /**
   * Checks if a value is a valid date
   * @param date - Value to check
   * @returns True if valid date
   */
  abstract isValid(date: any): boolean;
}

/**
 * Injection token for DateAdapter
 */
export const DATE_ADAPTER = new InjectionToken<DateAdapter>('DATE_ADAPTER');
