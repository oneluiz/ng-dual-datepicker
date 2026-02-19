import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DualDatepickerComponent, DateRange, MultiDateRange, PresetConfig, CommonPresets } from '../../../src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DualDatepickerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Active tab
  activeTab: 'examples' | 'docs' | 'api' = 'examples';

  // Example 1: Basic
  example1Range: DateRange | null = null;

  // Example 2: With custom presets
  example2Range: DateRange | null = null;
  customPresets: PresetConfig[] = CommonPresets.simple;

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

  // Example 11: CommonPresets - Financial/Reporting
  example11Range: DateRange | null = null;
  financialPresets = CommonPresets.financial;

  // Example 12: Multi-Range Support (NEW v2.7.0 - DIFFERENTIATOR!)
  example12MultiRange: MultiDateRange | null = null;

  clearExternalButton() {
    this.datepicker8.clear();
  }

  setActiveTab(tab: 'examples' | 'docs' | 'api') {
    this.activeTab = tab;
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
    }
  }

  onMultiDateRangeChange(multiRange: MultiDateRange) {
    this.example12MultiRange = multiRange;
  }

  get codeExamples() {
    return {
      basic: `<ngx-dual-datepicker
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>`,
      presets: `<ngx-dual-datepicker
  [presets]="customPresets"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// In your component:
import { CommonPresets } from '@oneluiz/dual-datepicker';

customPresets = CommonPresets.simple;
// Or create custom:
customPresets: PresetConfig[] = [
  { label: 'Last 7 days', getValue: () => getLastNDays(7) },
  { label: 'Last 30 days', getValue: () => getLastNDays(30) }
];`,
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
export class DayJSAdapter extends DateAdapter<Dayjs> {
  parse(value: any): Dayjs | null {
    if (!value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  }

  format(date: Dayjs, format = 'YYYY-MM-DD'): string {
    return date.format(format);
  }

  addDays(date: Dayjs, days: number): Dayjs {
    return date.add(days, 'day');
  }
  // ... implement other methods
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
      commonPresets: `import { CommonPresets } from '@oneluiz/dual-datepicker';

// Financial/ERP presets
financialPresets = CommonPresets.financial;
// → Month to date, Quarter to date, Year to date, 
//   Last month, Last quarter, Last year

// Dashboard presets  
dashboardPresets = CommonPresets.dashboard;
// → Today, Yesterday, Last 7 days, Last 30 days,
//   This month, Last month

// Reporting presets
reportingPresets = CommonPresets.reporting;
// → Today, This week, Last week, This month,
//   Last month, This quarter, Last quarter

// Analytics/BI presets
analyticsPresets = CommonPresets.analytics;
// → Last 7/14/30/60/90/180/365 days

// Use in template
<ngx-dual-datepicker
  [presets]="financialPresets"
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
      install: `npm install @oneluiz/dual-datepicker`
    };
  }
}
