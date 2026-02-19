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
  @Input() presets: PresetConfig[] = [];
  @Input() inputBackgroundColor: string = '#fff';
  @Input() inputTextColor: string = '#495057';
  @Input() inputBorderColor: string = '#ced4da';
  @Input() inputBorderColorHover: string = '#ced4da';
  @Input() inputBorderColorFocus: string = '#80bdff';
  @Input() inputPadding: string = '0.375rem 0.75rem';
  @Input() locale: LocaleConfig = {};

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
  
  // Multi-range support
  selectedRanges = signal<DateRange[]>([]);
  currentRangeIndex = signal<number>(-1);

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
    const monthNames = this.locale.monthNamesShort || this.defaultMonthNamesShort;
    return `${this.dateAdapter.getDate(date)} ${monthNames[this.dateAdapter.getMonth(date)]}`;
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
    }
    this.onTouched();
  }

  closeDatePicker(): void {
    this.showDatePicker.set(false);
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
      monthDays.push({
        day: day,
        date: dateStr,
        isCurrentMonth: true,
        isStart: this.startDate === dateStr,
        isEnd: this.endDate === dateStr,
        inRange: this.isInRange(dateStr)
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

  selectDay(dayObj: any): void {
    if (!dayObj.isCurrentMonth || this.isDisabled()) return;

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
