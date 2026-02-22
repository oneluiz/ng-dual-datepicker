import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DualDatepickerComponent, DateRange, MultiDateRange, PresetConfig, ThemeType } from '../../../src/public-api';
import packageInfo from '../../../package.json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DualDatepickerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Library version (auto-synced from package.json)
  readonly version = packageInfo.version;
  
  // Active tab - default to home (landing page)
  activeTab: 'home' | 'installation' | 'configuration' | 'examples' | 'docs' | 'api' | 'whats-new' | 'migration' = 'home';
  
  // Active v3.2.0 feature tab
  activeV320Tab: 'disabled-dates' | 'display-format' | 'apply-button' | 'hover-preview' = 'disabled-dates';

  // Example 1: Basic
  example1Range: DateRange | null = null;

  // Example 2: Using built-in presets
  example2Range: DateRange | null = null;

  // Example 3: With custom colors (GitHub style)
  example3Range: DateRange | null = null;

  // Example 4: With presets and custom colors
  example4Range: DateRange | null = null;

  // Example 5: Without presets, calendar only
  example5Range: DateRange | null = null;

  // Example 6: With initial dates
  example6Range: DateRange | null = null;
  startDate = '2026-02-01';
  endDate = '2026-02-18';

  // Example 7: Clear button
  example7Range: DateRange | null = null;

  // Example 8: External clear button
  @ViewChild('datepicker8') datepicker8!: DualDatepickerComponent;
  example8Range: DateRange | null = null;

  // Example 9: Hide clear button
  example9Range: DateRange | null = null;

  // Example 10: Date Adapter System
  example10Range: DateRange | null = null;

  // Example 11: Built-in Presets
  example11Range: DateRange | null = null;

  // Example 12: Multi-Range Support (NEW v2.7.0 - DIFFERENTIATOR!)
  example12MultiRange: MultiDateRange | null = null;

  // Example 13: Disabled Dates - Weekends + Holidays (NEW v3.2.0)
  example13Range: DateRange | null = null;
  
  // Example 14: Display Format (NEW v3.2.0)
  example14Range: DateRange | null = null;
  example14aRange: DateRange | null = null;
  example14bRange: DateRange | null = null;
  example14cRange: DateRange | null = null;
  example14dRange: DateRange | null = null;
  
  // Example 15: Apply/Confirm Button (NEW v3.2.0)
  example15Range: DateRange | null = null;
  
  // Example 16: Hover Range Preview (NEW v3.2.0)
  example16Range: DateRange | null = null;

  // Example 17: Close Behavior (NEW v4.0.0)
  example17Range: DateRange | null = null;
  example17aRange: DateRange | null = null;

  // Example 20: Theming System (NEW v3.3.0)
  example20Range: DateRange | null = null;
  selectedTheme: ThemeType = 'default';
  
  // Example 21: Time Picker (NEW v3.4.0)
  example21Range: DateRange | null = null;
  example21aRange: DateRange | null = null;
  example21bRange: DateRange | null = null;
  
  // Costa Rica holidays 2026
  costaRicaHolidays2026: Date[] = [
    new Date(2026, 0, 1),   // Año Nuevo
    new Date(2026, 3, 10),  // Jueves Santo
    new Date(2026, 3, 11),  // Viernes Santo
    new Date(2026, 3, 13),  // Lunes de Pascua (Juan Santamaría Day)
    new Date(2026, 4, 1),   // Día del Trabajo
    new Date(2026, 6, 25),  // Anexión de Guanacaste
    new Date(2026, 7, 2),   // Virgen de Los Ángeles
    new Date(2026, 7, 15),  // Día de la Madre
    new Date(2026, 8, 15),  // Día de la Independencia
    new Date(2026, 11, 25), // Navidad
  ];

  // Function to disable weekends and holidays
  isDateDisabled = (date: Date): boolean => {
    const day = date.getDay();
    // Disable weekends (0 = Sunday, 6 = Saturday)
    if (day === 0 || day === 6) {
      return true;
    }
    
    // Check if date is a holiday
    return this.costaRicaHolidays2026.some(holiday => 
      holiday.getFullYear() === date.getFullYear() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getDate() === date.getDate()
    );
  };

  clearExternalButton() {
    this.datepicker8.clear();
  }

  setActiveTab(tab: 'home' | 'installation' | 'configuration' | 'examples' | 'docs' | 'api' | 'whats-new' | 'migration') {
    this.activeTab = tab;
  }
  
  setActiveV320Tab(tab: 'disabled-dates' | 'display-format' | 'apply-button' | 'hover-preview') {
    this.activeV320Tab = tab;
  }

  onDateRangeChange(example: number, range: DateRange) {
    switch(example) {
      case 1:
        this.example1Range = range;
        break;
      case 2:
        this.example2Range = range;
        break;
      case 3:
        this.example3Range = range;
        break;
      case 4:
        this.example4Range = range;
        break;
      case 5:
        this.example5Range = range;
        break;
      case 6:
        this.example6Range = range;
        break;
      case 7:
        this.example7Range = range;
        break;
      case 8:
        this.example8Range = range;
        break;
      case 9:
        this.example9Range = range;
        break;
      case 10:
        this.example10Range = range;
        break;
      case 11:
        this.example11Range = range;
        break;
      case 13:
        this.example13Range = range;
        break;
      case 14:
        this.example14Range = range;
        break;
      case 141:
        this.example14aRange = range;
        break;
      case 142:
        this.example14bRange = range;
        break;
      case 143:
        this.example14cRange = range;
        break;
      case 144:
        this.example14dRange = range;
        break;
      case 15:
        this.example15Range = range;
        break;
      case 16:
        this.example16Range = range;
        break;
      case 17:
        this.example17Range = range;
        break;
      case 171:
        this.example17aRange = range;
        break;
      case 20:
        this.example20Range = range;
        break;
    }
  }

  onMultiDateRangeChange(multiRange: MultiDateRange) {
    this.example12MultiRange = multiRange;
  }

  get codeExamples() {
    return {
      basic: `<ngx-dual-datepicker
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

<!-- Full keyboard navigation included -->
<!-- Arrow keys, Enter/Space, Escape, Home/End, PageUp/Down -->`,
      presets: `<ngx-dual-datepicker
  [presets]="customPresets"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// In your component:
customPresets: PresetConfig[] = [
  { label: 'Last 7 days', getValue: () => getLastNDays(7) },
  { label: 'Last 30 days', getValue: () => getLastNDays(30) },
  { label: 'This Month', getValue: () => getThisMonth() }
];

// Or use built-in presets via AppConfig:
import { provideCustomPresets, LAST_7_DAYS_PRESET, LAST_30_DAYS_PRESET } from '@oneluiz/dual-datepicker';

// In your app.config.ts or component providers:
providers: [
  provideCustomPresets([LAST_7_DAYS_PRESET, LAST_30_DAYS_PRESET])
]`,
      colors: `<ngx-dual-datepicker
  inputBackgroundColor="#0d1117"
  inputTextColor="#c9d1d9"
  inputBorderColor="#30363d"
  inputBorderColorHover="#58a6ff"
  inputBorderColorFocus="#58a6ff"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>`,
      noPresets: `<ngx-dual-datepicker
  [showPresets]="false"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>`,
      initial: `<ngx-dual-datepicker
  [startDate]="startDate"
  [endDate]="endDate"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// In your component:
startDate = '2026-02-01';
endDate = '2026-02-18';`,
      externalButton: `<!-- Template -->
<div style="display: flex; gap: 10px; align-items: flex-start;">
  <ngx-dual-datepicker
    #datepicker8
    (dateRangeChange)="onDateRangeChange(8, $event)">
  </ngx-dual-datepicker>
  <button (click)="clearExternalButton()" style="padding: 0.375rem 0.75rem;">
    Clear
  </button>
</div>

// Component
import { Component, ViewChild } from '@angular/core';
import { DualDatepickerComponent } from '@oneluiz/dual-datepicker';

@ViewChild('datepicker8') datepicker8!: DualDatepickerComponent;

clearExternalButton() {
    this.datepicker8.clear();
  }`,
      clearButton: `<ngx-dual-datepicker
  [showClearButton]="true"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>`,
      minimalUI: `<ngx-dual-datepicker
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Note: showClearButton is false by default
// for a clean, minimalist interface`,
      dateAdapter: `// 1. Create custom adapter (e.g., with DayJS)
import { Injectable } from '@angular/core';
import { DateAdapter } from '@oneluiz/dual-datepicker';
import dayjs, { Dayjs } from 'dayjs';

@Injectable()
export class DayJSAdapter implements DateAdapter {
  parseISODate(value: string): Date | null {
    if (!value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.toDate() : null;
  }

  toISODate(date: Date): string {
    return dayjs(date).format('YYYY-MM-DD');
  }

  normalize(date: Date): Date {
    return dayjs(date).startOf('day').toDate();
  }

  addDays(date: Date, days: number): Date {
    return dayjs(date).add(days, 'day').toDate();
  }
  // ... implement other methods (addMonths, isSameDay, etc.)
}

// 2. Provide custom adapter
import { DATE_ADAPTER } from '@oneluiz/dual-datepicker';

@Component({
  providers: [
    { provide: DATE_ADAPTER, useClass: DayJSAdapter }
  ]
})

// 3. Use component normally
<ngx-dual-datepicker></ngx-dual-datepicker>`,
      builtInPresets: `// NEW v3.6.0: Plugin-based preset system

// Option 1: Use built-in presets via providers
import { provideCustomPresets, LAST_7_DAYS_PRESET, LAST_30_DAYS_PRESET, THIS_MONTH_PRESET } from '@oneluiz/dual-datepicker';

// In your app.config.ts:
export const appConfig: ApplicationConfig = {
  providers: [
    provideCustomPresets([
      LAST_7_DAYS_PRESET,
      LAST_30_DAYS_PRESET,
      THIS_MONTH_PRESET
    ])
  ]
};

// Option 2: Provide preset packages
import { providePresetPackage, BUILT_IN_PRESETS } from '@oneluiz/dual-datepicker';

providers: [providePresetPackage(BUILT_IN_PRESETS)]

// Available built-in presets:
// TODAY_PRESET, YESTERDAY_PRESET
// LAST_7_DAYS_PRESET, LAST_30_DAYS_PRESET
// THIS_WEEK_PRESET, LAST_WEEK_PRESET
// THIS_MONTH_PRESET, LAST_MONTH_PRESET
// THIS_YEAR_PRESET, LAST_YEAR_PRESET

// Then use in template:
<ngx-dual-datepicker
  [showPresets]="true"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>`,
      multiRange: `import { MultiDateRange } from '@oneluiz/dual-datepicker';

// Enable multi-range mode (NEW v3.0.0!)
multiRanges: MultiDateRange | null = null;

onMultiRangeChange(ranges: MultiDateRange) {
  this.multiRanges = ranges;
  console.log('Selected ranges:', ranges.ranges);
  // Example output:
  // [
  //   { startDate: '2026-01-01', endDate: '2026-01-05', rangeText: 'Jan 1 – Jan 5' },
  //   { startDate: '2026-01-10', endDate: '2026-01-15', rangeText: 'Jan 10 – Jan 15' }
  // ]
}

// Use in template
<ngx-dual-datepicker
  [multiRange]="true"
  (multiDateRangeChange)="onMultiRangeChange($event)">
</ngx-dual-datepicker>

<!-- Perfect for: -->
<!-- ✔ Hotel booking systems -->
<!-- ✔ Event blackout periods -->
<!-- ✔ Maintenance windows -->
<!-- ✔ Availability calendars -->
<!-- ✔ Shift scheduling -->

<!-- Material DOESN'T have this! -->`,
      disabledDates: `// Option 1: Disable specific dates (array)
holidays: Date[] = [
  new Date(2026, 0, 1),   // New Year
  new Date(2026, 11, 25), // Christmas
];

<ngx-dual-datepicker
  [disabledDates]="holidays"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Option 2: Disable with function (weekends + holidays)
isDateDisabled = (date: Date): boolean => {
  const day = date.getDay();
  // Disable weekends
  if (day === 0 || day === 6) return true;
  
  // Check holidays
  return this.holidays.some(holiday => 
    holiday.getFullYear() === date.getFullYear() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getDate() === date.getDate()
  );
};

<ngx-dual-datepicker
  [disabledDates]="isDateDisabled"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

<!-- Perfect for: -->
<!-- ✔ Booking systems (unavailable dates) -->
<!-- ✔ Business day selection -->
<!-- ✔ Holiday/weekend blocking -->
<!-- ✔ Reservation systems -->
<!-- ✔ Appointment scheduling -->`,
      displayFormat: `// Customize how dates appear in the input field

// Default format: "D MMM" (1 Jan, 15 Feb)
<ngx-dual-datepicker
  displayFormat="D MMM"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// European format: "DD/MM/YYYY" (01/01/2026, 15/02/2026)
<ngx-dual-datepicker
  displayFormat="DD/MM/YYYY"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// US format: "MM/DD/YYYY" (01/01/2026, 02/15/2026)
<ngx-dual-datepicker
  displayFormat="MM/DD/YYYY"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// ISO format: "YYYY-MM-DD" (2026-01-01, 2026-02-15)
<ngx-dual-datepicker
  displayFormat="YYYY-MM-DD"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Long format: "MMM DD, YYYY" (Jan 01, 2026, Feb 15, 2026)
<ngx-dual-datepicker
  displayFormat="MMM DD, YYYY"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Available tokens:
// YYYY - Full year (2026)
// YY   - 2-digit year (26)
// MMMM - Full month name (January)
// MMM  - Short month name (Jan)
// MM   - 2-digit month (01-12)
// M    - Month (1-12)
// DD   - 2-digit day (01-31)
// D    - Day (1-31)

// Mix and match tokens with any separators:
// "D/M/YY", "DD-MM-YYYY", "MMMM D, YYYY", etc.`,
      requireApply: `// Require explicit confirmation before emitting changes
// Perfect for dashboards where recalculating data is expensive

<ngx-dual-datepicker
  [requireApply]="true"
  [presets]="customPresets"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// How it works:
// 1. User selects start and end dates
// 2. Selection is shown as "pending" (highlighted in calendar)
// 3. NO events are emitted yet
// 4. User clicks "Apply" → dates confirmed, events emitted
// 5. Or clicks "Cancel" → pending selection discarded

// Key benefits:
// ✔ Prevent unwanted API calls during selection
// ✔ Give users control to confirm before applying
// ✔ Perfect for expensive operations (data loading, API calls)
// ✔ Improves UX in enterprise dashboards
// ✔ Works with all other features (presets, formats, etc.)

// When to use:
// → Dashboards that load data on date change
// → Reports with expensive calculations
// → Analytics with API calls
// → Any scenario where immediate updates are costly

// Real-world example:
selectedRange: DateRange | null = null;

onDateRangeChange(range: DateRange) {
  this.selectedRange = range;
  // This only fires AFTER user clicks Apply
  this.loadExpensiveData(range.startDate, range.endDate);
}`,
      hoverPreview: `// Hover Range Preview - automatic visual feedback
// See preview of date range before clicking (always enabled)

<ngx-dual-datepicker
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// How it works:
// 1. User clicks start date
// 2. User hovers over dates → preview shown
// 3. Light purple background + dashed border
// 4. User clicks end date → confirmed

// Key benefits:
// ✔ Better UX - visual preview before confirming
// ✔ Instant feedback - see range on hover
// ✔ Intuitive - natural mouse interaction
// ✔ Zero configuration - always enabled
// ✔ Professional feel - premium experience

// Visual styling:
// → Light purple background (#e0e7ff)
// → Purple dashed border (#6366f1)
// → 70% opacity (subtle preview)
// → Clear distinction from selected range

// Works with all modes:`,
      closeBehavior: `// Close Behavior - Control when the datepicker closes automatically

// Default: Auto-close on selection and outside click
<ngx-dual-datepicker
  [closeOnSelection]="true"
  [closeOnClickOutside]="true"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Keep open after selection (useful for multi-range)
<ngx-dual-datepicker
  [closeOnSelection]="false"
  [closeOnClickOutside]="true"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Never auto-close (manual control only)
<ngx-dual-datepicker
  [closeOnSelection]="false"
  [closeOnClickOutside]="false"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Control preset behavior separately
<ngx-dual-datepicker
  [closeOnPresetSelection]="true"
  [closeOnSelection]="false"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Configuration options:
// closeOnSelection: true     → Auto-close after selecting both dates
// closeOnPresetSelection: true → Auto-close after preset selection  
// closeOnClickOutside: true   → Auto-close when clicking outside

// Use cases:
// ✔ Modal forms - Keep open until explicit close
// ✔ Multi-range selection - Don't close after each range
// ✔ Always-visible pickers - Prevent auto-closing
// ✔ Preset-only mode - Close on preset, stay open for manual

// Works with all modes:
// ✔ Single range mode
// ✔ Multi-range mode
// ✔ requireApply mode
// ✔ With presets, formats, disabled dates

selectedRange: DateRange | null = null;

onDateRangeChange(range: DateRange) {
  this.selectedRange = range;
  console.log('Range selected:', range);
}`,
      theming: `// NEW v3.3.0: Theming System
// Apply built-in themes to match popular CSS frameworks

// Available themes:
// - 'default' - Original styling (no import needed)
// - 'bootstrap' - Bootstrap 5 compatible
// - 'bulma' - Bulma CSS compatible
// - 'foundation' - Foundation CSS compatible
// - 'tailwind' - Tailwind CSS compatible
// - 'custom' - CSS variables-based customization

// 1. Select theme in component
selectedTheme: ThemeType = 'bootstrap';

<ngx-dual-datepicker 
  [theme]="selectedTheme"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// 2. Import corresponding stylesheet in styles.scss
@import '@oneluiz/dual-datepicker/themes/bootstrap';

// For Bulma:
@import '@oneluiz/dual-datepicker/themes/bulma';

// For Foundation:
@import '@oneluiz/dual-datepicker/themes/foundation';

// For Tailwind:
@import '@oneluiz/dual-datepicker/themes/tailwind';

// For Custom (with CSS variables):
@import '@oneluiz/dual-datepicker/themes/custom';

// Custom theme CSS variables:
// --dp-primary-color, --dp-primary-hover
// --dp-danger-color, --dp-text-color
// --dp-text-muted, --dp-border-color
// --dp-border-hover, --dp-bg-color
// --dp-bg-hover, --dp-bg-disabled
// --dp-border-radius, --dp-transition

// Key benefits:
// ✔ Match your existing CSS framework
// ✔ Consistent styling across your app
// ✔ Zero custom CSS needed
// ✔ Backward compatible
// ✔ Easy to switch themes

// See THEMING.md for full documentation`,
      timePicker: `// NEW v3.4.0: Time Picker - Select date + time ranges
// Enable time picker to select precise datetime ranges

// Basic time picker (24h format)
<ngx-dual-datepicker
  [enableTimePicker]="true"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Result includes time:
// {
//   startDate: '2026-02-01',
//   endDate: '2026-02-15',
//   rangeText: '1 Feb - 15 Feb',
//   startTime: '09:00',
//   endTime: '17:30'
// }

// 12-hour format with AM/PM
<ngx-dual-datepicker
  [enableTimePicker]="true"
  timeFormat="12h"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Custom minute steps (1, 5, 15, or 30)
<ngx-dual-datepicker
  [enableTimePicker]="true"
  [minuteStep]="30"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Default times
<ngx-dual-datepicker
  [enableTimePicker]="true"
  defaultStartTime="09:00"
  defaultEndTime="18:00"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// With requireApply for controlled changes
<ngx-dual-datepicker
  [enableTimePicker]="true"
  [requireApply]="true"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// Key features:
// ✔ Optional time selection for each date
// ✔ 12h (AM/PM) or 24h format
// ✔ Configurable minute steps (1, 5, 15, 30)
// ✔ Default start/end times
// ✔ Works with all themes
// ✔ Backward compatible (disabled by default)
// ✔ Integrates with requireApply mode

// Perfect for:
// - Appointment booking systems
// - Event scheduling
// - Meeting planners
// - Time-based reporting
// - Shift management`,
      install: `npm install @oneluiz/dual-datepicker`
    };
  }

  // Scroll to example
  scrollToExample(exampleId: string) {
    const element = document.getElementById(exampleId);
    if (element) {
      const headerOffset = 120; // Header + nav height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Scroll to section
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Copy text to clipboard
  copyToClipboard(text: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    navigator.clipboard.writeText(text).then(() => {
      // Optional: Show feedback (could add a toast notification)
      console.log('Copied to clipboard:', text);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
}
