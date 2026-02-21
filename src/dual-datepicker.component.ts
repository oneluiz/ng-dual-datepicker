import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef, forwardRef, signal, computed, effect, inject, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// Public API imports
import { DateAdapter, DATE_ADAPTER } from './core/public';
import { NativeDateAdapter } from './core/public';
import { DualDateRangeStore } from './core/public';
import { PresetRegistry } from './core/public';
import { BUILT_IN_PRESETS } from './core/public';

// Internal API imports (component implementation)
import {
  CalendarGridCache,
  CalendarGrid,
  CalendarCell,
  RangeHighlighterCache,
  DecoratedCell,
  VirtualWeeksConfig,
  getVisibleWeeks,
  navigateWeekWindow,
  isVirtualWeeksEnabled
} from './core/internal';

export interface DateRange {
  startDate: string;
  endDate: string;
  rangeText: string;
  startTime?: string; // HH:mm format (optional)
  endTime?: string; // HH:mm format (optional)
}

export interface MultiDateRange {
  ranges: DateRange[];
}

export interface PresetRange {
  start: string;
  end: string;
}

export interface PresetConfig {
  label: string;
  getValue: () => PresetRange;
}

export interface LocaleConfig {
  monthNames?: string[];
  monthNamesShort?: string[];
  dayNames?: string[];
  dayNamesShort?: string[];
  firstDayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
}

export type ThemeType = 'default' | 'bootstrap' | 'bulma' | 'foundation' | 'tailwind' | 'custom';

@Component({
  selector: 'ngx-dual-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dual-datepicker.component.html',
  styleUrl: './dual-datepicker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DualDatepickerComponent),
      multi: true
    },
    {
      provide: DATE_ADAPTER,
      useClass: NativeDateAdapter
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (registry: PresetRegistry) => {
        return () => {
          // Auto-register built-in presets
          BUILT_IN_PRESETS.forEach(preset => registry.register(preset));
        };
      },
      deps: [PresetRegistry]
    }
  ]
})
export class DualDatepickerComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() placeholder: string = 'Select date range';
  @Input() set startDate(value: string) {
    if (value) {
      const date = this.dateAdapter.parseISODate(value);
      if (date) this.rangeStore.setStart(date);
    }
  }
  get startDate(): string {
    const date = this.rangeStore.startDate();
    return date ? this.formatDate(date) : '';
  }
  
  @Input() set endDate(value: string) {
    if (value) {
      const date = this.dateAdapter.parseISODate(value);
      if (date) this.rangeStore.setEnd(date);
    }
  }
  get endDate(): string {
    const date = this.rangeStore.endDate();
    return date ? this.formatDate(date) : '';
  }
  @Input() showPresets: boolean = true;
  @Input() showClearButton: boolean = false;
  @Input() multiRange: boolean = false;
  @Input() closeOnSelection: boolean = true;
  @Input() closeOnPresetSelection: boolean = true;
  @Input() closeOnClickOutside: boolean = true;
  @Input() enableKeyboardNavigation: boolean = true;
  @Input() presets: PresetConfig[] = [];
  @Input() theme: ThemeType = 'default';
  @Input() inputBackgroundColor: string = '#fff';
  @Input() inputTextColor: string = '#495057';
  @Input() inputBorderColor: string = '#ced4da';
  @Input() inputBorderColorHover: string = '#ced4da';
  @Input() inputBorderColorFocus: string = '#80bdff';
  @Input() inputPadding: string = '0.375rem 0.75rem';
  @Input() locale: LocaleConfig = {};
  @Input() disabledDates: Date[] | ((date: Date) => boolean) | undefined;
  @Input() displayFormat: string = 'D MMM'; // Format for displaying dates in input
  @Input() requireApply: boolean = false; // Require Apply button confirmation
  @Input() enableTimePicker: boolean = false; // Enable time selection
  @Input() timeFormat: '12h' | '24h' = '24h'; // Time format
  @Input() minuteStep: number = 15; // Step for minute selector (1, 5, 15, 30)
  @Input() defaultStartTime: string = '00:00'; // Default start time HH:mm
  @Input() defaultEndTime: string = '23:59'; // Default end time HH:mm
  
  /**
   * Virtual Weeks Configuration (v3.9.0+)
   * 
   * Enables windowed rendering to reduce DOM complexity and improve mobile performance.
   * Only renders a subset of calendar weeks instead of all 6.
   * 
   * Example: `{ windowSize: 3 }` renders only 3 weeks (21 cells) instead of 6 weeks (42 cells),
   * reducing DOM nodes by ~50% per calendar.
   * 
   * @default undefined (disabled - renders all 6 weeks for backward compatibility)
   * 
   * Example:
   * ```html
   * <ngx-dual-datepicker
   *   [virtualWeeks]="{ windowSize: 3 }">
   * </ngx-dual-datepicker>
   * ```
   */
  @Input() virtualWeeks?: VirtualWeeksConfig;

  @Output() dateRangeChange = new EventEmitter<DateRange>();
  @Output() dateRangeSelected = new EventEmitter<DateRange>();
  @Output() multiDateRangeChange = new EventEmitter<MultiDateRange>();
  @Output() multiDateRangeSelected = new EventEmitter<MultiDateRange>();

  // Date adapter injection
  private dateAdapter = inject<DateAdapter>(DATE_ADAPTER);
  
  // Calendar grid cache (v3.7.0+) - memoizes month grid generation
  private gridCache = inject(CalendarGridCache);
  
  // Range highlighter cache (v3.8.0+) - memoizes decorations
  private highlighterCache = inject(RangeHighlighterCache);
  
  // Headless store for date range state (v3.5.0+)
  protected readonly rangeStore = inject(DualDateRangeStore);

  // UI-only signals
  showDatePicker = signal(false);
  currentMonth = signal(this.dateAdapter.normalize(new Date()));
  previousMonth = signal(this.dateAdapter.normalize(new Date()));
  currentMonthDays = signal<any[]>([]);
  previousMonthDays = signal<any[]>([]);
  isDisabled = signal(false);
  showStartTimePicker = signal(false);
  showEndTimePicker = signal(false);
  hoverDate = signal<string | null>(null);
  
  /**
   * Virtual Weeks State (v3.9.0+)
   * 
   * Signals to track which week window is currently visible for each calendar.
   * - weekStart = 0: Shows first N weeks (windowSize)
   * - weekStart = 1: Shows weeks 1 to N+1, etc.
   * 
   * Reset to 0 when month changes for consistent UX.
   */
  previousMonthWeekStart = signal(0);
  currentMonthWeekStart = signal(0);
  
  /**
   * Computed: Visible weeks for windowed rendering (v3.9.0+)
   * 
   * If virtualWeeks is enabled, returns only the visible subset of weeks.
   * Otherwise, returns all weeks for backward compatibility.
   * 
   * Example: If windowSize=3 and weekStart=0, returns first 3 weeks (rows 0-2).
   */
  previousMonthVisibleDays = computed(() => {
    const allDays = this.previousMonthDays();
    if (!this.virtualWeeks || !isVirtualWeeksEnabled(this.virtualWeeks.windowSize, 6)) {
      return allDays;
    }
    
    // Calendar has 6 weeks (42 cells = 7 days × 6 weeks)
    const allWeeks: any[][] = [];
    for (let i = 0; i < 6; i++) {
      allWeeks.push(allDays.slice(i * 7, (i + 1) * 7));
    }
    
    const visibleWeeks = getVisibleWeeks(
      allWeeks,
      this.previousMonthWeekStart(),
      this.virtualWeeks.windowSize
    );
    
    return visibleWeeks.flat();
  });
  
  currentMonthVisibleDays = computed(() => {
    const allDays = this.currentMonthDays();
    if (!this.virtualWeeks || !isVirtualWeeksEnabled(this.virtualWeeks.windowSize, 6)) {
      return allDays;
    }
    
    // Calendar has 6 weeks (42 cells = 7 days × 6 weeks)
    const allWeeks: any[][] = [];
    for (let i = 0; i < 6; i++) {
      allWeeks.push(allDays.slice(i * 7, (i + 1) * 7));
    }
    
    const visibleWeeks = getVisibleWeeks(
      allWeeks,
      this.currentMonthWeekStart(),
      this.virtualWeeks.windowSize
    );
    
    return visibleWeeks.flat();
  });
  
  // Computed time properties from store
  get startHour(): number {
    const time = this.rangeStore.startTime();
    return this.parseTime(time).hour;
  }
  
  get startMinute(): number {
    const time = this.rangeStore.startTime();
    return this.parseTime(time).minute;
  }
  
  get endHour(): number {
    const time = this.rangeStore.endTime();
    return this.parseTime(time).hour;
  }
  
  get endMinute(): number {
    const time = this.rangeStore.endTime();
    return this.parseTime(time).minute;
  }
  
  private setStartHourMinute(hour: number, minute: number): void {
    const timeStr = this.formatTime(hour, minute);
    this.rangeStore.setStartTime(timeStr);
  }
  
  private setEndHourMinute(hour: number, minute: number): void {
    const timeStr = this.formatTime(hour, minute);
    this.rangeStore.setEndTime(timeStr);
  }
  
  // Multi-range support (UI-specific)
  selectedRanges = signal<DateRange[]>([]);
  currentRangeIndex = signal<number>(-1);

  // Keyboard navigation (UI-specific)
  focusedDay = signal<{ date: string; monthIndex: number } | null>(null);
  
  // Computed values
  currentMonthName = computed(() => this.getMonthName(this.currentMonth()));
  previousMonthName = computed(() => this.getMonthName(this.previousMonth()));
  weekDayNames = computed(() => this.getDayNames());
  
  // Computed from store
  dateRangeText = computed(() => this.rangeStore.rangeText());
  selectingStartDate = computed(() => this.rangeStore.selectingStart());
  hasPendingChanges = computed(() => this.rangeStore.hasPendingChanges());
  
  // Computed for template access to pending dates (requireApply mode)
  get pendingStartDate(): string {
    // In requireApply mode, store keeps pending values
    // For now, use actual store values as pending (store handles this)
    if (!this.requireApply) return '';
    const date = this.rangeStore.startDate();
    return date && this.hasPendingChanges() ? this.formatDate(date) : '';
  }
  
  get pendingEndDate(): string {
    if (!this.requireApply) return '';
    const date = this.rangeStore.endDate();
    return date && this.hasPendingChanges() ? this.formatDate(date) : '';
  }

  private readonly defaultMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private readonly defaultMonthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private readonly defaultDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  private readonly defaultDayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // ControlValueAccessor callbacks
  private onChange: (value: DateRange | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {
    // Effect to emit changes when dates change in store
    effect(() => {
      const range = this.rangeStore.range();
      if (range.start || range.end) {
        this.onChange(this.getDateRangeValue());
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.showDatePicker() && this.closeOnClickOutside) {
      const clickedInside = this.elementRef.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.closeDatePicker();
      }
    }
  }

  @HostListener('keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent): void {
    if (!this.enableKeyboardNavigation) {
      return;
    }

    if (!this.showDatePicker()) {
      // When picker is closed, allow Enter/Space to open it
      if (event.key === 'Enter' || event.key === ' ') {
        const target = event.target as HTMLElement;
        if (target.classList.contains('datepicker-input')) {
          event.preventDefault();
          this.toggleDatePicker();
        }
      }
      return;
    }

    // When picker is open
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeDatePicker();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.moveFocusVertical(-1);
        break;

      case 'ArrowDown':
        event.preventDefault();
        this.moveFocusVertical(1);
        break;

      case 'ArrowLeft':
        event.preventDefault();
        this.moveFocusHorizontal(-1);
        break;

      case 'ArrowRight':
        event.preventDefault();
        this.moveFocusHorizontal(1);
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectFocusedDay();
        break;

      case 'Home':
        event.preventDefault();
        this.moveFocusToFirstDay();
        break;

      case 'End':
        event.preventDefault();
        this.moveFocusToLastDay();
        break;

      case 'PageUp':
        event.preventDefault();
        if (event.shiftKey) {
          this.moveFocusYear(-1);
        } else {
          this.changeMonth(-1);
          this.adjustFocusAfterMonthChange();
        }
        break;

      case 'PageDown':
        event.preventDefault();
        if (event.shiftKey) {
          this.moveFocusYear(1);
        } else {
          this.changeMonth(1);
          this.adjustFocusAfterMonthChange();
        }
        break;
    }
  }

  // Keyboard navigation methods
  private initializeFocus(): void {
    // Set initial focus to start date, end date, or first available day
    if (this.startDate) {
      const inPrevMonth = this.isDateInMonth(this.startDate, this.previousMonth());
      const inCurrMonth = this.isDateInMonth(this.startDate, this.currentMonth());
      
      if (inPrevMonth || inCurrMonth) {
        this.focusedDay.set({ date: this.startDate, monthIndex: inPrevMonth ? 0 : 1 });
      } else {
        // startDate is not visible, focus on today if visible
        const today = this.dateAdapter.toISODate(this.dateAdapter.normalize(new Date()));
        const inCurrMonth = this.isDateInMonth(today, this.currentMonth());
        
        if (inCurrMonth) {
          this.focusedDay.set({ date: today, monthIndex: 1 });
        } else {
          const currentMonthDays = this.currentMonthDays();
          const firstDay = currentMonthDays.find(day => day.isCurrentMonth);
          if (firstDay) {
            this.focusedDay.set({ date: firstDay.date, monthIndex: 1 });
          }
        }
      }
    } else if (this.endDate) {
      const inPrevMonth = this.isDateInMonth(this.endDate, this.previousMonth());
      const inCurrMonth = this.isDateInMonth(this.endDate, this.currentMonth());
      
      if (inPrevMonth || inCurrMonth) {
        this.focusedDay.set({ date: this.endDate, monthIndex: inPrevMonth ? 0 : 1 });
      } else {
        // endDate is not visible, focus on today if visible
        const today = this.dateAdapter.toISODate(this.dateAdapter.normalize(new Date()));
        const inCurrMonth = this.isDateInMonth(today, this.currentMonth());
        
        if (inCurrMonth) {
          this.focusedDay.set({ date: today, monthIndex: 1 });
        } else {
          const currentMonthDays = this.currentMonthDays();
          const firstDay = currentMonthDays.find(day => day.isCurrentMonth);
          if (firstDay) {
            this.focusedDay.set({ date: firstDay.date, monthIndex: 1 });
          }
        }
      }
    } else {
      // Focus on today if visible, otherwise first day of current month
      const today = this.dateAdapter.toISODate(this.dateAdapter.normalize(new Date()));
      const inCurrMonth = this.isDateInMonth(today, this.currentMonth());
      
      if (inCurrMonth) {
        this.focusedDay.set({ date: today, monthIndex: 1 });
      } else {
        // Today is not in current month, focus on first day of current month
        const currentMonthDays = this.currentMonthDays();
        const firstDay = currentMonthDays.find(day => day.isCurrentMonth);
        if (firstDay) {
          this.focusedDay.set({ date: firstDay.date, monthIndex: 1 });
        }
      }
    }
  }

  private isDateInMonth(dateStr: string, monthDate: Date): boolean {
    const date = this.dateAdapter.parseISODate(dateStr);
    if (!date) return false;
    const year = this.dateAdapter.getYear(date);
    const month = this.dateAdapter.getMonth(date);
    const monthYear = this.dateAdapter.getYear(monthDate);
    const monthMonth = this.dateAdapter.getMonth(monthDate);
    return year === monthYear && month === monthMonth;
  }

  private moveFocusHorizontal(direction: number): void {
    const focused = this.focusedDay();
    if (!focused) {
      this.initializeFocus();
      return;
    }

    const currentDate = this.dateAdapter.parseISODate(focused.date);
    if (!currentDate) return;

    const newDate = this.dateAdapter.addDays(currentDate, direction);
    const newDateStr = this.formatDate(newDate);

    // Determine which month the new date belongs to
    let inPrevMonth = this.isDateInMonth(newDateStr, this.previousMonth());
    let inCurrMonth = this.isDateInMonth(newDateStr, this.currentMonth());

    if (inPrevMonth || inCurrMonth) {
      this.focusedDay.set({ 
        date: newDateStr, 
        monthIndex: inPrevMonth ? 0 : 1 
      });
    } else {
      // Date is outside visible months, navigate month
      if (direction > 0) {
        this.changeMonth(1);
      } else {
        this.changeMonth(-1);
      }
      
      // Recalculate after month change
      inPrevMonth = this.isDateInMonth(newDateStr, this.previousMonth());
      inCurrMonth = this.isDateInMonth(newDateStr, this.currentMonth());
      
      this.focusedDay.set({ 
        date: newDateStr, 
        monthIndex: inPrevMonth ? 0 : (inCurrMonth ? 1 : 0)
      });
    }
  }

  private moveFocusVertical(direction: number): void {
    const focused = this.focusedDay();
    if (!focused) {
      this.initializeFocus();
      return;
    }

    const currentDate = this.dateAdapter.parseISODate(focused.date);
    if (!currentDate) return;

    const newDate = this.dateAdapter.addDays(currentDate, direction * 7); // Move by week
    const newDateStr = this.formatDate(newDate);

    let inPrevMonth = this.isDateInMonth(newDateStr, this.previousMonth());
    let inCurrMonth = this.isDateInMonth(newDateStr, this.currentMonth());

    if (inPrevMonth || inCurrMonth) {
      this.focusedDay.set({ 
        date: newDateStr, 
        monthIndex: inPrevMonth ? 0 : 1 
      });
    } else {
      // Navigate to month containing the new date
      if (direction > 0) {
        this.changeMonth(1);
      } else {
        this.changeMonth(-1);
      }
      
      // Recalculate after month change
      inPrevMonth = this.isDateInMonth(newDateStr, this.previousMonth());
      inCurrMonth = this.isDateInMonth(newDateStr, this.currentMonth());
      
      this.focusedDay.set({ 
        date: newDateStr, 
        monthIndex: inPrevMonth ? 0 : (inCurrMonth ? 1 : 0)
      });
    }
  }

  private moveFocusToFirstDay(): void {
    const prevMonthDays = this.previousMonthDays();
    const firstDay = prevMonthDays.find(day => day.isCurrentMonth);
    if (firstDay) {
      this.focusedDay.set({ date: firstDay.date, monthIndex: 0 });
    }
  }

  private moveFocusToLastDay(): void {
    const currMonthDays = this.currentMonthDays();
    const validDays = currMonthDays.filter(day => day.isCurrentMonth);
    const lastDay = validDays[validDays.length - 1];
    if (lastDay) {
      this.focusedDay.set({ date: lastDay.date, monthIndex: 1 });
    }
  }

  private moveFocusYear(direction: number): void {
    const focused = this.focusedDay();
    if (!focused) {
      this.initializeFocus();
      return;
    }

    const currentDate = this.dateAdapter.parseISODate(focused.date);
    if (!currentDate) return;

    const currentYear = this.dateAdapter.getYear(currentDate);
    const currentMonth = this.dateAdapter.getMonth(currentDate);
    const currentDay = this.dateAdapter.getDate(currentDate);
    
    const newDate = this.dateAdapter.normalize(new Date(currentYear + direction, currentMonth, currentDay));
    const newDateStr = this.formatDate(newDate);

    // Update months to show the new year
    this.currentMonth.set(this.dateAdapter.normalize(new Date(currentYear + direction, currentMonth, 1)));
    this.previousMonth.set(this.dateAdapter.normalize(new Date(currentYear + direction, currentMonth - 1, 1)));
    this.generateCalendars();

    const inPrevMonth = this.isDateInMonth(newDateStr, this.previousMonth());
    this.focusedDay.set({ 
      date: newDateStr, 
      monthIndex: inPrevMonth ? 0 : 1 
    });
  }

  private adjustFocusAfterMonthChange(): void {
    const focused = this.focusedDay();
    if (!focused) return;

    const inPrevMonth = this.isDateInMonth(focused.date, this.previousMonth());
    const inCurrMonth = this.isDateInMonth(focused.date, this.currentMonth());

    if (!inPrevMonth && !inCurrMonth) {
      // Focused day is no longer visible, move to equivalent day in visible months
      this.initializeFocus();
    } else {
      // Update month index if needed
      this.focusedDay.set({
        date: focused.date,
        monthIndex: inPrevMonth ? 0 : 1
      });
    }
  }

  private selectFocusedDay(): void {
    const focused = this.focusedDay();
    if (!focused) return;

    const monthDays = focused.monthIndex === 0 ? this.previousMonthDays() : this.currentMonthDays();
    const dayObj = monthDays.find(day => day.date === focused.date && day.isCurrentMonth);
    
    if (dayObj) {
      this.selectDay(dayObj);
    }
  }

  hasKeyboardFocus(date: string, monthIndex: number): boolean {
    const focused = this.focusedDay();
    return focused !== null && focused.date === date && focused.monthIndex === monthIndex;
  }

  ngOnInit(): void {
    // Configure the headless store
    this.rangeStore.configure({
      enableTimePicker: this.enableTimePicker,
      defaultStartTime: this.defaultStartTime,
      defaultEndTime: this.defaultEndTime,
      disabledDates: this.disabledDates
    });
    
    // Initialize dates in store if provided
    if (this.startDate) {
      const date = this.dateAdapter.parseISODate(this.startDate);
      if (date) this.rangeStore.setStart(date);
    }
    if (this.endDate) {
      const date = this.dateAdapter.parseISODate(this.endDate);
      if (date) this.rangeStore.setEnd(date);
    }
    
    if (this.startDate && this.endDate) {
      this.generateCalendars();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] || changes['endDate']) {
      // Sync with store
      if (changes['startDate'] && this.startDate) {
        const date = this.dateAdapter.parseISODate(this.startDate);
        if (date) this.rangeStore.setStart(date);
      }
      if (changes['endDate'] && this.endDate) {
        const date = this.dateAdapter.parseISODate(this.endDate);
        if (date) this.rangeStore.setEnd(date);
      }
      
      if (this.startDate && this.endDate) {
        this.generateCalendars();
      }
    }
    
    // Update store configuration if relevant inputs change
    if (changes['enableTimePicker'] || changes['defaultStartTime'] || 
        changes['defaultEndTime'] || changes['disabledDates']) {
      this.rangeStore.configure({
        enableTimePicker: this.enableTimePicker,
        defaultStartTime: this.defaultStartTime,
        defaultEndTime: this.defaultEndTime,
        disabledDates: this.disabledDates
      });
    }
  }

  formatDate(date: Date): string {
    const year = this.dateAdapter.getYear(date);
    const month = String(this.dateAdapter.getMonth(date) + 1).padStart(2, '0');
    const day = String(this.dateAdapter.getDate(date)).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const date = this.dateAdapter.parseISODate(dateStr);
    if (!date) return '';
    
    const year = this.dateAdapter.getYear(date);
    const month = this.dateAdapter.getMonth(date);
    const day = this.dateAdapter.getDate(date);
    
    const monthNames = this.locale.monthNames || this.defaultMonthNames;
    const monthNamesShort = this.locale.monthNamesShort || this.defaultMonthNamesShort;
    
    // Replace format tokens with values
    let formatted = this.displayFormat;
    
    // Year tokens
    formatted = formatted.replace(/YYYY/g, String(year));
    formatted = formatted.replace(/YY/g, String(year).slice(-2));
    
    // Month tokens (order matters: MMMM before MMM before MM before M)
    formatted = formatted.replace(/MMMM/g, monthNames[month]);
    formatted = formatted.replace(/MMM/g, monthNamesShort[month]);
    formatted = formatted.replace(/MM/g, String(month + 1).padStart(2, '0'));
    formatted = formatted.replace(/M/g, String(month + 1));
    
    // Day tokens (order matters: DD before D)
    formatted = formatted.replace(/DD/g, String(day).padStart(2, '0'));
    formatted = formatted.replace(/D/g, String(day));
    
    return formatted;
  }

  // Note: updateDateRangeText is now handled by computed dateRangeText from store
  // Keeping this method for backward compatibility but it's a no-op
  updateDateRangeText(): void {
    // Text is now automatically computed from store.rangeText()
  }

  toggleDatePicker(): void {
    this.showDatePicker.update(value => !value);
    if (this.showDatePicker()) {
      // selectingStart is managed by store, no need to set here
      const currentMonthValue = this.currentMonth();
      const year = this.dateAdapter.getYear(currentMonthValue);
      const month = this.dateAdapter.getMonth(currentMonthValue);
      const previousMonthDate = this.dateAdapter.normalize(new Date(year, month - 1, 1));
      this.previousMonth.set(previousMonthDate);
      this.generateCalendars();
      // Initialize keyboard focus only if keyboard navigation is enabled
      if (this.enableKeyboardNavigation) {
        this.initializeFocus();
      }
    } else {
      // Clear focus when closing
      if (this.enableKeyboardNavigation) {
        this.focusedDay.set(null);
      }
    }
    this.onTouched();
  }

  closeDatePicker(): void {
    this.showDatePicker.set(false);
    if (this.enableKeyboardNavigation) {
      this.focusedDay.set(null);
    }
    this.onTouched();
  }

  generateCalendars(): void {
    this.previousMonthDays.set(this.generateMonthCalendar(this.previousMonth()));
    this.currentMonthDays.set(this.generateMonthCalendar(this.currentMonth()));
    
    // Reset virtual week windows when month changes (v3.9.0+)
    // Always start at first week for consistent UX
    if (this.virtualWeeks) {
      this.previousMonthWeekStart.set(0);
      this.currentMonthWeekStart.set(0);
    }
  }

  /**
   * Generate calendar grid with decorations (v3.8.0+)
   * 
   * Uses CalendarGridCache for base grid structure (memoized by month),
   * then uses RangeHighlighterCache for decorations (memoized by range/constraints).
   * 
   * Performance:
   * - Grid structure: Cached by month (same month = same grid object)
   * - Decorations: Cached by range+hover+disabled (same state = same decorated grid)
   * - Result: ~95% cache hit rate in typical usage
   * 
   * Cache keys:
   * - Grid: `${year}-${month}-${weekStart}`
   * - Decorations: `${monthKey}|${start}|${end}|${hover}|${disabled}`
   */
  generateMonthCalendar(date: Date): any[] {
    // Get base grid from cache (weekStart = 0 for Sunday, no locale for now)
    const grid: CalendarGrid = this.gridCache.get(date, 0);
    
    // Get dates from store
    const startDate = this.rangeStore.startDate();
    const endDate = this.rangeStore.endDate();
    const hoverISO = this.hoverDate();
    
    // Get decorated grid from cache (handles all decoration logic)
    const decorated = this.highlighterCache.get(grid, {
      start: startDate,
      end: endDate,
      hoverDate: hoverISO,
      disabledDates: this.disabledDates,
      multiRange: this.multiRange,
      selectingStartDate: this.selectingStartDate()
      // minDate/maxDate omitted for now (not in current API)
    });
    
    // Map decorated cells to legacy format (for backward compatibility)
    const monthDays = decorated.cells.map((cell: DecoratedCell) => {
      if (!cell.inCurrentMonth) {
        // Padding cell (previous/next month)
        return { day: null, isCurrentMonth: false };
      }
      
      // Current month cell - use cached decorations
      return {
        day: cell.day,
        date: cell.iso,
        isCurrentMonth: true,
        isStart: cell.isSelectedStart,
        isEnd: cell.isSelectedEnd,
        inRange: cell.isInRange,
        inHoverRange: cell.isInHoverRange,
        isDisabled: cell.isDisabled
      };
    });

    return monthDays;
  }

  isInRange(dateStr: string): boolean {
    if (this.multiRange) {
      // Check if date is in any of the selected ranges
      return this.selectedRanges().some(range => {
        return dateStr >= range.startDate && dateStr <= range.endDate;
      });
    } else {
      if (!this.startDate || !this.endDate) return false;
      return dateStr >= this.startDate && dateStr <= this.endDate;
    }
  }

  /**
   * Virtual Weeks Navigation (v3.9.0+)
   * 
   * Navigate the visible week window up/down for windowed rendering.
   * 
   * @param monthIndex 0 = previous month, 1 = current month
   * @param direction -1 = scroll up (previous weeks), +1 = scroll down (next weeks)
   * 
   * Example: If windowSize=3 and weekStart=0, navigateWeeks(0, +1) shows weeks 1-3.
   */
  navigateWeeks(monthIndex: number, direction: number): void {
    if (!this.virtualWeeks) return;
    
    const totalWeeks = 6; // Standard calendar grid has 6 weeks
    const currentStart = monthIndex === 0 
      ? this.previousMonthWeekStart() 
      : this.currentMonthWeekStart();
    
    const newStart = navigateWeekWindow(
      currentStart,
      direction,
      totalWeeks,
      this.virtualWeeks.windowSize
    );
    
    if (monthIndex === 0) {
      this.previousMonthWeekStart.set(newStart);
    } else {
      this.currentMonthWeekStart.set(newStart);
    }
  }

  /**
   * Check if week navigation is available (v3.9.0+)
   * 
   * @param monthIndex 0 = previous month, 1 = current month
   * @param direction -1 = up (can scroll to previous weeks?), +1 = down (can scroll to next weeks?)
   * @returns true if navigation is available in that direction
   */
  canNavigateWeeks(monthIndex: number, direction: number): boolean {
    if (!this.virtualWeeks) return false;
    
    const totalWeeks = 6;
    const currentStart = monthIndex === 0 
      ? this.previousMonthWeekStart() 
      : this.currentMonthWeekStart();
    
    if (direction < 0) {
      // Can scroll up if not at start
      return currentStart > 0;
    } else {
      // Can scroll down if window doesn't extend past end
      return currentStart + this.virtualWeeks.windowSize < totalWeeks;
    }
  }

  isDateDisabled(date: Date): boolean {
    if (!this.disabledDates) return false;

    if (typeof this.disabledDates === 'function') {
      // If it's a function, call it with the date
      return this.disabledDates(date);
    } else if (Array.isArray(this.disabledDates)) {
      // If it's an array, check if the date matches any disabled date
      return this.disabledDates.some(disabledDate => {
        return this.dateAdapter.getYear(date) === this.dateAdapter.getYear(disabledDate) &&
               this.dateAdapter.getMonth(date) === this.dateAdapter.getMonth(disabledDate) &&
               this.dateAdapter.getDate(date) === this.dateAdapter.getDate(disabledDate);
      });
    }
    
    return false;
  }

  isInHoverRange(dateStr: string): boolean {
    const hover = this.hoverDate();
    if (!hover) return false;

    // In multiRange mode, only show hover preview when selecting end date
    if (this.multiRange) {
      if (this.selectingStartDate()) return false;
      const currentStart = this.startDate;
      if (!currentStart) return false;
      const minDate = currentStart < hover ? currentStart : hover;
      const maxDate = currentStart > hover ? currentStart : hover;
      return dateStr >= minDate && dateStr <= maxDate;
    } else {
      // In single range mode  
      if (this.selectingStartDate()) return false;
      
      if (this.requireApply) {
        // Use pending dates from store
        const pendingStart = this.rangeStore.startDate();
        if (!pendingStart) return false;
        const pendingStartStr = this.formatDate(pendingStart);
        const minDate = pendingStartStr < hover ? pendingStartStr : hover;
        const maxDate = pendingStartStr > hover ? pendingStartStr : hover;
        return dateStr >= minDate && dateStr <= maxDate;
      } else {
        // Use actual dates
        const currentStart = this.startDate;
        if (!currentStart) return false;
        const minDate = currentStart < hover ? currentStart : hover;
        const maxDate = currentStart > hover ? currentStart : hover;
        return dateStr >= minDate && dateStr <= maxDate;
      }
    }
  }

  onDayHover(dayObj: any): void {
    if (!dayObj.isCurrentMonth || this.isDisabled() || dayObj.isDisabled) {
      this.hoverDate.set(null);
      return;
    }
    this.hoverDate.set(dayObj.date);
    this.generateCalendars();
  }

  clearDayHover(): void {
    this.hoverDate.set(null);
    this.generateCalendars();
  }

  selectDay(dayObj: any): void {
    if (!dayObj.isCurrentMonth || this.isDisabled() || dayObj.isDisabled) return;
    
    const selectedDate = this.dateAdapter.parseISODate(dayObj.date);
    if (!selectedDate) return;

    if (this.multiRange) {
      // Multi-range mode: add ranges to array
      if (this.selectingStartDate()) {
        this.rangeStore.setStart(selectedDate);
        this.rangeStore.setEnd(null);
      } else {
        const currentStart = this.rangeStore.startDate();
        if (currentStart && selectedDate < currentStart) {
          // Swap: selected becomes start, current start becomes end
          this.rangeStore.setStart(selectedDate);
          this.rangeStore.setEnd(currentStart);
        } else {
          this.rangeStore.setEnd(selectedDate);
        }
        
        // Add the new range to the array
        const range = this.rangeStore.range();
        const newRange: DateRange = {
          startDate: range.start,
          endDate: range.end,
          rangeText: this.formatDateDisplay(range.start) + ' – ' + this.formatDateDisplay(range.end),
          ...(this.enableTimePicker && { startTime: range.startTime, endTime: range.endTime })
        };
        
        const currentRanges = [...this.selectedRanges()];
        currentRanges.push(newRange);
        this.selectedRanges.set(currentRanges);
        
        // Reset for next range selection
        this.rangeStore.reset();
        
        // Update display text
        this.updateMultiRangeText();
        
        // Don't close if multiRange, allow adding more ranges
        if (this.closeOnSelection && !this.multiRange) {
          this.showDatePicker.set(false);
        }
        
        this.emitMultiChange();
        this.emitMultiSelection();
      }
      this.generateCalendars();
    } else {
      // Single range mode
      if (this.requireApply) {
        // Apply mode: use pending dates, don't emit until Apply is clicked
        if (this.selectingStartDate()) {
          this.rangeStore.setPendingStart(selectedDate);
          this.rangeStore.setPendingEnd(null);
        } else {
          const pendingStart = this.rangeStore.startDate();
          if (pendingStart && selectedDate < pendingStart) {
            // Swap
            this.rangeStore.setPendingStart(selectedDate);
            this.rangeStore.setPendingEnd(pendingStart);
          } else {
            this.rangeStore.setPendingEnd(selectedDate);
          }
        }
        this.generateCalendars();
      } else {
        // Immediate mode: emit changes immediately
        if (this.selectingStartDate()) {
          this.rangeStore.setStart(selectedDate);
          this.rangeStore.setEnd(null);
          this.emitChange();
        } else {
          const currentStart = this.rangeStore.startDate();
          if (currentStart && selectedDate < currentStart) {
            // Swap
            this.rangeStore.setStart(selectedDate);
            this.rangeStore.setEnd(currentStart);
          } else {
            this.rangeStore.setEnd(selectedDate);
          }
          
          if (this.closeOnSelection) {
            this.showDatePicker.set(false);
          }
          this.emitChange();
          this.emitSelection();
        }
        this.generateCalendars();
      }
    }
  }

  applySelection(): void {
    if (!this.hasPendingChanges()) return;
    
    // Apply pending dates through store
    this.rangeStore.applyPending();
    
    // Emit changes
    this.emitChange();
    this.emitSelection();
    
    // Close picker
    this.showDatePicker.set(false);
  }

  cancelSelection(): void {
    // Discard pending changes through store
    this.rangeStore.cancelPending();
    
    // Regenerate calendars to clear pending visual state
    this.generateCalendars();
  }

  changeMonth(direction: number): void {
    const currentMonthValue = this.currentMonth();
    const year = this.dateAdapter.getYear(currentMonthValue);
    const month = this.dateAdapter.getMonth(currentMonthValue);
    const newCurrentMonth = this.dateAdapter.normalize(new Date(year, month + direction, 1));
    this.currentMonth.set(newCurrentMonth);
    
    const newYear = this.dateAdapter.getYear(newCurrentMonth);
    const newMonth = this.dateAdapter.getMonth(newCurrentMonth);
    const newPreviousMonth = this.dateAdapter.normalize(new Date(newYear, newMonth - 1, 1));
    this.previousMonth.set(newPreviousMonth);
    this.generateCalendars();
  }

  getMonthName(date: Date): string {
    const monthNames = this.locale.monthNames || this.defaultMonthNames;
    return `${monthNames[this.dateAdapter.getMonth(date)]} ${this.dateAdapter.getYear(date)}`;
  }

  getDayNames(): string[] {
    return this.locale.dayNamesShort || this.defaultDayNamesShort;
  }

  selectPresetRange(preset: PresetConfig): void {
    if (!preset.getValue) {
      console.error('PresetConfig must have getValue() function');
      return;
    }

    const range = preset.getValue();
    const startDate = this.dateAdapter.parseISODate(range.start);
    const endDate = this.dateAdapter.parseISODate(range.end);
    
    if (startDate && endDate) {
      this.rangeStore.setRange(startDate, endDate);
    }
    
    this.generateCalendars();
    if (this.closeOnPresetSelection) {
      this.showDatePicker.set(false);
    }
    this.emitSelection();
  }

  clear(): void {
    this.rangeStore.reset();
    this.showDatePicker.set(false);
    
    if (this.multiRange) {
      this.selectedRanges.set([]);
      this.currentRangeIndex.set(-1);
      this.emitMultiChange();
    } else {
      this.emitChange();
    }
    
    this.onTouched();
    this.generateCalendars();
  }
  
  removeRange(index: number): void {
    if (!this.multiRange) return;
    
    const currentRanges = [...this.selectedRanges()];
    currentRanges.splice(index, 1);
    this.selectedRanges.set(currentRanges);
    
    this.updateMultiRangeText();
    this.emitMultiChange();
    this.emitMultiSelection();
    this.generateCalendars();
  }
  
  private updateMultiRangeText(): void {
    const count = this.selectedRanges().length;
    // Note: dateRangeText is now computed from store, this is for multi-range UI only
    // We could store this in a separate signal if needed, but for now just track ranges count
  }

  private emitChange(): void {
    const storeRange = this.rangeStore.range();
    const range: DateRange = {
      startDate: storeRange.start,
      endDate: storeRange.end,
      rangeText: this.dateRangeText()
    };
    
    if (this.enableTimePicker) {
      range.startTime = storeRange.startTime;
      range.endTime = storeRange.endTime;
    }
    
    this.dateRangeChange.emit(range);
  }

  private emitSelection(): void {
    const storeRange = this.rangeStore.range();
    const range: DateRange = {
      startDate: storeRange.start,
      endDate: storeRange.end,
      rangeText: this.dateRangeText()
    };
    
    if (this.enableTimePicker) {
      range.startTime = storeRange.startTime;
      range.endTime = storeRange.endTime;
    }
    
    this.dateRangeSelected.emit(range);
  }
  
  private emitMultiChange(): void {
    this.multiDateRangeChange.emit({
      ranges: this.selectedRanges()
    });
  }
  
  private emitMultiSelection(): void {
    this.multiDateRangeSelected.emit({
      ranges: this.selectedRanges()
    });
  }

  private getDateRangeValue(): DateRange {
    const storeRange = this.rangeStore.range();
    const range: DateRange = {
      startDate: storeRange.start,
      endDate: storeRange.end,
      rangeText: this.dateRangeText()
    };
    
    if (this.enableTimePicker) {
      range.startTime = storeRange.startTime;
      range.endTime = storeRange.endTime;
    }
    
    return range;
  }

  // Time Picker Methods
  toggleStartTimePicker(): void {
    if (!this.enableTimePicker) return;
    this.showStartTimePicker.set(!this.showStartTimePicker());
    this.showEndTimePicker.set(false);
  }

  toggleEndTimePicker(): void {
    if (!this.enableTimePicker) return;
    this.showEndTimePicker.set(!this.showEndTimePicker());
    this.showStartTimePicker.set(false);
  }

  incrementStartHour(): void {
    const newHour = (this.startHour + 1) % 24;
    this.setStartHourMinute(newHour, this.startMinute);
    if (!this.requireApply) {
      this.emitChange();
    }
  }

  decrementStartHour(): void {
    const newHour = this.startHour === 0 ? 23 : this.startHour - 1;
    this.setStartHourMinute(newHour, this.startMinute);
    if (!this.requireApply) {
      this.emitChange();
    }
  }

  incrementStartMinute(): void {
    const newMinute = (this.startMinute + this.minuteStep) % 60;
    this.setStartHourMinute(this.startHour, newMinute);
    if (!this.requireApply) {
      this.emitChange();
    }
  }

  decrementStartMinute(): void {
    let newMinute = this.startMinute - this.minuteStep;
    if (newMinute < 0) {
      newMinute = 60 - this.minuteStep;
    }
    this.setStartHourMinute(this.startHour, newMinute);
    if (!this.requireApply) {
      this.emitChange();
    }
  }

  incrementEndHour(): void {
    const newHour = (this.endHour + 1) % 24;
    this.setEndHourMinute(newHour, this.endMinute);
    if (!this.requireApply) {
      this.emitChange();
    }
  }

  decrementEndHour(): void {
    const newHour = this.endHour === 0 ? 23 : this.endHour - 1;
    this.setEndHourMinute(newHour, this.endMinute);
    if (!this.requireApply) {
      this.emitChange();
    }
  }

  incrementEndMinute(): void {
    const newMinute = (this.endMinute + this.minuteStep) % 60;
    this.setEndHourMinute(this.endHour, newMinute);
    if (!this.requireApply) {
      this.emitChange();
    }
  }

  decrementEndMinute(): void {
    let newMinute = this.endMinute - this.minuteStep;
    if (newMinute < 0) {
      newMinute = 60 - this.minuteStep;
    }
    this.setEndHourMinute(this.endHour, newMinute);
    if (!this.requireApply) {
      this.emitChange();
    }
  }

  formatTime(hour: number, minute: number): string {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    
    if (this.timeFormat === '12h') {
      const isPM = hour >= 12;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = isPM ? 'PM' : 'AM';
      return `${hour12.toString().padStart(2, '0')}:${m} ${period}`;
    }
    
    return `${h}:${m}`;
  }

  parseTime(timeString: string): { hour: number; minute: number } {
    if (!timeString) return { hour: 0, minute: 0 };
    
    const time12hRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
    const time24hRegex = /^(\d{1,2}):(\d{2})$/;
    
    let match = timeString.match(time12hRegex);
    if (match) {
      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      return { hour, minute };
    }
    
    match = timeString.match(time24hRegex);
    if (match) {
      return {
        hour: parseInt(match[1], 10),
        minute: parseInt(match[2], 10)
      };
    }
    
    return { hour: 0, minute: 0 };
  }

  // ControlValueAccessor implementation
  writeValue(value: DateRange | null): void {
    if (value) {
      // Use setters which delegate to store
      this.startDate = value.startDate || '';
      this.endDate = value.endDate || '';
      
      if (this.enableTimePicker) {
        if (value.startTime) {
          this.rangeStore.setStartTime(value.startTime);
        }
        if (value.endTime) {
          this.rangeStore.setEndTime(value.endTime);
        }
      }
      
      if (this.startDate && this.endDate) {
        this.generateCalendars();
      }
    } else {
      this.rangeStore.reset();
    }
  }

  registerOnChange(fn: (value: DateRange | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
