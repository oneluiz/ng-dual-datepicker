/**
 * System Clock Implementation
 * 
 * Default DateClock implementation that uses system time (new Date())
 * 
 * This is the default behavior users expect:
 * - "Today" → actual today
 * - "Last 7 Days" → actual last 7 days
 * 
 * In SSR scenarios, this should be overridden to ensure
 * server and client generate identical date ranges.
 */

import { Injectable } from '@angular/core';
import { DateClock } from './date-clock';

@Injectable({
  providedIn: 'root'
})
export class SystemClock implements DateClock {
  /**
   * Returns current system time
   * 
   * This is the standard behavior for client-side applications.
   * For SSR, override DATE_CLOCK token with a fixed Date.
   */
  now(): Date {
    return new Date();
  }
}
