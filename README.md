# ng-dual-datepicker

A lightweight, zero-dependency date range picker for Angular 17+. Built with standalone components, Reactive Forms, and Angular Signals. No Angular Material required.

[![npm version](https://img.shields.io/npm/v/@oneluiz/dual-datepicker)](https://www.npmjs.com/package/@oneluiz/dual-datepicker)
[![npm provenance](https://img.shields.io/badge/provenance-available-brightgreen)](https://www.npmjs.com/package/@oneluiz/dual-datepicker)
![license](https://img.shields.io/npm/l/@oneluiz/dual-datepicker)
![Angular](https://img.shields.io/badge/Angular-17%2B-red)

```bash
npm install @oneluiz/dual-datepicker
```

## 🎯 [Live Demo](https://oneluiz.github.io/ng-dual-datepicker/)

**[Check out the interactive examples →](https://oneluiz.github.io/ng-dual-datepicker/)**

---

## 📋 Table of Contents

- [Features](#-features)
- [Why Choose This Library?](#-why-choose-this-library)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
  - [Basic Usage](#basic-usage)
  - [Reactive Forms](#with-reactive-forms)
  - [Angular Signals](#with-angular-signals)
- [Advanced Features](#-advanced-features)
  - [Multi-Range Selection](#multi-range-support)
  - [Disabled Dates](#disabled-dates)
  - [Display Format](#display-format)
  - [Custom Presets](#custom-presets)
  - [Date Adapter System](#date-adapter-system)
  - [Keyboard Navigation](#keyboard-navigation)
- [Customization](#-customization)
  - [Styling Options](#styling-options)
  - [Localization (i18n)](#localization-i18n)
- [API Reference](#-api-reference)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
  - [Methods](#public-methods)
  - [Types](#types)
- [Examples](#-usage-examples)
- [Accessibility](#-accessibility)
- [Requirements](#-requirements)
- [License & Support](#-license--support)

---

## ✨ Features

- 🪶 **Zero Dependencies** – No external libraries required
- 🎯 **Standalone Component** – No NgModule imports needed
- ⚡ **Angular Signals** – Modern reactive state management
- 🔄 **Reactive Forms** – Full ControlValueAccessor implementation
- 🔥 **Multi-Range Support** – Select multiple date ranges (Material CAN'T do this!)
- 🚫 **Disabled Dates** – Block weekends, holidays, or custom logic
- 🎨 **Display Format** – Customize date display (DD/MM/YYYY, MM/DD/YYYY, etc.)
- 🎨 **Fully Customizable** – Every color, padding, border configurable
- 📦 **Lightweight** – ~60 KB gzipped total bundle
- 🚀 **Performance** – OnPush change detection + trackBy optimization
- ♿ **Accessible** – Full keyboard navigation, ARIA labels, WCAG 2.1 AA compliant
- 🌍 **i18n Ready** – Customizable month/day names
- 📱 **Responsive** – Works on desktop and mobile
- 🔌 **Date Adapters** – Use DayJS, date-fns, Luxon, or custom libraries

---

## 🤔 Why Choose This Library?

| Feature | ng-dual-datepicker | Angular Material DateRangePicker |
|---------|-------------------|----------------------------------|
| **Bundle Size** | ~60 KB gzipped | ~300+ KB (with dependencies) |
| **Dependencies** | Zero | Requires @angular/material, @angular/cdk |
| **Standalone** | ✅ Native | ⚠️ Requires module setup |
| **Signals Support** | ✅ Built-in | ❌ Not yet |
| **Multi-Range Support** | ✅ Yes | ❌ Not available |
| **Customization** | Full styling control | Theme-constrained |
| **Learning Curve** | Minimal | Requires Material knowledge |
| **Change Detection** | OnPush optimized | Default |
| **Setup Time** | < 1 minute | ~10+ minutes (theming, modules) |

### When to Use This

**✅ Use ng-dual-datepicker if you:**
- Don't want to install Angular Material just for a date picker
- Need precise control over styling and behavior
- Want minimal bundle size impact
- Prefer standalone components
- Need Angular Signals support now
- Need multi-range selection
- Are building a custom design system

**⚠️ Use Angular Material DateRangePicker if you:**
- Already use Angular Material throughout your app
- Need Material Design compliance
- Want a battle-tested enterprise solution with extensive ecosystem

---

## 📦 Installation

```bash
npm install @oneluiz/dual-datepicker
```

**Requirements:** Angular 17.0.0 or higher

---

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

---

## 🎯 Advanced Features

### Multi-Range Support

**🔥 Material CAN'T do this!** Select multiple date ranges in a single picker - perfect for booking systems, blackout periods, and complex scheduling.

```typescript
import { Component } from '@angular/core';
import { MultiDateRange } from '@oneluiz/dual-datepicker';

@Component({
  template: `
    <ngx-dual-datepicker
      [multiRange]="true"
      (multiDateRangeChange)="onMultiRangeChange($event)">
    </ngx-dual-datepicker>

    @if (selectedRanges && selectedRanges.ranges.length > 0) {
      <div class="selected-ranges">
        <h3>Selected Ranges ({{ selectedRanges.ranges.length }})</h3>
        @for (range of selectedRanges.ranges; track $index) {
          <div class="range-item">
            {{ range.startDate }} → {{ range.endDate }}
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
  }
}
```

**Perfect Use Cases:**
- 🏨 Hotel booking systems
- 📅 Event blackout periods
- 🔧 Maintenance windows
- 📊 Availability calendars
- 👷 Shift scheduling

### Disabled Dates

**Block specific dates or apply custom logic to disable dates.** Perfect for booking systems, business day selection, and holiday management.

#### Option 1: Disable Specific Dates (Array)

```typescript
import { Component } from '@angular/core';

@Component({
  template: `
    <ngx-dual-datepicker
      [disabledDates]="holidays"
      (dateRangeChange)="onDateRangeChange($event)">
    </ngx-dual-datepicker>
  `
})
export class DisabledDatesExample {
  holidays: Date[] = [
    new Date(2026, 0, 1),   // New Year
    new Date(2026, 11, 25), // Christmas
  ];

  onDateRangeChange(range: DateRange) {
    console.log('Selected range:', range);
  }
}
```

#### Option 2: Disable with Function (Weekends + Holidays)

```typescript
import { Component } from '@angular/core';

@Component({
  template: `
    <ngx-dual-datepicker
      [disabledDates]="isDateDisabled"
      (dateRangeChange)="onDateRangeChange($event)">
    </ngx-dual-datepicker>
  `
})
export class BusinessDaysExample {
  holidays: Date[] = [
    new Date(2026, 0, 1),   // New Year
    new Date(2026, 11, 25), // Christmas
  ];

  // Disable weekends and holidays
  isDateDisabled = (date: Date): boolean => {
    const day = date.getDay();
    
    // Disable weekends (0 = Sunday, 6 = Saturday)
    if (day === 0 || day === 6) {
      return true;
    }
    
    // Check if date is a holiday
    return this.holidays.some(holiday => 
      holiday.getFullYear() === date.getFullYear() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getDate() === date.getDate()
    );
  };

  onDateRangeChange(range: DateRange) {
    console.log('Selected range:', range);
  }
}
```

**Perfect Use Cases:**
- 🏢 Business day selection (no weekends)
- 📅 Booking systems (unavailable dates)
- 🎉 Holiday management
- 🚫 Blackout dates for reservations
- 📆 Appointment scheduling

**Features:**
- ✅ Two modes: Array or Function
- ✅ Visual styling (strikethrough, grayed out)
- ✅ Cannot be selected via mouse or keyboard
- ✅ Flexible custom logic support

### Display Format

**Customize how dates appear in the input field.** Use flexible format tokens to match regional preferences and localization needs.

#### Basic Usage

```typescript
import { Component } from '@angular/core';

@Component({
  template: `
    <!-- Default: "D MMM" (1 Jan, 15 Feb) -->
    <ngx-dual-datepicker
      displayFormat="D MMM"
      (dateRangeChange)="onDateRangeChange($event)">
    </ngx-dual-datepicker>

    <!-- European: "DD/MM/YYYY" (01/01/2026, 15/02/2026) -->
    <ngx-dual-datepicker
      displayFormat="DD/MM/YYYY"
      (dateRangeChange)="onDateRangeChange($event)">
    </ngx-dual-datepicker>

    <!-- US: "MM/DD/YYYY" (01/01/2026, 02/15/2026) -->
    <ngx-dual-datepicker
      displayFormat="MM/DD/YYYY"
      (dateRangeChange)="onDateRangeChange($event)">
    </ngx-dual-datepicker>

    <!-- ISO: "YYYY-MM-DD" (2026-01-01, 2026-02-15) -->
    <ngx-dual-datepicker
      displayFormat="YYYY-MM-DD"
      (dateRangeChange)="onDateRangeChange($event)">
    </ngx-dual-datepicker>

    <!-- Long: "MMM DD, YYYY" (Jan 01, 2026) -->
    <ngx-dual-datepicker
      displayFormat="MMM DD, YYYY"
      (dateRangeChange)="onDateRangeChange($event)">
    </ngx-dual-datepicker>
  `
})
export class DisplayFormatExample {
  onDateRangeChange(range: DateRange) {
    console.log('Selected range:', range);
  }
}
```

#### Available Format Tokens

| Token | Output | Description |
|-------|--------|-------------|
| `YYYY` | 2026 | Full year (4 digits) |
| `YY` | 26 | 2-digit year |
| `MMMM` | January | Full month name |
| `MMM` | Jan | Short month name (3 letters) |
| `MM` | 01-12 | 2-digit month (zero-padded) |
| `M` | 1-12 | Month number (no padding) |
| `DD` | 01-31 | 2-digit day (zero-padded) |
| `D` | 1-31 | Day number (no padding) |

#### Custom Format Examples

```typescript
// Mix and match tokens with any separators
displayFormat="D/M/YY"          // 1/2/26
displayFormat="DD-MM-YYYY"      // 01-02-2026
displayFormat="MMMM D, YYYY"    // January 1, 2026
displayFormat="D. MMMM YYYY"    // 1. January 2026
displayFormat="YY.MM.DD"        // 26.01.01
```

**Perfect Use Cases:**
- 🌍 Localization (match regional formats)
- 🇪🇺 European format (DD/MM/YYYY)
- 🇺🇸 US format (MM/DD/YYYY)
- 💻 ISO format (YYYY-MM-DD for APIs)
- 📱 Mobile-friendly short formats
- 📄 Long formats for reports

**Features:**
- ✅ Flexible token system
- ✅ Any separator (/, -, space, comma, dot)
- ✅ Mix and match freely
- ✅ Works with locale month names
- ✅ No external dependencies

### Custom Presets

**Power feature for dashboards, reporting, ERP, and BI systems!**

#### Using Pre-built Presets

```typescript
import { CommonPresets } from '@oneluiz/dual-datepicker';

// Dashboard presets
presets = CommonPresets.dashboard;
// → Last 7, 15, 30, 60, 90 days + last 6 months

// Reporting presets
presets = CommonPresets.reporting;
// → Today, This week, Last week, This month, Last month, This quarter

// Financial/ERP presets
presets = CommonPresets.financial;
// → Month to date, Quarter to date, Year to date

// Analytics presets
presets = CommonPresets.analytics;
// → Last 7/14/30/60/90/180/365 days
```

#### Creating Custom Presets

```typescript
import { PresetConfig, getToday, getThisMonth, getLastMonth } from '@oneluiz/dual-datepicker';

customPresets: PresetConfig[] = [
  { label: 'Today', getValue: getToday },
  { label: 'This Month', getValue: getThisMonth },
  { label: 'Last Month', getValue: getLastMonth },
  { 
    label: 'Custom Logic', 
    getValue: () => {
      // Your custom date calculation
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        start: formatDate(start),
        end: formatDate(today)
      };
    }
  }
];
```

```html
<ngx-dual-datepicker [presets]="customPresets"></ngx-dual-datepicker>
```

**Why This Is Powerful:**
- ✅ Perfect for dashboards: "Last 7 days", "Month to date"
- ✅ Perfect for reporting: "This quarter", "Last quarter"
- ✅ Perfect for financial systems: "Quarter to date", "Year to date"
- ✅ Perfect for analytics: Consistent date ranges for BI tools

### Date Adapter System

Use custom date libraries (DayJS, date-fns, Luxon) instead of native JavaScript `Date` objects.

#### Example: date-fns Adapter

```typescript
import { Injectable } from '@angular/core';
import { DateAdapter } from '@oneluiz/dual-datepicker';
import { parse, format, addDays, isValid } from 'date-fns';

@Injectable()
export class DateFnsAdapter extends DateAdapter<Date> {
  parse(value: any): Date | null {
    if (!value) return null;
    const parsed = parse(value, 'yyyy-MM-dd', new Date());
    return isValid(parsed) ? parsed : null;
  }

  format(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
    return format(date, formatStr);
  }

  addDays(date: Date, days: number): Date {
    return addDays(date, days);
  }

  // ... implement other required methods
}
```

#### Providing the Adapter

```typescript
import { DATE_ADAPTER } from '@oneluiz/dual-datepicker';

@Component({
  providers: [
    { provide: DATE_ADAPTER, useClass: DateFnsAdapter }
  ]
})
export class AppComponent {}
```

**Benefits:**
- ✅ Zero vendor lock-in
- ✅ Use same date library across your app
- ✅ Adapt to custom backend formats
- ✅ Full TypeScript support

### Keyboard Navigation

**Full keyboard control** for accessibility (WCAG 2.1 AA compliant):

| Key(s) | Action |
|--------|--------|
| `←` / `→` | Navigate between days |
| `↑` / `↓` | Navigate by weeks |
| `Enter` / `Space` | Select focused day |
| `Escape` | Close datepicker |
| `Home` / `End` | Jump to first/last day |
| `PageUp` / `PageDown` | Navigate months |
| `Shift + PageUp/Down` | Navigate years |
| `Tab` | Navigate between input, presets, and calendar |

```html
<!-- Enabled by default -->
<ngx-dual-datepicker></ngx-dual-datepicker>

<!-- Disable if needed -->
<ngx-dual-datepicker [enableKeyboardNavigation]="false"></ngx-dual-datepicker>
```

---

## 🎨 Customization

### Styling Options

```html
<ngx-dual-datepicker
  inputBackgroundColor="#ffffff"
  inputTextColor="#495057"
  inputBorderColor="#ced4da"
  inputBorderColorHover="#80bdff"
  inputBorderColorFocus="#0d6efd"
  inputPadding="0.375rem 0.75rem">
</ngx-dual-datepicker>
```

#### Pre-styled Examples

**Bootstrap Style:**
```html
<ngx-dual-datepicker
  inputBackgroundColor="#ffffff"
  inputBorderColor="#ced4da"
  inputBorderColorFocus="#80bdff">
</ngx-dual-datepicker>
```

**GitHub Style:**
```html
<ngx-dual-datepicker
  inputBackgroundColor="#f3f4f6"
  inputBorderColor="transparent"
  inputBorderColorHover="#d1d5db">
</ngx-dual-datepicker>
```

### Localization (i18n)

```typescript
import { LocaleConfig } from '@oneluiz/dual-datepicker';

spanishLocale: LocaleConfig = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
};
```

```html
<ngx-dual-datepicker [locale]="spanishLocale"></ngx-dual-datepicker>
```

---

## 📖 API Reference

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `ngModel` | `DateRange \| null` | `null` | Two-way binding for selected date range |
| `placeholder` | `string` | `'Select date range'` | Input placeholder text |
| `presets` | `PresetConfig[]` | `[]` | Array of preset configurations |
| `showPresets` | `boolean` | `true` | Show/hide the presets sidebar |
| `showClearButton` | `boolean` | `false` | Show/hide the Clear button |
| `closeOnSelection` | `boolean` | `false` | Close picker when both dates selected |
| `closeOnPresetSelection` | `boolean` | `false` | Close picker when preset clicked |
| `closeOnClickOutside` | `boolean` | `true` | Close picker when clicking outside |
| `multiRange` | `boolean` | `false` | Enable multi-range selection mode |
| `disabledDates` | `Date[] \| ((date: Date) => boolean)` | `undefined` | Array of dates or function to disable specific dates |
| `displayFormat` | `string` | `'D MMM'` | Format for displaying dates in input (tokens: YYYY, YY, MMMM, MMM, MM, M, DD, D) |
| `enableKeyboardNavigation` | `boolean` | `true` | Enable keyboard navigation |
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
| `dateRangeChange` | `EventEmitter<DateRange>` | Emitted when date range changes |
| `dateRangeSelected` | `EventEmitter<DateRange>` | Emitted when both dates are selected |
| `multiDateRangeChange` | `EventEmitter<MultiDateRange>` | Emitted in multi-range mode |
| `multiDateRangeSelected` | `EventEmitter<MultiDateRange>` | Emitted when multi-range selection is complete |

### Public Methods

```typescript
import { Component, ViewChild } from '@angular/core';
import { DualDatepickerComponent } from '@oneluiz/dual-datepicker';

@Component({
  template: `
    <ngx-dual-datepicker #datepicker></ngx-dual-datepicker>
    <button (click)="clearSelection()">Clear</button>
  `
})
export class MyComponent {
  @ViewChild('datepicker') datepicker!: DualDatepickerComponent;

  clearSelection() {
    this.datepicker.clear();
  }
}
```

| Method | Description |
|--------|-------------|
| `clear()` | Clears current selection and resets component |

### Types

```typescript
interface DateRange {
  startDate: string;   // ISO format: 'YYYY-MM-DD'
  endDate: string;     // ISO format: 'YYYY-MM-DD'
  rangeText: string;   // Display text: 'DD Mon - DD Mon'
}

interface MultiDateRange {
  ranges: DateRange[];  // Array of selected date ranges
}

interface PresetRange {
  start: string;  // ISO format: 'YYYY-MM-DD'
  end: string;    // ISO format: 'YYYY-MM-DD'
}

interface PresetConfig {
  label: string;
  getValue: () => PresetRange;
}

interface LocaleConfig {
  monthNames?: string[];         // Full month names (12 items)
  monthNamesShort?: string[];    // Short month names (12 items)
  dayNames?: string[];           // Full day names (7 items, starting Sunday)
  dayNamesShort?: string[];      // Short day names (7 items, starting Sunday)
}
```

---

## 💡 Usage Examples

### With Events

```typescript
@Component({
  template: `
    <ngx-dual-datepicker
      (dateRangeSelected)="onDateRangeSelected($event)">
    </ngx-dual-datepicker>
    
    @if (selectedRange) {
      <div>Selected: {{ selectedRange.rangeText }}</div>
    }
  `
})
export class ExampleComponent {
  selectedRange: DateRange | null = null;

  onDateRangeSelected(range: DateRange) {
    this.selectedRange = range;
    // Both dates selected - fetch data
    this.fetchData(range.startDate, range.endDate);
  }

  fetchData(start: string, end: string) {
    // Dates are in 'YYYY-MM-DD' format
  }
}
```

### With Angular Signals

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  template: `
    <ngx-dual-datepicker
      (dateRangeChange)="onDateChange($event)">
    </ngx-dual-datepicker>
    
    @if (isRangeSelected()) {
      <div>
        <p>{{ rangeText() }}</p>
        <p>Days: {{ daysDifference() }}</p>
      </div>
    }
  `
})
export class SignalsExample {
  startDate = signal('');
  endDate = signal('');
  
  isRangeSelected = computed(() => 
    this.startDate() !== '' && this.endDate() !== ''
  );
  
  rangeText = computed(() => 
    `${this.startDate()} to ${this.endDate()}`
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

### With Complete Customization

```html
<ngx-dual-datepicker
  placeholder="Pick your dates"
  [presets]="customPresets"
  [showClearButton]="true"
  [closeOnSelection]="true"
  [locale]="spanishLocale"
  inputBackgroundColor="#fef3c7"
  inputTextColor="#92400e"
  inputBorderColor="#fbbf24"
  inputBorderColorFocus="#d97706"
  inputPadding="12px 16px"
  (dateRangeSelected)="onDateRangeSelected($event)">
</ngx-dual-datepicker>
```

---

## ♿ Accessibility

**WCAG 2.1 Level AA Compliant**

- ✅ Full keyboard navigation
- ✅ Screen reader support with ARIA labels
- ✅ Semantic HTML with proper `role` attributes
- ✅ Focus management with visual indicators
- ✅ High contrast support

---

## 🛠️ Requirements

- **Angular:** 17.0.0 or higher
- **TypeScript:** 5.0+ (recommended)

---

## 📄 License & Support

**License:** MIT © Luis Cortes

**Issues:** [Report bugs](https://github.com/oneluiz/ng-dual-datepicker/issues)

**Star this project:** If you find it useful, please ⭐ the [GitHub repository](https://github.com/oneluiz/ng-dual-datepicker)!

---

Made with ❤️ by [Luis Cortes](https://github.com/oneluiz)
**

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

**Configuration:**
```typescript
// Keyboard navigation enabled by default
<ngx-dual-datepicker></ngx-dual-datepicker>

// Disable if needed
<ngx-dual-datepicker [enableKeyboardNavigation]="false"></ngx-dual-datepicker>
```

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
