# ng-dual-datepicker

A lightweight, zero-dependency date range picker for Angular 17+. Built with standalone components, Reactive Forms, and Angular Signals. No Angular Material required.

[![npm version](https://img.shields.io/npm/v/@oneluiz/dual-datepicker)](https://www.npmjs.com/package/@oneluiz/dual-datepicker)
![license](https://img.shields.io/npm/l/@oneluiz/dual-datepicker)
![Angular](https://img.shields.io/badge/Angular-17%2B-red)

```bash
npm install @oneluiz/dual-datepicker
```

> ## ⚠️ **BREAKING CHANGES in v3.0.0**
>
> - **All DateRange properties renamed to English**: `fechaInicio` → `startDate`, `fechaFin` → `endDate`, `rangoTexto` → `rangeText`
> - **Deprecated `daysAgo` removed**: Use `getValue: () => PresetRange` pattern or `CommonPresets` instead
> - **All component methods renamed to English**: `limpiar()` → `clear()`, etc.
> 
> **📖 See [MIGRATION_V3.md](MIGRATION_V3.md) for complete migration guide**
>
> To stay on v2.x: `npm install @oneluiz/dual-datepicker@2.7.0`

## 🎯 [Live Demo](https://oneluiz.github.io/ng-dual-datepicker/)

**[Check out the interactive examples →](https://oneluiz.github.io/ng-dual-datepicker/)**

## Why ng-dual-datepicker?

| Feature | ng-dual-datepicker | Angular Material DateRangePicker |
|---------|-------------------|----------------------------------|
| **Bundle Size** | ~60 KB gzipped | ~300+ KB (with dependencies) |
| **Dependencies** | Zero | Requires @angular/material, @angular/cdk |
| **Standalone** | ✅ Native | ⚠️ Requires module setup |
| **Signals Support** | ✅ Built-in | ❌ Not yet |
| **Multi-Range Support** | ✅ NEW v2.7.0 | ❌ Not available |
| **Customization** | Full styling control | Theme-constrained |
| **Learning Curve** | Minimal | Requires Material knowledge |
| **Change Detection** | OnPush optimized | Default |
| **Setup Time** | < 1 minute | ~10+ minutes (theming, modules) |

## ✨ Key Features

- 🪶 **Zero Dependencies** – No external libraries required
- 🎯 **Standalone Component** – No NgModule imports needed
- ⚡ **Angular Signals** – Modern reactive state management
- 🔄 **Reactive Forms** – Full ControlValueAccessor implementation
- 🔥 **Multi-Range Support** – Select multiple date ranges (NEW v2.7.0 - Material CAN'T do this!)
- 🎨 **Fully Customizable** – Every color, padding, border configurable
- 📦 **Lightweight** – ~60 KB gzipped total bundle
- 🚀 **Performance** – OnPush change detection + trackBy optimization
- ♿ **Accessible** – ARIA labels, semantic HTML, full keyboard navigation
- 🌍 **i18n Ready** – Customizable month/day names
- 📱 **Responsive** – Works on desktop and mobile

## 🤔 When Should I Use This?

**Use ng-dual-datepicker if you:**
- Don't want to install Angular Material just for a date picker
- Need precise control over styling and behavior
- Want minimal bundle size impact
- Prefer standalone components over NgModules
- Need Angular Signals support now
- Are building a custom design system

**Use Angular Material DateRangePicker if you:**
- Already use Angular Material throughout your app
- Need Material Design compliance
- Want a battle-tested enterprise solution with extensive ecosystem support

## ⚡ Performance

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ Optimized
  standalone: true                                   // ✅ No module overhead
})
```

- **OnPush change detection** – Minimal re-renders
- **trackBy functions** – Efficient list rendering
- **No external CSS** – No runtime stylesheet downloads
- **Tree-shakeable** – Only import what you use

## ♿ Accessibility (A11y)

**✅ WCAG 2.1 Level AA Compliant**

- ✅ **Full keyboard navigation** – Complete keyboard control (v3.1.0)
- ✅ **Screen reader support** – ARIA labels included for all interactive elements
- ✅ **Semantic HTML** – Proper HTML structure with `role` attributes
- ✅ **Focus management** – Intelligent focus tracking and visual indicators

### ⌨️ Keyboard Navigation (NEW in v3.1.0)

Navigate the datepicker entirely with your keyboard:

| Key(s) | Action |
|--------|--------|
| **Arrow Keys** | |
| `←` / `→` | Navigate between days (horizontal) |
| `↑` / `↓` | Navigate by weeks (vertical) |
| **Selection** | |
| `Enter` / `Space` | Select focused day |
| `Escape` | Close datepicker |
| **Navigation Shortcuts** | |
| `Home` | Jump to first day of visible range |
| `End` | Jump to last day of visible range |
| `PageUp` / `PageDown` | Navigate months |
| `Shift + PageUp` / `Shift + PageDown` | Navigate years |
| `Tab` | Navigate between input, presets, and calendar |

**Visual Indicators:**
- Blue outline ring indicates focused day
- Light blue background on keyboard-focused days
- Automatic focus management when opening/closing picker

**Screen Reader Support:**
- `role="combobox"` on input field
- `aria-expanded`, `aria-haspopup` states
- `aria-label`, `aria-selected`, `aria-current` on calendar days

## 📦 Installation

```bash
npm install @oneluiz/dual-datepicker
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { Component } from '@angular/core';
import { DualDatepickerComponent, DateRange } from '@oneluiz/dual-datepicker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DualDatepickerComponent],
  template: `
    <ngx-dual-datepicker
      (dateRangeChange)="onRangeChange($event)">
    </ngx-dual-datepicker>
  `
})
export class AppComponent {
  onRangeChange(range: DateRange) {
    console.log('Start:', range.startDate);
    console.log('End:', range.endDate);
  }
}
```

### With Reactive Forms

```typescript
import { FormControl } from '@angular/forms';
import { DateRange } from '@oneluiz/dual-datepicker';

dateRange = new FormControl<DateRange | null>(null);
```

```html
<ngx-dual-datepicker [formControl]="dateRange"></ngx-dual-datepicker>
```

### With Angular Signals

```typescript
import { signal } from '@angular/core';

dateRange = signal<DateRange | null>(null);
```

```html
<ngx-dual-datepicker
  [(ngModel)]="dateRange()"
  (dateRangeChange)="dateRange.set($event)">
</ngx-dual-datepicker>
```

### Custom Styling

```html
<ngx-dual-datepicker
  inputBackgroundColor="#1a1a2e"
  inputTextColor="#eee"
  inputBorderColor="#4a5568"
  inputBorderColorFocus="#3182ce">
</ngx-dual-datepicker>
```

## 📚 Advanced Usage

### 4. Use with Angular Signals ⚡ New!

The component now uses Angular Signals internally for better performance and reactivity:

```typescript
import { Component, signal, computed } from '@angular/core';
import { DualDatepickerComponent, DateRange } from '@oneluiz/dual-datepicker';

@Component({
  selector: 'app-signals-example',
  standalone: true,
  imports: [DualDatepickerComponent],
  template: `
    <ngx-dual-datepicker
      [startDate]="startDate()"
      [endDate]="endDate()"
      (dateRangeChange)="onDateChange($event)">
    </ngx-dual-datepicker>
    
    @if (isRangeSelected()) {
      <div>
        <p>{{ rangeText() }}</p>
        <p>Days selected: {{ daysDifference() }}</p>
      </div>
    }
  `
})
export class SignalsExampleComponent {
  startDate = signal('');
  endDate = signal('');
  
  // Computed values
  isRangeSelected = computed(() => 
    this.startDate() !== '' && this.endDate() !== ''
  );
  
  rangeText = computed(() => 
    this.isRangeSelected() 
      ? `${this.startDate()} to ${this.endDate()}`
      : 'No range selected'
  );
  
  daysDifference = computed(() => {
    if (!this.isRangeSelected()) return 0;
    const start = new Date(this.startDate());
    const end = new Date(this.endDate());
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  });

  onDateChange(range: DateRange) {
    this.startDate.set(range.startDate);
    this.endDate.set(range.endDate);
  }
}
```

### 5. Multi-Range Support 🔥 NEW v2.7.0!

**Material CAN'T do this!** Select multiple date ranges in a single picker - perfect for booking systems, blackout periods, and complex scheduling.

```typescript
import { Component } from '@angular/core';
import { DualDatepickerComponent, MultiDateRange } from '@oneluiz/dual-datepicker';

@Component({
  selector: 'app-multi-range',
  standalone: true,
  imports: [DualDatepickerComponent],
  template: `
    <ngx-dual-datepicker
      [multiRange]="true"
      [showClearButton]="true"
      (multiDateRangeChange)="onMultiRangeChange($event)">
    </ngx-dual-datepicker>

    @if (selectedRanges && selectedRanges.ranges.length > 0) {
      <div class="selected-ranges">
        <h3>Selected Ranges ({{ selectedRanges.ranges.length }})</h3>
        @for (range of selectedRanges.ranges; track $index) {
          <div class="range-item">
            <strong>Range {{ $index + 1 }}:</strong> {{ range.rangeText }}
            <br />
            <span>{{ range.startDate }} → {{ range.endDate }}</span>
          </div>
        }
      </div>
    }
  `
})
export class MultiRangeExample {
  selectedRanges: MultiDateRange | null = null;

  onMultiRangeChange(ranges: MultiDateRange) {
    this.selectedRanges = ranges;
    console.log('Selected ranges:', ranges.ranges);
    // Output example:
    // [
    //   { startDate: '2026-01-01', endDate: '2026-01-05', rangeText: 'Jan 1 – Jan 5' },
    //   { startDate: '2026-01-10', endDate: '2026-01-15', rangeText: 'Jan 10 – Jan 15' },
    //   { startDate: '2026-02-01', endDate: '2026-02-07', rangeText: 'Feb 1 – Feb 7' }
    // ]
  }
}
```

#### Perfect Use Cases

- 🏨 **Hotel Booking Systems** - Block multiple periods for reservations
- 📅 **Event Blackout Periods** - Mark multiple dates as unavailable
- 🔧 **Maintenance Windows** - Schedule multiple maintenance periods
- 📊 **Availability Calendars** - Show multiple available/unavailable periods
- 👷 **Shift Scheduling** - Select multiple work periods
- 💼 **Business Meetings** - Block out multiple date ranges

#### Key Features

- ✅ Select unlimited date ranges
- ✅ Visual feedback - all ranges highlighted in calendar
- ✅ Easy management - add/remove ranges with one click
- ✅ Separate events for multi-range (`multiDateRangeChange`, `multiDateRangeSelected`)
- ✅ Clear all ranges with one button
- ❌ **Angular Material CANNOT do this!**

## 🔌 Date Adapter System

The library supports custom date adapters, allowing you to use different date libraries (DayJS, date-fns, Luxon) or custom backend models instead of native JavaScript `Date` objects.

### Using Native Date (Default)

By default, the component uses `NativeDateAdapter` which works with JavaScript `Date` objects:

```typescript
import { DualDatepickerComponent } from '@oneluiz/dual-datepicker';

@Component({
  standalone: true,
  imports: [DualDatepickerComponent],
  template: `<ngx-dual-datepicker></ngx-dual-datepicker>`
})
export class AppComponent {}
```

### Creating a Custom Adapter

Example using **date-fns**:

```typescript
import { Injectable } from '@angular/core';
import { DateAdapter } from '@oneluiz/dual-datepicker';
import { 
  parse, format, addDays, addMonths, 
  getYear, getMonth, getDate, getDay,
  isSameDay, isBefore, isAfter, isWithinInterval,
  isValid 
} from 'date-fns';

@Injectable()
export class DateFnsAdapter extends DateAdapter<Date> {
  parse(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    
    const parsed = parse(value, 'yyyy-MM-dd', new Date());
    return isValid(parsed) ? parsed : null;
  }

  format(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
    return format(date, formatStr);
  }

  addDays(date: Date, days: number): Date {
    return addDays(date, days);
  }

  addMonths(date: Date, months: number): Date {
    return addMonths(date, months);
  }

  getYear(date: Date): number {
    return getYear(date);
  }

  getMonth(date: Date): number {
    return getMonth(date);
  }

  getDate(date: Date): number {
    return getDate(date);
  }

  getDay(date: Date): number {
    return getDay(date);
  }

  createDate(year: number, month: number, day: number): Date {
    return new Date(year, month, day);
  }

  today(): Date {
    return new Date();
  }

  isSameDay(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    return isSameDay(a, b);
  }

  isBefore(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    return isBefore(a, b);
  }

  isAfter(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    return isAfter(a, b);
  }

  isBetween(date: Date | null, start: Date | null, end: Date | null): boolean {
    if (!date || !start || !end) return false;
    return isWithinInterval(date, { start, end });
  }

  clone(date: Date): Date {
    return new Date(date);
  }

  isValid(date: any): boolean {
    return isValid(date);
  }
}
```

### Providing Custom Adapter

```typescript
import { Component } from '@angular/core';
import { DualDatepickerComponent, DATE_ADAPTER } from '@oneluiz/dual-datepicker';
import { DateFnsAdapter } from './date-fns-adapter';

@Component({
  standalone: true,
  imports: [DualDatepickerComponent],
  providers: [
    { provide: DATE_ADAPTER, useClass: DateFnsAdapter }
  ],
  template: `<ngx-dual-datepicker></ngx-dual-datepicker>`
})
export class AppComponent {}
```

### Example: DayJS Adapter

```typescript
import { Injectable } from '@angular/core';
import { DateAdapter } from '@oneluiz/dual-datepicker';
import dayjs, { Dayjs } from 'dayjs';

@Injectable()
export class DayJSAdapter extends DateAdapter<Dayjs> {
  parse(value: any): Dayjs | null {
    if (!value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  }

  format(date: Dayjs, format: string = 'YYYY-MM-DD'): string {
    return date.format(format);
  }

  addDays(date: Dayjs, days: number): Dayjs {
    return date.add(days, 'day');
  }

  addMonths(date: Dayjs, months: number): Dayjs {
    return date.add(months, 'month');
  }

  getYear(date: Dayjs): number {
    return date.year();
  }

  getMonth(date: Dayjs): number {
    return date.month();
  }

  getDate(date: Dayjs): number {
    return date.date();
  }

  getDay(date: Dayjs): number {
    return date.day();
  }

  createDate(year: number, month: number, day: number): Dayjs {
    return dayjs().year(year).month(month).date(day);
  }

  today(): Dayjs {
    return dayjs();
  }

  isSameDay(a: Dayjs | null, b: Dayjs | null): boolean {
    if (!a || !b) return false;
    return a.isSame(b, 'day');
  }

  isBefore(a: Dayjs | null, b: Dayjs | null): boolean {
    if (!a || !b) return false;
    return a.isBefore(b);
  }

  isAfter(a: Dayjs | null, b: Dayjs | null): boolean {
    if (!a || !b) return false;
    return a.isAfter(b);
  }

  isBetween(date: Dayjs | null, start: Dayjs | null, end: Dayjs | null): boolean {
    if (!date || !start || !end) return false;
    return date.isAfter(start) && date.isBefore(end) || date.isSame(start) || date.isSame(end);
  }

  clone(date: Dayjs): Dayjs {
    return date.clone();
  }

  isValid(date: any): boolean {
    return dayjs.isDayjs(date) && date.isValid();
  }
}
```

### Benefits of Date Adapters

- ✅ **Zero vendor lock-in** - Use any date library you prefer
- ✅ **Consistency** - Use the same date library across your entire app
- ✅ **Custom backend models** - Adapt to your API's date format
- ✅ **Type safety** - Full TypeScript support with generics

## 🎨 Customization

### Custom Colors (Bootstrap Style)

```typescript
<ngx-dual-datepicker
  [(ngModel)]="dateRange"
  inputBackgroundColor="#ffffff"
  inputTextColor="#495057"
  inputBorderColor="#ced4da"
  inputBorderColorHover="#80bdff"
  inputBorderColorFocus="#80bdff"
  inputPadding="0.375rem 0.75rem">
</ngx-dual-datepicker>
```

### Custom Colors (GitHub Style)

```typescript
<ngx-dual-datepicker
  [(ngModel)]="dateRange"
  inputBackgroundColor="#f3f4f6"
  inputTextColor="#24292e"
  inputBorderColor="transparent"
  inputBorderColorHover="#d1d5db"
  inputBorderColorFocus="#80bdff"
  inputPadding="6px 10px">
</ngx-dual-datepicker>
```

### ⚡ Custom Presets (Power Feature)

**This is where our library shines!** Unlike Angular Material, we offer an incredibly flexible preset system perfect for dashboards, reporting, POS, BI apps, and ERP systems.

#### Simple Pattern (Backward Compatible)

```typescript
customPresets: PresetConfig[] = [
  { label: 'Last 15 days', daysAgo: 15 },
  { label: 'Last 3 months', daysAgo: 90 },
  { label: 'Last 6 months', daysAgo: 180 },
  { label: 'Last year', daysAgo: 365 }
];
```

#### **NEW v2.6.0** - Flexible Pattern with `getValue()` 🔥

The real power comes with the `getValue()` pattern. Define **any custom logic** you need:

```typescript
import { PresetConfig } from '@oneluiz/dual-datepicker';

customPresets: PresetConfig[] = [
  { 
    label: 'Today', 
    getValue: () => {
      const today = new Date();
      return {
        start: formatDate(today),
        end: formatDate(today)
      };
    }
  },
  { 
    label: 'This Month', 
    getValue: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        start: formatDate(start),
        end: formatDate(end)
      };
    }
  },
  { 
    label: 'Last Month', 
    getValue: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        start: formatDate(start),
        end: formatDate(end)
      };
    }
  },
  { 
    label: 'Quarter to Date', 
    getValue: () => {
      const today = new Date();
      const currentMonth = today.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      const start = new Date(today.getFullYear(), quarterStartMonth, 1);
      return {
        start: formatDate(start),
        end: formatDate(today)
      };
    }
  }
];
```

#### **Even Better** - Use Pre-built Utilities 🚀

We provide **ready-to-use preset utilities** for common scenarios:

```typescript
import { CommonPresets } from '@oneluiz/dual-datepicker';

// Dashboard presets
presets = CommonPresets.dashboard;
// → Today, Yesterday, Last 7 days, Last 30 days, This month, Last month

// Reporting presets
presets = CommonPresets.reporting;
// → Today, This week, Last week, This month, Last month, This quarter, Last quarter

// Financial/ERP presets
presets = CommonPresets.financial;
// → Month to date, Quarter to date, Year to date, Last month, Last quarter, Last year

// Analytics/BI presets
presets = CommonPresets.analytics;
// → Last 7/14/30/60/90/180/365 days

// Simple presets
presets = CommonPresets.simple;
// → Today, Last 7 days, Last 30 days, This year
```

#### Create Your Own Utilities

Import individual utilities and mix them:

```typescript
import { 
  getToday, 
  getThisMonth, 
  getLastMonth, 
  getQuarterToDate,
  getYearToDate,
  PresetConfig 
} from '@oneluiz/dual-datepicker';

customPresets: PresetConfig[] = [
  { label: 'Today', getValue: getToday },
  { label: 'This Month', getValue: getThisMonth },
  { label: 'Last Month', getValue: getLastMonth },
  { label: 'Quarter to Date', getValue: getQuarterToDate },
  { label: 'Year to Date', getValue: getYearToDate },
  { 
    label: 'Custom Logic', 
    getValue: () => {
      // Your custom date calculation
      return { start: '2026-01-01', end: '2026-12-31' };
    }
  }
];
```

#### Why This Is Powerful

✅ **Perfect for Dashboards** - "Last 7 days", "Month to date", "Quarter to date"  
✅ **Perfect for Reporting** - "This week", "Last week", "This quarter"  
✅ **Perfect for Financial Systems** - "Quarter to date", "Year to date", "Fiscal year"  
✅ **Perfect for Analytics** - Consistent date ranges for BI tools  
✅ **Perfect for ERP** - Custom business logic and fiscal calendars  

**Angular Material doesn't offer this level of flexibility!** 🎯

```html
<ngx-dual-datepicker
  [(ngModel)]="dateRange"
  [presets]="customPresets">
</ngx-dual-datepicker>
```

## 📖 API Reference

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `ngModel` | `DateRange` | `{ start: null, end: null }` | Two-way binding for selected date range |
| `placeholder` | `string` | `'Select date range'` | Input placeholder text |
| `presets` | `PresetConfig[]` | Default presets | Array of preset configurations |
| `showPresets` | `boolean` | `true` | Show/hide the presets sidebar |
| `showClearButton` | `boolean` | `false` | Show/hide the Clear button in dropdown |
| `closeOnSelection` | `boolean` | `false` | Close picker when both dates selected |
| `closeOnPresetSelection` | `boolean` | `false` | Close picker when preset is clicked |
| `closeOnClickOutside` | `boolean` | `true` | Close picker when clicking outside |
| `inputBackgroundColor` | `string` | `'#fff'` | Input background color |
| `inputTextColor` | `string` | `'#495057'` | Input text color |
| `inputBorderColor` | `string` | `'#ced4da'` | Input border color |
| `inputBorderColorHover` | `string` | `'#9ca3af'` | Input border color on hover |
| `inputBorderColorFocus` | `string` | `'#80bdff'` | Input border color on focus |
| `inputPadding` | `string` | `'0.375rem 0.75rem'` | Input padding |
| `locale` | `LocaleConfig` | English defaults | Custom month/day names for i18n |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `ngModelChange` | `EventEmitter<DateRange>` | Emitted when date range changes |

### Public Methods

You can call these methods programmatically using a template reference or ViewChild:

```typescript
import { Component, ViewChild } from '@angular/core';
import { DualDatepickerComponent } from '@oneluiz/dual-datepicker';

@Component({
  template: `
    <div style="display: flex; gap: 10px;">
      <ngx-dual-datepicker #datepicker></ngx-dual-datepicker>
      <button (click)="clearSelection()">Clear</button>
    </div>
  `
})
export class MyComponent {
  @ViewChild('datepicker') datepicker!: DualDatepickerComponent;

  clearSelection() {
    this.datepicker.clear(); // v3.0.0: method renamed from limpiar() to clear()
  }
}
```

| Method | Description |
|--------|----------|
| `clear()` | Clears the current date selection and resets the component (v3.0.0: renamed from `limpiar()`) |

### Types

```typescript
interface DateRange {
  startDate: string;   // v3.0.0: renamed from 'fechaInicio' - ISO format: 'YYYY-MM-DD'
  endDate: string;     // v3.0.0: renamed from 'fechaFin' - ISO format: 'YYYY-MM-DD'
  rangeText: string;   // v3.0.0: renamed from 'rangoTexto' - Display text: 'DD Mon - DD Mon'
}

interface PresetRange {
  start: string;  // ISO date format: 'YYYY-MM-DD'
  end: string;    // ISO date format: 'YYYY-MM-DD'
}

interface PresetConfig {
  label: string;
  getValue: () => PresetRange;  // v3.0.0: NOW REQUIRED (daysAgo removed)
}

interface LocaleConfig {
  monthNames?: string[];         // Full month names (12 items)
  monthNamesShort?: string[];    // Short month names (12 items)
  dayNames?: string[];           // Full day names (7 items, starting Sunday)
  dayNamesShort?: string[];      // Short day names (7 items, starting Sunday)
  firstDayOfWeek?: number;       // 0 = Sunday, 1 = Monday, etc. (not yet implemented)
}
```

### CommonPresets

v3.0.0: No default presets shipped with component. Use `CommonPresets` utility or create custom:

```typescript
import { CommonPresets, getLastNDays } from '@oneluiz/dual-datepicker';

// Use pre-built collections
presets = CommonPresets.dashboard;  // Last 7, 15, 30, 60, 90 days + last 6 months

// Or create custom presets
presets: PresetConfig[] = [
  { label: 'Last 15 days', getValue: () => getLastNDays(15) },
  { label: 'Last 3 months', getValue: () => getLastNDays(90) },
  { label: 'Last 6 months', getValue: () => getLastNDays(180) },
  { label: 'Last year', getValue: () => getLastNDays(365) }
];
```

Available `CommonPresets` collections:
- `CommonPresets.simple` - Last 7, 30, 60, 90 days
- `CommonPresets.dashboard` - Last 7, 15, 30, 60, 90 days + last 6 months
- `CommonPresets.analytics` - Last 30, 60, 90, 180, 365 days + YTD

Helper functions:
- `getLastNDays(n)` - Returns range for last N days
- `getThisMonth()` - Returns range for current month
- `getLastMonth()` - Returns range for previous month
- `getYearToDate()` - Returns range from Jan 1 to today

## Usage Examples

### Minimal Usage

```html
<ngx-dual-datepicker [(ngModel)]="dateRange"></ngx-dual-datepicker>
```

### With Initial Dates

```html
<ngx-dual-datepicker
  [startDate]="'2024-01-15'"
  [endDate]="'2024-01-30'"
  (dateRangeSelected)="onDateRangeSelected($event)">
</ngx-dual-datepicker>
```

### With Events

```typescript
@Component({
  selector: 'app-example',
  template: `
    <ngx-dual-datepicker
      [startDate]="startDate"
      [endDate]="endDate"
      (dateRangeSelected)="onDateRangeSelected($event)"
      (dateRangeChange)="onDateRangeChange($event)">
    </ngx-dual-datepicker>
    
    <div *ngIf="selectedRange">
      Selected: {{ selectedRange.rangeText }}
    </div>
  `
})
export class ExampleComponent {
  startDate: string = '';
  endDate: string = '';
  selectedRange: DateRange | null = null;

  onDateRangeChange(range: DateRange) {
    console.log('Date changed:', range.startDate);
    // Emitted when user selects first date (before completing range)
  }

  onDateRangeSelected(range: DateRange) {
    console.log('Range selected:', range);
    this.selectedRange = range;
    
    // Both dates selected - do something
    this.fetchData(range.startDate, range.endDate);
  }

  fetchData(startDate: string, endDate: string) {
    // Your API call here
    // Dates are in 'YYYY-MM-DD' format
  }
}
```

### With ngModel

```typescript
@Component({
  selector: 'app-example',
  template: `
    <ngx-dual-datepicker
      [(ngModel)]="dateRange"
      (ngModelChange)="onDateRangeChange($event)">
    </ngx-dual-datepicker>
    
    <div *ngIf="dateRange">
      Selected: {{ dateRange.rangeText }}
      <br>
      From: {{ dateRange.startDate }} to {{ dateRange.endDate }}
    </div>
  `
})
export class ExampleComponent {
  dateRange: DateRange | null = null;

  onDateRangeChange(range: DateRange) {
    console.log('Start:', range.startDate);
    console.log('End:', range.endDate);
    console.log('Text:', range.rangeText);
  }
}
```

### With Styling

```html
<ngx-dual-datepicker
  [startDate]="startDate"
  [endDate]="endDate"
  placeholder="Pick your dates"
  inputBackgroundColor="#fef3c7"
  inputTextColor="#92400e"
  inputBorderColor="#fbbf24"
  inputBorderColorHover="#f59e0b"
  inputBorderColorFocus="#d97706"
  inputPadding="12px 16px"
  (dateRangeSelected)="onDateRangeSelected($event)">
</ngx-dual-datepicker>
```

## 🛠️ Requirements

- Angular 17.0.0 or higher

## 🗺️ Roadmap

Recently shipped:

**v2.6.0:**
- ✅ **Flexible Preset System** - `getValue()` pattern for custom date logic (This month, Last month, Quarter to date, etc.)
- ✅ **Pre-built Preset Utilities** - CommonPresets for Dashboard, Reporting, Financial, Analytics
- ✅ **Real Differentiator** - Perfect for ERP, BI, POS, and Reporting systems

**v2.5.0:**
- ✅ **Date Adapter System** - Support for DayJS, date-fns, Luxon, and custom date libraries

Planned features and improvements:

- ⬜ **Complete keyboard navigation** - Arrow keys, Enter/Space, Tab, Escape
- ⬜ **Full accessibility audit** - WCAG 2.1 AA compliance
- ⬜ **Multi-range support** - Select multiple date ranges
- ⬜ **Theming system** - Pre-built theme presets

## 📄 License

MIT © Luis Cortes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/oneluiz/ng-dual-datepicker/issues).

## ⭐ Support

If you find this package useful, please give it a star on [GitHub](https://github.com/oneluiz/ng-dual-datepicker)!

---

Made with ❤️ by [Luis Cortes](https://github.com/oneluiz)
