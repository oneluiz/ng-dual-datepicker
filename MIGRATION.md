# Migration Guide to Headless Architecture (v3.5.0)

## Do I need to migrate?

**NO!** Your existing code will work unchanged.

The headless architecture is an **opt-in feature**. You can:
- Continue using the component as before (nothing changes)
- Gradually adopt headless patterns where beneficial
- Mix both approaches in the same app

## What Changed?

### Before (v3.4.0 and below)

All logic lived inside the component:

```typescript
<ngx-dual-datepicker
  [startDate]="startDate"
  [endDate]="endDate"
  (dateRangeChange)="onRangeChange($event)">
</ngx-dual-datepicker>
```

### After (v3.5.0+)

Logic can optionally live in a separate store:

```typescript
// Option 1: Keep using component (backward compatible)
<ngx-dual-datepicker
  [startDate]="startDate"
  [endDate]="endDate"
  (dateRangeChange)="onRangeChange($event)">
</ngx-dual-datepicker>

// Option 2: Use headless store (NEW)
const rangeStore = inject(DualDateRangeStore);
rangeStore.applyPreset('THIS_MONTH');
```

## Migration Patterns

### Pattern 1: Component → Service with Store

**Before:**

```typescript
@Component({
  template: `
    <ngx-dual-datepicker (dateRangeChange)="loadSales($event)">
    </ngx-dual-datepicker>
  `
})
export class SalesComponent {
  loadSales(range: DateRange) {
    this.http.get(`/api/sales`, {
      params: { start: range.startDate, end: range.endDate }
    }).subscribe(data => this.sales = data);
  }
}
```

**After (Headless):**

```typescript
// sales.service.ts
@Injectable({ providedIn: 'root' })
export class SalesService {
  private rangeStore = inject(DualDateRangeStore);
  private http = inject(HttpClient);

  constructor() {
    this.rangeStore.applyPreset('THIS_MONTH');
  }

  getSales() {
    const range = this.rangeStore.range();
    return this.http.get(`/api/sales`, {
      params: { start: range.start, end: range.end }
    });
  }

  get dateRange() {
    return this.rangeStore.range;
  }
}

// sales.component.ts
@Component({
  template: `
    <div>
      <button (click)="changeRange('TODAY')">Today</button>
      <button (click)="changeRange('THIS_MONTH')">This Month</button>
      <p>Range: {{ rangeText() }}</p>
    </div>
  `
})
export class SalesComponent {
  private sales = inject(SalesService);
  
  rangeText = computed(() => {
    const range = this.sales.dateRange();
    return `${range.start} - ${range.end}`;
  });

  changeRange(preset: string) {
    this.sales.setPreset(preset);
    // Automatically triggers getSales() via effect
  }
}
```

### Pattern 2: Multiple Components → Shared State

**Before (components don't share state):**

```typescript
// Each component has own date picker
<app-sales-chart [startDate]="start" [endDate]="end" />
<app-revenue-chart [startDate]="start" [endDate]="end" />
<app-metrics-chart [startDate]="start" [endDate]="end" />
```

**After (Headless - shared global state):**

```typescript
// dashboard.component.ts
@Component({
  template: `
    <div class="filters">
      <button (click)="setPreset('TODAY')">Today</button>
      <button (click)="setPreset('THIS_MONTH')">This Month</button>
    </div>

    <!-- All charts automatically sync via shared store -->
    <app-sales-chart />
    <app-revenue-chart />
    <app-metrics-chart />
  `
})
export class DashboardComponent {
  private rangeStore = inject(DualDateRangeStore);

  setPreset(key: string) {
    this.rangeStore.applyPreset(key);
    // All child charts update automatically
  }
}

// Each chart component
@Component({ /* ... */ })
export class SalesChartComponent {
  private rangeStore = inject(DualDateRangeStore);

  constructor() {
    effect(() => {
      const range = this.rangeStore.range();
      // Reload chart data
      this.loadData(range);
    });
  }
}
```

### Pattern 3: Presets → Headless Presets

**Before:**

```typescript
customPresets: PresetConfig[] = [
  { label: 'Today', getValue: () => getToday() },
  { label: 'This Month', getValue: () => getThisMonth() }
];
```

**After (Headless):**

```typescript
// Register once, use anywhere
presetEngine.register('FISCAL_YEAR', {
  resolve: (now) => {
    // Your logic
    return { start, end };
  }
});

// Use in service
rangeStore.applyPreset('FISCAL_YEAR');

// Or in component
<ngx-dual-datepicker /> // Will still work with old presets
```

## When to Migrate?

### Use Headless Architecture When:

- ✅ You need date filtering in services
- ✅ Building SSR applications
- ✅ Need global state across multiple components
- ✅ Want to test date logic without DOM
- ✅ Building dashboard with synchronized filters

### Keep Using Component When:

- ✅ Simple forms with local state
- ✅ One-off date pickers
- ✅ Current implementation works fine
- ✅ Don't need global state

## Gradual Migration Strategy

### Step 1: Install v3.5.0

```bash
npm install @oneluiz/dual-datepicker@3.5.0
```

### Step 2: Identify Use Cases

Look for:
- Services that filter by date
- Multiple components needing same range
- Complex preset logic
- SSR requirements

### Step 3: Migrate High-Value Areas First

Start with:
1. Global dashboard filters
2. API service layers
3. Reporting engines

Keep component-based for:
1. Simple forms
2. One-off pickers
3. Legacy code that works

### Step 4: Mix Both Approaches

You can use both in the same app:

```typescript
// Headless for global state
const globalRange = inject(DualDateRangeStore);

// Component for simple forms
<ngx-dual-datepicker [formControl]="reportDate" />
```

## FAQ

### Q: Will my existing code break?

**A:** No. 100% backward compatible.

### Q: Do I have to migrate?

**A:** No. Migration is optional and recommended only where beneficial.

### Q: Can I mix both patterns?

**A:** Yes! Use headless for services/global state, keep component for simple forms.

### Q: When should I migrate?

**A:** When you need:
- Service-layer filtering
- Global state management  
- SSR compatibility
- Multiple components sharing range

### Q: What about v4.0?

**A:** In v4.0, the component will internally use the store (but API stays same).

### Q: How do I test headless code?

**A:** Much easier! Just inject and test the store:

```typescript
it('should apply preset', () => {
  const store = TestBed.inject(DualDateRangeStore);
  store.applyPreset('THIS_MONTH');
  expect(store.range().start).toBe('2026-02-01');
});
```

## Need Help?

- 📖 [Headless Architecture Guide](HEADLESS.md)
- 💻 [Code Examples](HEADLESS_EXAMPLES.ts)
- 🐛 [Report Issues](https://github.com/oneluiz/ng-dual-datepicker/issues)

## Roadmap

- ✅ v3.5.0 - Headless core architecture
- 🔄 v3.6.0 - Timezone adapters
- 🔄 v4.0.0 - Component refactored to use store internally
- 🔄 v4.1.0 - Multi-store comparison support
