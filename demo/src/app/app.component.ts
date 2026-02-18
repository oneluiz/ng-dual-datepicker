import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DualDatepickerComponent, DateRange, PresetConfig } from '../../../src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DualDatepickerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Example 1: Basic
  example1Range: DateRange | null = null;

  // Example 2: With custom presets
  example2Range: DateRange | null = null;
  customPresets: PresetConfig[] = [
    { label: 'Today', daysAgo: 0 },
    { label: 'Last week', daysAgo: 7 },
    { label: 'Last month', daysAgo: 30 },
    { label: 'Last 3 months', daysAgo: 90 }
  ];

  // Example 3: With custom colors (GitHub style)
  example3Range: DateRange | null = null;

  // Example 4: With presets and custom colors
  example4Range: DateRange | null = null;

  // Example 5: Without presets, calendar only
  example5Range: DateRange | null = null;

  // Example 6: With initial dates
  example6Range: DateRange | null = null;
  fechaInicio = '2026-02-01';
  fechaFin = '2026-02-18';

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
    }
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
customPresets: PresetConfig[] = [
  { label: 'Today', daysAgo: 0 },
  { label: 'Last week', daysAgo: 7 },
  { label: 'Last month', daysAgo: 30 }
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
  [fechaInicio]="fechaInicio"
  [fechaFin]="fechaFin"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// In your component:
fechaInicio = '2026-02-01';
fechaFin = '2026-02-18';`,
      install: `npm install @oneluiz/dual-datepicker`
    };
  }
}
