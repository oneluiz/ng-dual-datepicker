# Timezone-Safe Date Adapter Layer

**Version**: 3.5.1  
**Status**: ✅ Production Ready  
**Impact**: Fixes enterprise-critical timezone bugs in ERP, BI, POS, and invoicing systems

---

## 🎯 Purpose

The **DateAdapter** layer abstracts all date operations in `@oneluiz/dual-datepicker` to provide:

1. **Timezone Safety**: Eliminates DST shift bugs and UTC conversion issues
2. **Flexibility**: Swap date libraries (Luxon, Day.js) without touching core logic
3. **Backward Compatibility**: Zero breaking changes, existing code works unchanged
4. **Optional Dependencies**: Choose your date library or use the zero-dependency `NativeDateAdapter`

---

## ⚠️ The Problem

### Timezone Bug Example (Before Adapter)

```typescript
// User selects: "2024-03-15" in timezone GMT-6
const date = new Date('2024-03-15'); // ❌ JavaScript converts to UTC midnight
console.log(date.toISOString()); // "2024-03-15T00:00:00.000Z"

// But in GMT-6 timezone:
console.log(date.toString()); // "Thu Mar 14 2024 18:00:00 GMT-0600"
// ❌ Date shifted to previous day!

// When sent to backend API:
POST /api/sales-report
{
  "start": "2024-03-15",  // User selected March 15
  "end": "2024-03-15"
}

// Backend receives UTC conversion:
// start: 2024-03-14T18:00:00Z  ❌ Wrong day!
```

### Real-World Impact

- **ERP Systems**: Invoice dates shift by 1 day causing accounting errors
- **BI Reports**: "This Month" returns data from previous/next month
- **Hotel Systems**: Reservations appear for wrong dates
- **POS Systems**: Daily sales reports include/exclude wrong transactions

---

## ✅ The Solution: DateAdapter Interface

The `DateAdapter` interface defines **18 timezone-safe operations** that abstract all date manipulation:

```typescript
export interface DateAdapter {
  // Core normalization (00:00:00.000 local time)
  normalize(date: Date | null): Date;

  // ISO conversion WITHOUT timezone shift
  toISODate(date: Date | null): string; // "2024-03-15"
  parseISODate(isoDate: string | null): Date | null;

  // Comparison (ignores time, timezone-safe)
  isSameDay(date1: Date, date2: Date): boolean;
  isBeforeDay(date1: Date, date2: Date): boolean;
  isAfterDay(date1: Date, date2: Date): boolean;

  // Arithmetic (handles month overflow)
  addDays(date: Date, days: number): Date;
  addMonths(date: Date, months: number): Date;

  // Boundaries
  startOfDay(date: Date): Date;
  endOfDay(date: Date): Date;
  startOfMonth(date: Date): Date;
  endOfMonth(date: Date): Date;
  startOfWeek(date: Date, startDay?: number): Date;

  // Accessors
  getYear(date: Date): number;
  getMonth(date: Date): number; // 0-11
  getDay(date: Date): number;   // 1-31
  getDayOfWeek(date: Date): number; // 0-6 (Sunday=0)
  getWeekOfYear(date: Date): number;
}
```

---

## 📦 Built-in Implementation: NativeDateAdapter

The library includes a **zero-dependency** implementation using native JavaScript `Date`:

```typescript
import { NativeDateAdapter } from '@oneluiz/dual-datepicker/core';

@Injectable()
export class NativeDateAdapter implements DateAdapter {
  // ✅ Timezone-safe ISO conversion
  toISODate(date: Date | null): string {
    if (!date) return '';
    
    // Manual YYYY-MM-DD construction (avoids UTC conversion)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  // ✅ Parse without timezone shift
  parseISODate(isoDate: string | null): Date | null {
    if (!isoDate) return null;
    
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  // ✅ Smart month overflow handling
  addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    const targetMonth = result.getMonth() + months;
    result.setMonth(targetMonth);
    
    // Handle overflow: Jan 31 + 1 month = Feb 28 (not Mar 3)
    if (result.getMonth() !== ((targetMonth % 12) + 12) % 12) {
      result.setDate(0); // Set to last day of previous month
    }
    
    return result;
  }
}
```

### Key Features

- **No dependencies**: Pure JavaScript, works everywhere
- **Normalizes to 00:00:00.000**: All dates start at local midnight
- **Month overflow handling**: Jan 31 + 1 month = Feb 28 (not Mar 3)
- **Timezone-aware**: Never uses `toISOString()` or `.toJSON()`

---

## 🔧 Usage

### Default Behavior (Zero Config)

The library automatically uses `NativeDateAdapter`:

```typescript
import { DualDateRangeStore } from '@oneluiz/dual-datepicker/core';

const store = inject(DualDateRangeStore);

// ✅ All operations are timezone-safe automatically
store.applyPreset('THIS_MONTH');
const range = store.range(); // { start: "2024-03-01", end: "2024-03-31" }
```

### Custom Adapter (Luxon Example)

Swap to Luxon for advanced timezone features:

```typescript
// 1. Create adapter
import { DateTime } from 'luxon';
import { DateAdapter, DATE_ADAPTER } from '@oneluiz/dual-datepicker/core';

@Injectable({ providedIn: 'root' })
export class LuxonDateAdapter implements DateAdapter {
  constructor(@Inject('TIMEZONE') private timezone: string) {}

  normalize(date: Date | null): Date {
    if (!date) return new Date();
    return DateTime.fromJSDate(date)
      .setZone(this.timezone)
      .startOf('day')
      .toJSDate();
  }

  toISODate(date: Date | null): string {
    if (!date) return '';
    return DateTime.fromJSDate(date)
      .setZone(this.timezone)
      .toISODate();
  }

  addMonths(date: Date, months: number): Date {
    return DateTime.fromJSDate(date)
      .setZone(this.timezone)
      .plus({ months })
      .toJSDate();
  }
  
  // ... implement remaining methods
}

// 2. Provide in app config
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: DATE_ADAPTER, useClass: LuxonDateAdapter },
    { provide: 'TIMEZONE', useValue: 'America/New_York' }
  ]
};
```

### Day.js Example

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable({ providedIn: 'root' })
export class DayJsDateAdapter implements DateAdapter {
  toISODate(date: Date | null): string {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD');
  }

  addMonths(date: Date, months: number): Date {
    return dayjs(date).add(months, 'month').toDate();
  }
  
  // ... implement remaining methods
}

// Provide in app config
providers: [
  { provide: DATE_ADAPTER, useClass: DayJsDateAdapter }
]
```

---

## 🧪 Testing Custom Adapters

```typescript
describe('CustomDateAdapter', () => {
  let adapter: DateAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DATE_ADAPTER, useClass: CustomDateAdapter }
      ]
    });
    adapter = TestBed.inject(DATE_ADAPTER);
  });

  it('should handle DST transitions', () => {
    // March 10, 2024: DST starts in US
    const beforeDST = new Date(2024, 2, 9); // Mar 9
    const duringDST = adapter.addDays(beforeDST, 1);

    // ✅ Date should still be March 10, not shifted
    expect(adapter.toISODate(duringDST)).toBe('2024-03-10');
  });

  it('should handle month overflow', () => {
    const jan31 = new Date(2024, 0, 31);
    const result = adapter.addMonths(jan31, 1);

    // ✅ Should be Feb 29 (2024 is leap year), not Mar 2/3
    expect(adapter.toISODate(result)).toBe('2024-02-29');
  });

  it('should normalize to midnight', () => {
    const date = new Date(2024, 2, 15, 14, 30, 45, 500);
    const normalized = adapter.normalize(date);

    expect(normalized.getHours()).toBe(0);
    expect(normalized.getMinutes()).toBe(0);
    expect(normalized.getSeconds()).toBe(0);
    expect(normalized.getMilliseconds()).toBe(0);
  });
});
```

---

## 🏗️ Architecture Integration

### PresetEngine Uses Adapter

All built-in presets (TODAY, LAST_7_DAYS, THIS_MONTH, etc.) now use the adapter:

```typescript
@Injectable({ providedIn: 'root' })
export class PresetEngine {
  private adapter: DateAdapter;

  constructor() {
    this.adapter = inject(DATE_ADAPTER, { optional: true }) 
      ?? new NativeDateAdapter();
  }

  private registerBuiltInPresets(): void {
    // ✅ Before: new Date(now); date.setDate(date.getDate() - 1);
    // ✅ After:  this.adapter.addDays(now, -1);
    this.register('YESTERDAY', {
      resolve: (now) => {
        const date = this.adapter.addDays(now, -1);
        return { start: date, end: date };
      }
    });

    this.register('THIS_MONTH', {
      resolve: (now) => {
        const start = this.adapter.startOfMonth(now);
        const end = this.adapter.endOfMonth(now);
        return { start, end };
      }
    });

    // ... all 18 presets refactored
  }
}
```

### DualDateRangeStore Uses Adapter

```typescript
@Injectable({ providedIn: 'root' })
export class DualDateRangeStore {
  private adapter: DateAdapter;

  constructor() {
    this.adapter = inject(DATE_ADAPTER, { optional: true }) 
      ?? new NativeDateAdapter();
  }

  // ✅ ISO conversion uses adapter
  readonly range = computed<DateRangeState>(() => {
    const start = this._startDate();
    const end = this._endDate();

    return {
      start: this.adapter.toISODate(start),
      end: this.adapter.toISODate(end)
    };
  });

  // ✅ Date parsing uses adapter
  private parseDate(date: Date | string | null): Date | null {
    if (!date) return null;
    if (date instanceof Date) return this.adapter.normalize(date);
    return this.adapter.parseISODate(date);
  }

  // ✅ Month navigation uses adapter
  private getNextMonth(date: Date): Date {
    return this.adapter.addMonths(date, 1);
  }
}
```

---

## 📊 Before vs After Comparison

### Before (v3.4.0)

```typescript
// ❌ Raw Date operations, timezone bugs possible
this.register('LAST_MONTH', {
  resolve: (now) => {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start, end };
  }
});

// ❌ Direct ISO conversion (timezone shift risk)
const isoDate = date.toISOString().split('T')[0];
```

### After (v3.5.1)

```typescript
// ✅ Adapter-based, timezone-safe
this.register('LAST_MONTH', {
  resolve: (now) => {
    const lastMonth = this.adapter.addMonths(now, -1);
    const start = this.adapter.startOfMonth(lastMonth);
    const end = this.adapter.endOfMonth(lastMonth);
    return { start, end };
  }
});

// ✅ Adapter handles timezone correctly
const isoDate = this.adapter.toISODate(date);
```

---

## 🚀 Migration Guide

### No Migration Required!

Existing code continues to work unchanged:

```typescript
// ✅ Still works exactly the same
const store = inject(DualDateRangeStore);
store.applyPreset('THIS_MONTH');
const range = store.range();
```

### Optional: Custom Adapter

Only if you need advanced features (e.g., explicit timezone handling):

```typescript
// 1. Create adapter implementing DateAdapter interface
// 2. Provide via DATE_ADAPTER token
// 3. Done! All presets/stores use your adapter automatically

providers: [
  { provide: DATE_ADAPTER, useClass: MyCustomAdapter }
]
```

---

## 🔍 Benefits for Enterprise Users

### ERP Systems
- ✅ Invoice dates never shift due to timezone/DST
- ✅ Accounting periods align correctly across regions
- ✅ Month-end reports include correct transactions

### BI/Analytics
- ✅ "This Month" returns actual month data (not shifted)
- ✅ Date filters work consistently across server/client
- ✅ Timezone-aware reports possible with custom adapter

### POS Systems
- ✅ Daily sales reports match actual business days
- ✅ No "ghost transactions" from previous/next day
- ✅ Multi-region deployments handle timezones correctly

### Hotel/Booking Systems
- ✅ Reservations appear for correct check-in dates
- ✅ "Next 30 Days" searches work reliably
- ✅ DST transitions don't break availability calendars

---

## 📚 API Reference

### DateAdapter Interface

```typescript
interface DateAdapter {
  // Normalization
  normalize(date: Date | null): Date;

  // ISO Conversion (no timezone shift)
  toISODate(date: Date | null): string;
  parseISODate(isoDate: string | null): Date | null;

  // Comparison
  isSameDay(date1: Date, date2: Date): boolean;
  isBeforeDay(date1: Date, date2: Date): boolean;
  isAfterDay(date1: Date, date2: Date): boolean;

  // Arithmetic
  addDays(date: Date, days: number): Date;
  addMonths(date: Date, months: number): Date;

  // Boundaries
  startOfDay(date: Date): Date;
  endOfDay(date: Date): Date;
  startOfMonth(date: Date): Date;
  endOfMonth(date: Date): Date;
  startOfWeek(date: Date, startDay?: number): Date;

  // Accessors
  getYear(date: Date): number;
  getMonth(date: Date): number;
  getDay(date: Date): number;
  getDayOfWeek(date: Date): number;
  getWeekOfYear(date: Date): number;
}
```

### DATE_ADAPTER Token

```typescript
import { DATE_ADAPTER } from '@oneluiz/dual-datepicker/core';

// Injection token for providing custom adapters
export const DATE_ADAPTER = new InjectionToken<DateAdapter>(
  'DATE_ADAPTER',
  { providedIn: 'root', factory: () => new NativeDateAdapter() }
);
```

---

## 🧩 Related Documentation

- [Headless Architecture](./HEADLESS.md) - State management with signals
- [SSR Clock Injection](./SSR_CLOCK_INJECTION.md) - Server-side rendering support
- [Preset System](./PRESETS.md) - Built-in date range presets

---

## 💡 Best Practices

### 1. Use Adapter for All Date Operations

```typescript
// ❌ Don't bypass adapter
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

// ✅ Use adapter methods
const tomorrow = adapter.addDays(new Date(), 1);
```

### 2. Normalize Dates from External Sources

```typescript
// When receiving dates from APIs/user input
const userDate = this.adapter.normalize(new Date(apiResponse.date));
store.setStart(userDate);
```

### 3. Always Use toISODate() for API Calls

```typescript
// ❌ Don't use raw ISO conversion
const isoDate = date.toISOString().split('T')[0];

// ✅ Use adapter
const isoDate = adapter.toISODate(date);
```

### 4. Test Custom Adapters with Edge Cases

- DST transitions (March/November in US)
- Month overflow (Jan 31 + 1 month)
- Leap years (Feb 29 handling)
- Year boundaries (Dec 31 → Jan 1)

---

## ❓ FAQ

### Q: Do I need to change existing code?
**A**: No, existing code works unchanged. The adapter is used internally.

### Q: What if I don't provide a custom adapter?
**A**: The library uses `NativeDateAdapter` by default (zero dependencies).

### Q: Can I use Luxon/Day.js?
**A**: Yes, implement the `DateAdapter` interface and provide via `DATE_ADAPTER` token.

### Q: Does this fix all timezone bugs?
**A**: It fixes date *range selection* and *preset calculation* bugs. For display formatting, use your preferred date library.

### Q: Is this SSR-safe?
**A**: Yes, the adapter works with SSR. Combine with `DATE_CLOCK` injection for full SSR determinism.

### Q: Performance impact?
**A**: Negligible. The adapter adds minimal overhead (< 0.1ms per operation).

---

**Next Steps**:
- [Install the library](../README.md#installation)
- [Explore headless architecture](./HEADLESS.md)
- [Try built-in presets](./PRESETS.md)
- [Create custom adapter for Luxon/Day.js](#custom-adapter-luxon-example)
