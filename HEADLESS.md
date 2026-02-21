# Headless Date Range Architecture

> **NEW in v3.5.0** – Use date range state WITHOUT the UI component

## 🎯 What is Headless Architecture?

The date range logic now lives in a **separate store** that can be used:

- ✅ **Without UI** - Perfect for SSR, services, guards
- ✅ **Global state** - Share across components
- ✅ **Dashboard filters** - Control multiple charts
- ✅ **API filtering** - Direct integration with services
- ✅ **Deterministic** - Testable, predictable, pure

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  DualDateRangeStore (Angular Signals)│  ← CORE LOGIC
│  - State management                  │
│  - Validation                        │
│  - Presets                           │
│  - No UI dependencies                │
└─────────────────────────────────────┘
           ↑
           │ uses internally
           │
┌─────────────────────────────────────┐
│  DualDatepickerComponent             │  ← UI LAYER
│  - Renders calendars                 │
│  - Uses store for state (v3.5.0)    │
│  - 100% backward compatible API      │
└─────────────────────────────────────┘
```

**NEW**: The component now uses `DualDateRangeStore` internally for all state management, providing cleaner architecture while maintaining full backward compatibility.

## 📦 Core Modules

### 1. `DualDateRangeStore`

Signal-based state container:

```typescript
import { DualDateRangeStore } from '@oneluiz/dual-datepicker';

// Inject anywhere
const rangeStore = inject(DualDateRangeStore);

// Signals (read-only)
rangeStore.startDate();    // signal<Date | null>
rangeStore.endDate();      // signal<Date | null>
rangeStore.range();        // computed<{ start: string, end: string }>
rangeStore.isValid();      // computed<boolean>

// Methods
rangeStore.setStart(new Date());
rangeStore.setEnd(new Date());
rangeStore.setRange('2026-01-01', '2026-01-31');
rangeStore.applyPreset('THIS_MONTH');
rangeStore.reset();
```

### 2. `PresetEngine`

Headless preset resolver:

```typescript
import { presetEngine } from '@oneluiz/dual-datepicker';

// Resolve preset without UI
const range = presetEngine.resolve('THIS_MONTH');
// { start: '2026-02-01', end: '2026-02-28' }

// Register custom preset
presetEngine.register('FISCAL_YEAR', {
  resolve: (now) => {
    // Your custom logic
    return { start: fiscalStart, end: fiscalEnd };
  }
});
```

### 3. `RangeValidator`

Pure validation functions:

```typescript
import { 
  validateRangeOrder,
  validateDateBounds,
  isDateDisabled 
} from '@oneluiz/dual-datepicker';

const result = validateRangeOrder(start, end);
if (!result.valid) {
  console.error(result.error);
}
```

## 🚀 Usage Examples

### Example 1: Service Integration (No UI)

```typescript
@Injectable({ providedIn: 'root' })
export class SalesService {
  private rangeStore = inject(DualDateRangeStore);
  private http = inject(HttpClient);

  constructor() {
    // Set default range
    this.rangeStore.applyPreset('THIS_MONTH');
  }

  getSales() {
    const range = this.rangeStore.range();
    return this.http.get(`/api/sales`, {
      params: {
        start: range.start,
        end: range.end
      }
    });
  }

  // Expose range for components
  get dateRange() {
    return this.rangeStore.range;
  }
}
```

### Example 2: Dashboard Filter

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <!-- Filter controls -->
      <div class="filters">
        <button (click)="applyPreset('TODAY')">Today</button>
        <button (click)="applyPreset('THIS_WEEK')">This Week</button>
        <button (click)="applyPreset('THIS_MONTH')">This Month</button>
      </div>

      <!-- All charts share same range -->
      <app-sales-chart />
      <app-revenue-chart />
      <app-metrics-chart />

      <p>Showing: {{ rangeText() }}</p>
    </div>
  `
})
export class DashboardComponent {
  private rangeStore = inject(DualDateRangeStore);

  rangeText = this.rangeStore.rangeText;

  applyPreset(key: string) {
    this.rangeStore.applyPreset(key);
    // All child charts will react automatically via shared store
  }
}
```

### Example 3: SSR-Compatible

```typescript
// Works in SSR because it doesn't depend on window/document
export function dashboardLoader(): Promise<DashboardData> {
  const rangeStore = inject(DualDateRangeStore);
  const http = inject(HttpClient);

  rangeStore.applyPreset('THIS_MONTH');
  const range = rangeStore.range();

  return firstValueFrom(
    http.get(`/api/dashboard`, {
      params: { start: range.start, end: range.end }
    })
  );
}
```

### Example 4: Global App Filter

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // Single global instance
    DualDateRangeStore,
    
    // Configure default
    {
      provide: APP_INITIALIZER,
      useFactory: (store: DualDateRangeStore) => () => {
        store.configure({
          minDate: new Date(2020, 0, 1),
          maxDate: new Date()
        });
        store.applyPreset('LAST_30_DAYS');
      },
      deps: [DualDateRangeStore],
      multi: true
    }
  ]
};
```

### Example 5: Route Guard

```typescript
export const dateRangeGuard: CanActivateFn = () => {
  const rangeStore = inject(DualDateRangeStore);
  
  // Ensure valid range before navigation
  if (!rangeStore.isValid()) {
    rangeStore.applyPreset('THIS_MONTH');
  }
  
  return true;
};
```

### Example 6: Form Integration

```typescript
@Component({
  template: `
    <form [formGroup]="reportForm">
      <input type="date" formControlName="reportStart">
      <input type="date" formControlName="reportEnd">
      <button (click)="generateReport()">Generate</button>
    </form>
  `
})
export class ReportComponent {
  private rangeStore = inject(DualDateRangeStore);
  
  reportForm = new FormGroup({
    reportStart: new FormControl(''),
    reportEnd: new FormControl('')
  });

  constructor() {
    // Sync store with form
    effect(() => {
      const range = this.rangeStore.range();
      this.reportForm.patchValue({
        reportStart: range.start,
        reportEnd: range.end
      }, { emitEvent: false });
    });
  }

  generateReport() {
    const range = this.rangeStore.range();
    console.log('Generating report for:', range);
  }
}
```

### Example 7: Custom Presets

```typescript
// Register fiscal year preset
presetEngine.register('FISCAL_YEAR', {
  resolve: (now) => {
    // Fiscal year starts July 1
    const fiscalYear = now.getMonth() >= 6 
      ? now.getFullYear() 
      : now.getFullYear() - 1;
    
    return {
      start: new Date(fiscalYear, 6, 1),    // July 1
      end: new Date(fiscalYear + 1, 5, 30)  // June 30
    };
  }
});

// Use it
rangeStore.applyPreset('FISCAL_YEAR');
```

## 🎯 Benefits

### 1. **Testability**

```typescript
describe('DualDateRangeStore', () => {
  it('should validate range order', () => {
    TestBed.configureTestingModule({});
    const store = TestBed.inject(DualDateRangeStore);
    
    store.setStart(new Date(2026, 0, 10));
    store.setEnd(new Date(2026, 0, 5));
    
    expect(store.isValid()).toBe(false);
  });
});
```

### 2. **Reusability**

Same logic for:
- Dashboard filters
- Report generators  
- API clients
- Export tools
- Analytics

### 3. **Performance**

Signals ensure:
- Minimal re-renders
- Computed values cached
- No unnecessary calculations

### 4. **Type Safety**

```typescript
const range: DateRangeState = rangeStore.range();
// ✅ Always typed correctly
```

## 🔄 Migration Path

### Current (v3.4.0 and below)

```typescript
<ngx-dual-datepicker
  [startDate]="startDate"
  [endDate]="endDate"
  (dateRangeChange)="onDateChange($event)">
</ngx-dual-datepicker>
```

### New Headless (v3.5.0+)

```typescript
// Option 1: Keep using component (backward compatible)
<ngx-dual-datepicker
  [startDate]="startDate"
  [endDate]="endDate"
  (dateRangeChange)="onDateChange($event)">
</ngx-dual-datepicker>

// Option 2: Use store directly (NEW - headless)
const rangeStore = inject(DualDateRangeStore);
rangeStore.applyPreset('THIS_MONTH');
const range = rangeStore.range();
```

### Future (v4.0.0)

Component will internally use store (planned for v4.0):

```typescript
// Component will accept store injection
<ngx-dual-datepicker [store]="myCustomStore">
</ngx-dual-datepicker>
```

## 📚 API Reference

### DualDateRangeStore

**Signals** (read-only):
- `startDate()` - Current start date
- `endDate()` - Current end date  
- `range()` - ISO range object
- `isValid()` - Validation state
- `rangeText()` - Display text

**Methods**:
- `setStart(date)` - Set start date
- `setEnd(date)` - Set end date
- `setRange(start, end)` - Set both dates
- `applyPreset(key)` - Apply preset by key
- `reset()` - Clear selection
- `configure(config)` - Set validation rules

### PresetEngine

**Methods**:
- `resolve(key, now?)` - Get range for preset
- `register(key, preset)` - Add custom preset
- `getPresetKeys()` - List all presets

**Built-in Presets**:
- `TODAY`, `YESTERDAY`
- `LAST_7_DAYS`, `LAST_30_DAYS`, `LAST_90_DAYS`
- `THIS_WEEK`, `LAST_WEEK`
- `THIS_MONTH`, `LAST_MONTH`, `MONTH_TO_DATE`
- `THIS_QUARTER`, `LAST_QUARTER`, `QUARTER_TO_DATE`
- `THIS_YEAR`, `LAST_YEAR`, `YEAR_TO_DATE`

## 🎨 Use Cases

Perfect for:

- 📊 **BI Dashboards** - Global date filter
- 🏢 **ERP Systems** - Fiscal year filtering
- 💰 **POS Systems** - Daily/weekly reports
- 📈 **Analytics** - Range-based queries
- 🗄️ **Data Export** - Batch processing
- 📅 **Booking Systems** - Availability checks

## 🔮 Roadmap

- ✅ v3.5.0 - Headless core architecture
- 🔄 v3.6.0 - Timezone adapter support
- 🔄 v4.0.0 - Component refactor to use store internally
- 🔄 v4.1.0 - Multi-store support (compare ranges)

## 💡 Tips

1. **Single source of truth**: Inject store at root level
2. **Reactive by default**: Use signals in templates
3. **Test easily**: Mock store in tests
4. **Extend presets**: Register custom business logic
5. **SSR-safe**: Works in Node.js environment

---

## 🤝 Feedback

This is a **NEW architecture** in v3.5.0. Please report issues or suggestions!

GitHub: https://github.com/oneluiz/ng-dual-datepicker
