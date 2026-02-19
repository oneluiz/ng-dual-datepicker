import { Injectable } from '@angular/core';
import { DateAdapter } from './date-adapter';

/**
 * Date adapter implementation for native JavaScript Date objects
 * This is the default adapter used by the component
 */
@Injectable()
export class NativeDateAdapter extends DateAdapter<Date> {
  parse(value: any): Date | null {
    if (!value) return null;
    
    if (value instanceof Date) {
      return new Date(value);
    }
    
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return this.isValid(date) ? date : null;
    }
    
    return null;
  }

  format(date: Date, format: string = 'YYYY-MM-DD'): string {
    if (!this.isValid(date)) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Simple format implementation
    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  addDays(date: Date, days: number): Date {
    const result = this.clone(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  addMonths(date: Date, months: number): Date {
    const result = this.clone(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  getYear(date: Date): number {
    return date.getFullYear();
  }

  getMonth(date: Date): number {
    return date.getMonth();
  }

  getDate(date: Date): number {
    return date.getDate();
  }

  getDay(date: Date): number {
    return date.getDay();
  }

  createDate(year: number, month: number, date: number): Date {
    return new Date(year, month, date);
  }

  today(): Date {
    return new Date();
  }

  isSameDay(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    if (!this.isValid(a) || !this.isValid(b)) return false;
    
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  isBefore(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    if (!this.isValid(a) || !this.isValid(b)) return false;
    
    return a.getTime() < b.getTime();
  }

  isAfter(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    if (!this.isValid(a) || !this.isValid(b)) return false;
    
    return a.getTime() > b.getTime();
  }

  isBetween(date: Date | null, start: Date | null, end: Date | null): boolean {
    if (!date || !start || !end) return false;
    if (!this.isValid(date) || !this.isValid(start) || !this.isValid(end)) return false;
    
    const dateTime = date.getTime();
    const startTime = start.getTime();
    const endTime = end.getTime();
    
    return dateTime >= startTime && dateTime <= endTime;
  }

  clone(date: Date): Date {
    return new Date(date.getTime());
  }

  isValid(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }
}
