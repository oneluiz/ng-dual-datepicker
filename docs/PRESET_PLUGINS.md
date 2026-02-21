# Preset Plugin Architecture

**Version**: 3.6.0  
**Status**: ✅ Production Ready  
**Impact**: Extensible date range presets following Open/Closed Principle

---

## 🎯 Purpose

The **Preset Plugin System** enables industry-specific date range presets without modifying library code:

1. **Extensibility**: Add custom presets via plugins
2. **Open/Closed Principle**: Extend without modifying core
3. **Industry Packages**: Distribute presets as external npm packages
4. **Dynamic Registration**: Add/remove presets at runtime
5. **Backward Compatibility**: Existing code works unchanged

---

## ⚠️ The Problem (Before v3.6.0)

### Closed Architecture

```typescript
// ❌ PresetEngine hardcoded all presets
export class PresetEngine {
  private registerBuiltInPresets(): void {
    this.register('TODAY', ...);
    this.register('LAST_7_DAYS', ...);
    // ... 18 presets hardcoded
  }
}

// ❌ To add "THIS_FISCAL_QUARTER":
// 1. Fork the library
// 2. Modify preset.engine.ts
// 3. Maintain fork forever
// 4. Can't distribute as package
```

### Limitations

- **Enterprise blockers**: No fiscal/hotel/logistics presets
- **Violates Open/Closed**: Must modify core to extend
- **No external packages**: Can't distribute industry presets
- **Testing friction**: Hard to mock/override presets

---

## ✅ The Solution: Plugin Architecture

### New Architecture (v3.6.0)

```
RangePresetPlugin (interface)
    ↓
PresetRegistry (service) - Map<string, RangePresetPlugin>
    ↓
PresetEngine (refactored) - Uses registry for resolution
    ↓
DualDateRangeStore - No changes, backward compatible
```

### Key Components

1. **RangePresetPlugin** - Interface all presets implement
2. **PresetRegistry** - Central registry for plugin management
3. **Built-in Presets** - 18 standard presets as plugins
4. **Provider Functions** - Auto-registration via DI
5. **PresetEngine** - Refactored to use registry

---

## 📦 RangePresetPlugin Interface

```typescript
export interface RangePresetPlugin {
  /**
   * Unique identifier (SCREAMING_SNAKE_CASE)
   * Examples: 'TODAY', 'FISCAL_Q1', 'CHECK_IN_WEEK'
   */
  key: string;

  /**
   * Resolve date range using injected dependencies
   * 
   * @param clock - DateClock for SSR-safe time access
   * @param adapter - DateAdapter for timezone-safe operations
   * @returns Date range with start and end dates
   */
  resolve(clock: DateClock, adapter: DateAdapter): DateRange;
}
```

### Interface Benefits

- **SSR-Safe**: Uses DateClock instead of `new Date()`
- **Timezone-Safe**: Uses DateAdapter for date operations
- **Testable**: Pure function, no side effects
- **Type-Safe**: Full TypeScript support

---

## 🚀 Usage

### Built-in Presets (Zero Config)

Built-in presets work automatically:

```typescript
import { DualDateRangeStore } from '@oneluiz/dual-datepicker/core';

export class DashboardComponent {
  private rangeStore = inject(DualDateRangeStore);

  ngOnInit() {
    // ✅ Works automatically, no setup needed
    this.rangeStore.applyPreset('LAST_30_DAYS');
    
    const range = this.rangeStore.range();
    console.log(range); // { start: "2026-01-22", end: "2026-02-21" }
  }
}
```

**Built-in Presets** (18 total):
- **Daily**: TODAY, YESTERDAY
- **Weekly**: LAST_7_DAYS, LAST_14_DAYS, THIS_WEEK, LAST_WEEK
- **Monthly**: LAST_30_DAYS, LAST_60_DAYS, LAST_90_DAYS, THIS_MONTH, LAST_MONTH, MONTH_TO_DATE
- **Quarterly**: THIS_QUARTER, LAST_QUARTER, QUARTER_TO_DATE
- **Yearly**: THIS_YEAR, LAST_YEAR, YEAR_TO_DATE

---

### Custom Presets

#### Step 1: Define Plugin

```typescript
import { RangePresetPlugin } from '@oneluiz/dual-datepicker/core';

const THIS_FISCAL_QUARTER: RangePresetPlugin = {
  key: 'THIS_FISCAL_QUARTER',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const month = adapter.getMonth(now); // 0-11
    const year = adapter.getYear(now);
    
    // Fiscal year starts April (month 3)
    const fiscalMonth = (month + 9) % 12;
    const quarterStartMonth = Math.floor(fiscalMonth / 3) * 3;
    const calendarMonth = (quarterStartMonth - 9 + 12) % 12;
    
    const fiscalYear = month < 3 ? year - 1 : year;
    
    const start = new Date(fiscalYear, calendarMonth, 1);
    const end = new Date(fiscalYear, calendarMonth + 3, 0);
    
    return {
      start: adapter.normalize(start),
      end: adapter.normalize(end)
    };
  }
};
```

#### Step 2: Register via Provider

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideCustomPresets } from '@oneluiz/dual-datepicker/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCustomPresets([THIS_FISCAL_QUARTER])
  ]
};
```

#### Step 3: Use in Component

```typescript
export class FiscalDashboardComponent {
  private rangeStore = inject(DualDateRangeStore);

  loadQuarterlyReport() {
    this.rangeStore.applyPreset('THIS_FISCAL_QUARTER');
    const range = this.rangeStore.range();
    // { start: "2026-01-01", end: "2026-03-31" }
  }
}
```

---

## 🏢 Industry Examples

### Fiscal Year Presets

```typescript
const FISCAL_PRESETS: RangePresetPlugin[] = [
  {
    key: 'THIS_FISCAL_QUARTER',
    resolve: (clock, adapter) => {
      // Fiscal year starting April
      // ... implementation
    }
  },
  {
    key: 'FISCAL_YEAR_TO_DATE',
    resolve: (clock, adapter) => {
      // From fiscal year start to today
      // ... implementation
    }
  }
];

// app.config.ts
providers: [provideCustomPresets(FISCAL_PRESETS)]
```

### Hotel/Hospitality Presets

```typescript
const HOTEL_PRESETS: RangePresetPlugin[] = [
  {
    key: 'CHECK_IN_WEEK',
    resolve: (clock, adapter) => {
      // Friday to Friday
      const now = clock.now();
      const dayOfWeek = adapter.getDay(now);
      const daysToFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
      const nextFriday = adapter.addDays(now, daysToFriday);
      const followingFriday = adapter.addDays(nextFriday, 7);
      return { start: nextFriday, end: followingFriday };
    }
  },
  {
    key: 'NEXT_30_NIGHTS',
    resolve: (clock, adapter) => {
      const now = clock.now();
      const tomorrow = adapter.addDays(now, 1);
      const end = adapter.addDays(tomorrow, 30);
      return { start: tomorrow, end };
    }
  }
];

providers: [provideCustomPresets(HOTEL_PRESETS)]
```

### Logistics/Shipping Presets

```typescript
const LOGISTICS_PRESETS: RangePresetPlugin[] = [
  {
    key: 'SHIPPING_WEEK',
    resolve: (clock, adapter) => {
      // Tuesday to Monday
      // ... implementation
    }
  },
  {
    key: 'DELIVERY_WINDOW_3_5_DAYS',
    resolve: (clock, adapter) => {
      const now = clock.now();
      const start = adapter.addDays(now, 3);
      const end = adapter.addDays(now, 5);
      return { start, end };
    }
  }
];

providers: [provideCustomPresets(LOGISTICS_PRESETS)]
```

---

## 📦 External Preset Packages

### Creating a Package

```typescript
// @acme/fiscal-presets/index.ts
import { RangePresetPlugin, providePresetPackage } from '@oneluiz/dual-datepicker/core';

export const FISCAL_PRESETS: RangePresetPlugin[] = [
  { key: 'THIS_FISCAL_QUARTER', resolve: ... },
  { key: 'FISCAL_YEAR_TO_DATE', resolve: ... }
];

export function provideFiscalPresets() {
  return providePresetPackage('@acme/fiscal-presets', FISCAL_PRESETS);
}
```

### Using External Package

```typescript
// Install
npm install @acme/fiscal-presets

// app.config.ts
import { provideFiscalPresets } from '@acme/fiscal-presets';

export const appConfig: ApplicationConfig = {
  providers: [provideFiscalPresets()]
};

// Use in component
store.applyPreset('THIS_FISCAL_QUARTER');
```

---

## 🧪 Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { PresetRegistry, NativeDateAdapter } from '@oneluiz/dual-datepicker/core';

describe('Fiscal Quarter Preset', () => {
  let registry: PresetRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideCustomPresets([THIS_FISCAL_QUARTER])]
    });
    registry = TestBed.inject(PresetRegistry);
  });

  it('should register fiscal quarter preset', () => {
    expect(registry.has('THIS_FISCAL_QUARTER')).toBe(true);
  });

  it('should resolve fiscal quarter correctly', () => {
    const preset = registry.get('THIS_FISCAL_QUARTER')!;
    
    // Mock clock for deterministic test
    const testDate = new Date(2026, 1, 21); // Feb 21, 2026
    const clock = { now: () => testDate };
    const adapter = new NativeDateAdapter();
    
    const result = preset.resolve(clock, adapter);
    
    // Fiscal Q4 (Jan-Mar 2026)
    expect(adapter.toISODate(result.start)).toBe('2026-01-01');
    expect(adapter.toISODate(result.end)).toBe('2026-03-31');
  });
});
```

---

## 🔧 Dynamic Registration (Advanced)

```typescript
export class PresetManagerService {
  private registry = inject(PresetRegistry);

  registerCustomPreset(key: string, logic: (now: Date) => { start: Date; end: Date }) {
    this.registry.register({
      key: key.toUpperCase(),
      resolve: (clock, adapter) => {
        const now = clock.now();
        const result = logic(now);
        return {
          start: adapter.normalize(result.start),
          end: adapter.normalize(result.end)
        };
      }
    });
  }

  unregisterPreset(key: string) {
    this.registry.unregister(key);
  }

  listAllPresets(): string[] {
    return this.registry.getAllKeys();
  }
}

// Usage
export class AdminPanelComponent {
  private presetManager = inject(PresetManagerService);

  addCompanyPreset() {
    this.presetManager.registerCustomPreset('COMPANY_REPORTING_PERIOD', (now) => {
      const start = new Date(now.getFullYear(), 0, 15);
      const end = new Date(now.getFullYear(), 11, 14);
      return { start, end };
    });
  }
}
```

---

## 📚 API Reference

### RangePresetPlugin

```typescript
interface RangePresetPlugin {
  key: string;
  resolve(clock: DateClock, adapter: DateAdapter): DateRange;
}
```

### PresetRegistry

```typescript
@Injectable({ providedIn: 'root' })
class PresetRegistry {
  register(plugin: RangePresetPlugin): void;
  registerAll(plugins: RangePresetPlugin[]): void;
  get(key: string): RangePresetPlugin | undefined;
  has(key: string): boolean;
  getAll(): RangePresetPlugin[];
  getAllKeys(): string[];
  count(): number;
  unregister(key: string): boolean;
  clear(): void;
}
```

### Provider Functions

```typescript
// Built-in presets (internal use)
function provideBuiltInPresets(): EnvironmentProviders;

// Custom presets
function provideCustomPresets(presets: RangePresetPlugin[]): EnvironmentProviders;

// External packages
function providePresetPackage(packageName: string, presets: RangePresetPlugin[]): EnvironmentProviders;
```

---

## 🔄 Migration Guide

### No Migration Required!

Existing code works unchanged:

```typescript
// ✅ Still works exactly the same
const store = inject(DualDateRangeStore);
store.applyPreset('LAST_30_DAYS');
```

### New Features (Optional)

```typescript
// ✅ Add custom presets
providers: [
  provideCustomPresets([MY_CUSTOM_PRESET])
]

// ✅ Direct registry access
const registry = inject(PresetRegistry);
registry.register(MY_PLUGIN);
```

---

## ⚖️ Before vs After Comparison

### Before (v3.5.1)

```typescript
// ❌ Presets hardcoded in PresetEngine
private registerBuiltInPresets(): void {
  this.register('TODAY', { resolve: (now) => ... });
  this.register('LAST_7_DAYS', { resolve: (now) => ... });
  // ... 18 presets hardcoded
}

// ❌ Can't add fiscal presets without forking
// ❌ Can't distribute as external packages
// ❌ Violates Open/Closed Principle
```

### After (v3.6.0)

```typescript
// ✅ Presets are plugins
const THIS_FISCAL_QUARTER: RangePresetPlugin = {
  key: 'THIS_FISCAL_QUARTER',
  resolve: (clock, adapter) => { ... }
};

// ✅ Register via provider
providers: [provideCustomPresets([THIS_FISCAL_QUARTER])]

// ✅ External packages possible
// ✅ Open/Closed Principle respected
// ✅ Fully extensible
```

---

## 🎨 Design Principles

### Open/Closed Principle

✅ **Open for extension**: Add new presets via plugins  
✅ **Closed for modification**: Core never changes

### Dependency Injection

✅ PresetRegistry is injected  
✅ DateClock injected for SSR-safety  
✅ DateAdapter injected for timezone-safety

### Single Responsibility

✅ RangePresetPlugin: Define preset logic  
✅ PresetRegistry: Manage plugin collection  
✅ PresetEngine: Resolve presets via registry  
✅ Provider Functions: Auto-register plugins

### Interface Segregation

✅ Minimal interface (key + resolve)  
✅ No unnecessary dependencies  
✅ Easy to implement

---

## 🚀 Benefits

### For Library Users

- ✅ Zero config for built-in presets
- ✅ Easy custom preset creation
- ✅ Industry-specific presets available as packages
- ✅ Dynamic preset management
- ✅ Backward compatible

### For Enterprise

- ✅ Fiscal year support
- ✅ Hotel/hospitality workflows
- ✅ Logistics/shipping schedules
- ✅ Custom business logic
- ✅ Multi-tenant preset management

### For Library Maintainers

- ✅ No more feature requests for industry presets
- ✅ Extensible without code changes
- ✅ Ecosystem of external packages
- ✅ Cleaner architecture
- ✅ Easier testing

---

## 💡 Best Practices

### 1. Use DateAdapter for All Date Operations

```typescript
// ❌ Don't bypass adapter
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

// ✅ Use adapter methods
const tomorrow = adapter.addDays(now, 1);
```

### 2. Use DateClock for Current Time

```typescript
// ❌ Don't use new Date() directly
const now = new Date();

// ✅ Use injected clock
const now = clock.now();
```

### 3. Normalize All Dates

```typescript
// ✅ Always normalize dates
return {
  start: adapter.normalize(start),
  end: adapter.normalize(end)
};
```

### 4. Test with Mock Clock

```typescript
// ✅ Deterministic testing
const testDate = new Date(2026, 1, 21);
const clock = { now: () => testDate };
const result = preset.resolve(clock, adapter);
```

---

## 🔮 Future Enhancements

Potential future additions (feedback welcome):

- **Preset metadata**: Description, icon, category
- **Preset validation**: Min/max range constraints
- **Preset composition**: Combine multiple presets
- **Preset discovery**: Auto-discover from packages
- **Visual preset builder**: UI for creating presets

---

## 🧩 Related Documentation

- [Timezone Adapter](./TIMEZONE_ADAPTER.md) - DateAdapter system
- [SSR Clock Injection](./SSR_CLOCK_INJECTION.md) - DateClock system
- [Headless Architecture](./HEADLESS.md) - DualDateRangeStore

---

## ❓ FAQ

### Q: Do I need to change existing code?
**A**: No, existing code works unchanged. Custom presets are optional.

### Q: Can I override built-in presets?
**A**: Yes, register a plugin with the same key (last registration wins).

### Q: Are presets SSR-safe?
**A**: Yes, all plugins use DateClock injection for deterministic resolution.

### Q: Are presets timezone-safe?
**A**: Yes, all plugins use DateAdapter for timezone-safe operations.

### Q: Can I distribute presets as npm packages?
**A**: Yes, use `providePresetPackage()` to create external packages.

### Q: How do I test custom presets?
**A**: Mock DateClock and DateAdapter for deterministic tests.

---

**Next Steps**:
- [View Examples](../PRESET_PLUGIN_EXAMPLES.ts)
- [Install Library](../README.md#installation)
- [Create Custom Preset](#custom-presets)
- [Distribute as Package](#external-preset-packages)
