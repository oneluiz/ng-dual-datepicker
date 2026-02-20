import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef, forwardRef, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateAdapter, DATE_ADAPTER } from './date-adapter';
import { NativeDateAdapter } from './native-date-adapter';

export interface DateRange {
  startDate: string;
  endDate: string;
  rangeText: string;
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
    }
  ]
})
export class DualDatepickerComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() placeholder: string = 'Select date range';
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() showPresets: boolean = true;
  @Input() showClearButton: boolean = false;
  @Input() multiRange: boolean = false;
  @Input() closeOnSelection: boolean = true;
  @Input() closeOnPresetSelection: boolean = true;
  @Input() closeOnClickOutside: boolean = true;
  @Input() enableKeyboardNavigation: boolean = true;
  @Input() presets: PresetConfig[] = [];
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

  @Output() dateRangeChange = new EventEmitter<DateRange>();
  @Output() dateRangeSelected = new EventEmitter<DateRange>();
  @Output() multiDateRangeChange = new EventEmitter<MultiDateRange>();
  @Output() multiDateRangeSelected = new EventEmitter<MultiDateRange>();

  // Date adapter injection
  private dateAdapter = inject<DateAdapter>(DATE_ADAPTER);

  // Signals for reactive state
  showDatePicker = signal(false);
  dateRangeText = signal('');
  selectingStartDate = signal(true);
  currentMonth = signal(this.dateAdapter.today());
  previousMonth = signal(this.dateAdapter.today());
  currentMonthDays = signal<any[]>([]);
  previousMonthDays = signal<any[]>([]);
  isDisabled = signal(false);
  
  // Apply/Confirm support
  pendingStartDate: string = '';
  pendingEndDate: string = '';
  hasPendingChanges = signal(false);
  
  // Multi-range support
  selectedRanges = signal<DateRange[]>([]);
  currentRangeIndex = signal<number>(-1);

  // Keyboard navigation
  focusedDay = signal<{ date: string; monthIndex: number } | null>(null); // monthIndex: 0 = previous, 1 = current
  
  // Computed values
  currentMonthName = computed(() => this.getMonthName(this.currentMonth()));
  previousMonthName = computed(() => this.getMonthName(this.previousMonth()));
  weekDayNames = computed(() => this.getDayNames());

  private readonly defaultMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private readonly defaultMonthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private readonly defaultDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  private readonly defaultDayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // ControlValueAccessor callbacks
  private onChange: (value: DateRange | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {
    // Effect to emit changes when dates change
    effect(() => {
      const range = this.dateRangeText();
      if (this.startDate || this.endDate) {
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
        const today = this.dateAdapter.format(this.dateAdapter.today(), 'yyyy-MM-dd');
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
        const today = this.dateAdapter.format(this.dateAdapter.today(), 'yyyy-MM-dd');
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
      const today = this.dateAdapter.format(this.dateAdapter.today(), 'yyyy-MM-dd');
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
    const date = this.dateAdapter.parse(dateStr);
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

    const currentDate = this.dateAdapter.parse(focused.date);
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

    const currentDate = this.dateAdapter.parse(focused.date);
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

    const currentDate = this.dateAdapter.parse(focused.date);
    if (!currentDate) return;

    const currentYear = this.dateAdapter.getYear(currentDate);
    const currentMonth = this.dateAdapter.getMonth(currentDate);
    const currentDay = this.dateAdapter.getDate(currentDate);
    
    const newDate = this.dateAdapter.createDate(currentYear + direction, currentMonth, currentDay);
    const newDateStr = this.formatDate(newDate);

    // Update months to show the new year
    this.currentMonth.set(this.dateAdapter.createDate(currentYear + direction, currentMonth, 1));
    this.previousMonth.set(this.dateAdapter.createDate(currentYear + direction, currentMonth - 1, 1));
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
    if (this.startDate && this.endDate) {
      this.updateDateRangeText();
      this.generateCalendars();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] || changes['endDate']) {
      if (this.startDate && this.endDate) {
        this.updateDateRangeText();
        this.generateCalendars();
      } else if (!this.startDate && !this.endDate) {
        this.dateRangeText.set('');
      }
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
    const date = this.dateAdapter.parse(dateStr);
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

  updateDateRangeText(): void {
    if (this.startDate && this.endDate) {
      const start = this.formatDateDisplay(this.startDate);
      const end = this.formatDateDisplay(this.endDate);
      this.dateRangeText.set(`${start} - ${end}`);
    } else {
      this.dateRangeText.set('');
    }
  }

  toggleDatePicker(): void {
    this.showDatePicker.update(value => !value);
    if (this.showDatePicker()) {
      this.selectingStartDate.set(true);
      const currentMonthValue = this.currentMonth();
      const year = this.dateAdapter.getYear(currentMonthValue);
      const month = this.dateAdapter.getMonth(currentMonthValue);
      const previousMonthDate = this.dateAdapter.createDate(year, month - 1, 1);
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
  }

  generateMonthCalendar(date: Date): any[] {
    const year = this.dateAdapter.getYear(date);
    const month = this.dateAdapter.getMonth(date);
    const firstDay = this.dateAdapter.createDate(year, month, 1);
    const lastDay = this.dateAdapter.createDate(year, month + 1, 0);
    const daysInMonth = this.dateAdapter.getDate(lastDay);
    const firstDayOfWeek = this.dateAdapter.getDay(firstDay);

    const monthDays = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      monthDays.push({ day: null, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = this.dateAdapter.createDate(year, month, day);
      const dateStr = this.formatDate(dayDate);
      
      // Check if date is in pending range (for requireApply mode)
      const isPendingStart = this.requireApply && this.pendingStartDate === dateStr;
      const isPendingEnd = this.requireApply && this.pendingEndDate === dateStr;
      const inPendingRange = this.requireApply && this.pendingStartDate && this.pendingEndDate &&
                             dateStr >= this.pendingStartDate && dateStr <= this.pendingEndDate;
      
      monthDays.push({
        day: day,
        date: dateStr,
        isCurrentMonth: true,
        isStart: this.startDate === dateStr || isPendingStart,
        isEnd: this.endDate === dateStr || isPendingEnd,
        inRange: this.isInRange(dateStr) || inPendingRange,
        isDisabled: this.isDateDisabled(dayDate)
      });
    }

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

  selectDay(dayObj: any): void {
    if (!dayObj.isCurrentMonth || this.isDisabled() || dayObj.isDisabled) return;

    if (this.multiRange) {
      // Multi-range mode: add ranges to array
      if (this.selectingStartDate()) {
        this.startDate = dayObj.date;
        this.endDate = '';
        this.dateRangeText.set('');
        this.selectingStartDate.set(false);
      } else {
        if (dayObj.date < this.startDate) {
          this.endDate = this.startDate;
          this.startDate = dayObj.date;
        } else {
          this.endDate = dayObj.date;
        }
        
        // Add the new range to the array
        const newRange: DateRange = {
          startDate: this.startDate,
          endDate: this.endDate,
          rangeText: this.formatDateDisplay(this.startDate) + ' – ' + this.formatDateDisplay(this.endDate)
        };
        
        const currentRanges = [...this.selectedRanges()];
        currentRanges.push(newRange);
        this.selectedRanges.set(currentRanges);
        
        // Reset for next range selection
        this.startDate = '';
        this.endDate = '';
        this.selectingStartDate.set(true);
        
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
      // Single range mode (original behavior)
      if (this.requireApply) {
        // Apply mode: use pending dates, don't emit until Apply is clicked
        if (this.selectingStartDate()) {
          this.pendingStartDate = dayObj.date;
          this.pendingEndDate = '';
          this.selectingStartDate.set(false);
          this.hasPendingChanges.set(true);
        } else {
          if (dayObj.date < this.pendingStartDate) {
            this.pendingEndDate = this.pendingStartDate;
            this.pendingStartDate = dayObj.date;
          } else {
            this.pendingEndDate = dayObj.date;
          }
          this.selectingStartDate.set(true);
          this.hasPendingChanges.set(true);
        }
        this.generateCalendars();
      } else {
        // Immediate mode: emit changes immediately
        if (this.selectingStartDate()) {
          this.startDate = dayObj.date;
          this.endDate = '';
          this.dateRangeText.set('');
          this.selectingStartDate.set(false);
          this.emitChange();
        } else {
          if (dayObj.date < this.startDate) {
            this.endDate = this.startDate;
            this.startDate = dayObj.date;
          } else {
            this.endDate = dayObj.date;
          }
          this.updateDateRangeText();
          if (this.closeOnSelection) {
            this.showDatePicker.set(false);
          }
          this.selectingStartDate.set(true);
          this.emitChange();
          this.emitSelection();
        }
        this.generateCalendars();
      }
    }
  }

  applySelection(): void {
    if (!this.hasPendingChanges()) return;
    
    // Apply pending dates
    this.startDate = this.pendingStartDate;
    this.endDate = this.pendingEndDate;
    this.updateDateRangeText();
    
    // Clear pending state
    this.pendingStartDate = '';
    this.pendingEndDate = '';
    this.hasPendingChanges.set(false);
    
    // Emit changes
    this.emitChange();
    this.emitSelection();
    
    // Close picker
    this.showDatePicker.set(false);
    this.selectingStartDate.set(true);
  }

  cancelSelection(): void {
    // Discard pending changes
    this.pendingStartDate = '';
    this.pendingEndDate = '';
    this.hasPendingChanges.set(false);
    this.selectingStartDate.set(true);
    
    // Regenerate calendars to clear pending visual state
    this.generateCalendars();
  }

  changeMonth(direction: number): void {
    const currentMonthValue = this.currentMonth();
    const year = this.dateAdapter.getYear(currentMonthValue);
    const month = this.dateAdapter.getMonth(currentMonthValue);
    const newCurrentMonth = this.dateAdapter.createDate(year, month + direction, 1);
    this.currentMonth.set(newCurrentMonth);
    
    const newYear = this.dateAdapter.getYear(newCurrentMonth);
    const newMonth = this.dateAdapter.getMonth(newCurrentMonth);
    const newPreviousMonth = this.dateAdapter.createDate(newYear, newMonth - 1, 1);
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
    this.startDate = range.start;
    this.endDate = range.end;
    this.updateDateRangeText();
    this.generateCalendars();
    if (this.closeOnPresetSelection) {
      this.showDatePicker.set(false);
    }
    this.emitSelection();
  }

  clear(): void {
    this.startDate = '';
    this.endDate = '';
    this.dateRangeText.set('');
    this.showDatePicker.set(false);
    this.selectingStartDate.set(true);
    
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
    if (count === 0) {
      this.dateRangeText.set('');
    } else if (count === 1) {
      this.dateRangeText.set('1 range selected');
    } else {
      this.dateRangeText.set(`${count} ranges selected`);
    }
  }

  private emitChange(): void {
    this.dateRangeChange.emit({
      startDate: this.startDate,
      endDate: this.endDate,
      rangeText: this.dateRangeText()
    });
  }

  private emitSelection(): void {
    this.dateRangeSelected.emit({
      startDate: this.startDate,
      endDate: this.endDate,
      rangeText: this.dateRangeText()
    });
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
    return {
      startDate: this.startDate,
      endDate: this.endDate,
      rangeText: this.dateRangeText()
    };
  }

  // ControlValueAccessor implementation
  writeValue(value: DateRange | null): void {
    if (value) {
      this.startDate = value.startDate || '';
      this.endDate = value.endDate || '';
      if (this.startDate && this.endDate) {
        this.updateDateRangeText();
        this.generateCalendars();
      }
    } else {
      this.startDate = '';
      this.endDate = '';
      this.dateRangeText.set('');
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
