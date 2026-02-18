# @ngx-tools/dual-datepicker

A beautiful, customizable dual-calendar date range picker for Angular 17+. Built as a standalone component with full TypeScript support.

![npm version](https://img.shields.io/npm/v/@ngx-tools/dual-datepicker)
![license](https://img.shields.io/npm/l/@ngx-tools/dual-datepicker)
![Angular](https://img.shields.io/badge/Angular-17%2B-red)

## ✨ Features

- 📅 **Dual Calendar Display** - Side-by-side month view for easy range selection
- 🎨 **Fully Customizable** - Color scheme, padding, and styling
- ⚡ **Preset Ranges** - Configurable quick-select options
- 🎯 **Standalone Component** - No module imports required
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌐 **TypeScript** - Full type safety
- ♿ **Accessible** - Keyboard navigation and ARIA labels
- 🎭 **Flexible Behavior** - Control when the picker closes

## 📦 Installation

```bash
npm install @ngx-tools/dual-datepicker
```

## 🚀 Quick Start

### 1. Import the Component

```typescript
import { Component } from '@angular/core';
import { DualDatepickerComponent, DateRange } from '@ngx-tools/dual-datepicker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DualDatepickerComponent],
  template: `
    <ngx-dual-datepicker
      [(ngModel)]="dateRange"
      placeholder="Select date range">
    </ngx-dual-datepicker>
  `
})
export class AppComponent {
  dateRange: DateRange = { start: null, end: null };
}
```

### 2. Use with Forms

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DualDatepickerComponent } from '@ngx-tools/dual-datepicker';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [FormsModule, DualDatepickerComponent],
  template: `
    <ngx-dual-datepicker
      [(ngModel)]="selectedRange"
      [presets]="customPresets"
      (ngModelChange)="onDateChange($event)">
    </ngx-dual-datepicker>
  `
})
export class ExampleComponent {
  selectedRange = { start: null, end: null };
  
  customPresets = [
    { label: 'Last 7 days', daysAgo: 7 },
    { label: 'Last 30 days', daysAgo: 30 },
    { label: 'Last 90 days', daysAgo: 90 }
  ];

  onDateChange(range: any) {
    console.log('Date range selected:', range);
  }
}
```

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

### Custom Presets

```typescript
customPresets: PresetConfig[] = [
  { label: 'Last 15 days', daysAgo: 15 },
  { label: 'Last 3 months', daysAgo: 90 },
  { label: 'Last 6 months', daysAgo: 180 },
  { label: 'Last year', daysAgo: 365 }
];
```

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
| `closeOnSelection` | `boolean` | `false` | Close picker when both dates selected |
| `closeOnPresetSelection` | `boolean` | `false` | Close picker when preset is clicked |
| `closeOnClickOutside` | `boolean` | `true` | Close picker when clicking outside |
| `inputBackgroundColor` | `string` | `'#fff'` | Input background color |
| `inputTextColor` | `string` | `'#495057'` | Input text color |
| `inputBorderColor` | `string` | `'#ced4da'` | Input border color |
| `inputBorderColorHover` | `string` | `'#9ca3af'` | Input border color on hover |
| `inputBorderColorFocus` | `string` | `'#80bdff'` | Input border color on focus |
| `inputPadding` | `string` | `'0.375rem 0.75rem'` | Input padding |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `ngModelChange` | `EventEmitter<DateRange>` | Emitted when date range changes |

### Types

```typescript
interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface PresetConfig {
  label: string;
  daysAgo: number;
}
```

### Default Presets

```typescript
[
  { label: 'Last month', daysAgo: 30 },
  { label: 'Last 6 months', daysAgo: 180 },
  { label: 'Last year', daysAgo: 365 }
]
```

## 🎯 Examples

### Minimal Usage

```html
<ngx-dual-datepicker [(ngModel)]="dateRange"></ngx-dual-datepicker>
```

### With Auto-close

```html
<ngx-dual-datepicker
  [(ngModel)]="dateRange"
  [closeOnSelection]="true"
  [closeOnPresetSelection]="true">
</ngx-dual-datepicker>
```

### Custom Styling

```html
<ngx-dual-datepicker
  [(ngModel)]="dateRange"
  placeholder="Pick your dates"
  inputBackgroundColor="#fef3c7"
  inputTextColor="#92400e"
  inputBorderColor="#fbbf24"
  inputBorderColorHover="#f59e0b"
  inputBorderColorFocus="#d97706"
  inputPadding="8px 12px">
</ngx-dual-datepicker>
```

### With Event Handler

```typescript
@Component({
  selector: 'app-example',
  template: `
    <ngx-dual-datepicker
      [(ngModel)]="dateRange"
      (ngModelChange)="onDateRangeChange($event)">
    </ngx-dual-datepicker>
    
    <div *ngIf="dateRange.start && dateRange.end">
      Selected: {{ formatDateRange() }}
    </div>
  `
})
export class ExampleComponent {
  dateRange: DateRange = { start: null, end: null };

  onDateRangeChange(range: DateRange) {
    console.log('Start:', range.start);
    console.log('End:', range.end);
    
    if (range.start && range.end) {
      // Both dates selected - do something
      this.fetchData(range.start, range.end);
    }
  }

  formatDateRange(): string {
    if (!this.dateRange.start || !this.dateRange.end) return '';
    return `${this.dateRange.start.toLocaleDateString()} - ${this.dateRange.end.toLocaleDateString()}`;
  }

  fetchData(start: Date, end: Date) {
    // Your API call here
  }
}
```

## 🛠️ Requirements

- Angular 17.0.0 or higher
- Angular 18.0.0 or higher

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
