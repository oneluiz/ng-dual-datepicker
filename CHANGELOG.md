# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.6.0] - 2026-02-21

### 🔌 Enterprise Feature: Plugin-Driven Preset Architecture

**New**: Extensible date range presets following **Open/Closed Principle** - add custom presets without modifying core library code.

#### The Problem

Before this update:
- ❌ All 18 presets hardcoded in `PresetEngine` (~230 lines)
- ❌ No way to add fiscal year, hotel, or logistics presets without forking
- ❌ Violated Open/Closed Principle (must modify core to extend)
- ❌ Can't distribute industry-specific presets as external packages
- ❌ Testing friction (hard to mock/override presets)

**Enterprise blocker**: Companies with fiscal years, hotels with check-in cycles, logistics with shipping weeks had to fork the library or maintain hacky workarounds.

#### The Solution: Plugin Architecture

New **RangePresetPlugin** interface enabling extensibility:

```typescript
interface RangePresetPlugin {
  key: string; // 'THIS_FISCAL_QUARTER', 'CHECK_IN_WEEK', etc.
  resolve(clock: DateClock, adapter: DateAdapter): DateRange;
}
```

#### New Components

1. **RangePresetPlugin Interface** (`range-preset.plugin.ts` ~200 lines):
   - Contract for all date range presets
   - SSR-safe via DateClock injection
   - Timezone-safe via DateAdapter injection
   - Pure function design (no side effects)

2. **PresetRegistry Service** (`preset-registry.ts` ~250 lines):
   - `@Injectable({ providedIn: 'root' })` singleton
   - API: `register()`, `registerAll()`, `get()`, `has()`, `getAll()`, `getAllKeys()`, `count()`, `unregister()`, `clear()`
   - Thread-safe `Map<string, RangePresetPlugin>`
   - Validates plugins before registration
   - Supports override (useful for testing)

3. **Built-in Presets as Plugins** (`built-in-presets.ts` ~320 lines):
   - All 18 presets converted to plugin format:
     * Daily: TODAY, YESTERDAY
     * Weekly: LAST_7_DAYS, LAST_14_DAYS, THIS_WEEK, LAST_WEEK
     * Monthly: LAST_30_DAYS, LAST_60_DAYS, LAST_90_DAYS, THIS_MONTH, LAST_MONTH, MONTH_TO_DATE
     * Quarterly: THIS_QUARTER, LAST_QUARTER, QUARTER_TO_DATE
     * Yearly: THIS_YEAR, LAST_YEAR, YEAR_TO_DATE
   - `BUILT_IN_PRESETS` array for bulk registration

4. **Provider Functions** (`preset-providers.ts` ~280 lines):
   - `provideBuiltInPresets()` - Auto-register built-ins
   - `provideCustomPresets(presets[])` - App-level custom presets
   - `providePresetPackage(name, presets[])` - External npm packages
   - All use `APP_INITIALIZER` for registration timing

#### What Changed

**✅ PresetEngine Refactored** (~230 lines deleted):
- REMOVED: Internal `Map<string, RangePreset>` and `registerBuiltInPresets()` method
- ADDED: Injects `PresetRegistry` service
- `resolve()` now delegates to `registry.get(key).resolve(clock, adapter)`
- `register()` converts legacy `RangePreset` to plugin format
- 100% backward compatible API maintained

**✅ Export Updates**:
- `src/core/index.ts` now exports:
  * `range-preset.plugin`
  * `preset-registry`
  * `built-in-presets`
  * `preset-providers`

**✅ Component Auto-Registration**:
- `DualDateRangeComponent` now includes `APP_INITIALIZER` provider
- Built-in presets register automatically (zero config)

#### Usage Examples

##### Built-in Presets (Zero Config)

```typescript
// ✅ Works automatically, no setup needed
export class DashboardComponent {
  private rangeStore = inject(DualDateRangeStore);
  
  ngOnInit() {
    this.rangeStore.applyPreset('LAST_30_DAYS');
    // { start: "2026-01-22", end: "2026-02-21" }
  }
}
```

##### Custom Fiscal Year Presets

```typescript
// Define plugin
const THIS_FISCAL_QUARTER: RangePresetPlugin = {
  key: 'THIS_FISCAL_QUARTER',
  resolve: (clock, adapter) => {
    const now = clock.now();
    const month = adapter.getMonth(now); // 0-11
    // Fiscal year starts April (month 3)
    const fiscalMonth = (month + 9) % 12;
    const quarterStartMonth = Math.floor(fiscalMonth / 3) * 3;
    const calendarMonth = (quarterStartMonth - 9 + 12) % 12;
    const fiscalYear = month < 3 ? year - 1 : year;
    
    const start = new Date(fiscalYear, calendarMonth, 1);
    const end = new Date(fiscalYear, calendarMonth + 3, 0);
    
    return { start: adapter.normalize(start), end: adapter.normalize(end) };
  }
};

// Register via provider (app.config.ts)
export const appConfig: ApplicationConfig = {
  providers: [provideCustomPresets([THIS_FISCAL_QUARTER])]
};

// Use in component
this.rangeStore.applyPreset('THIS_FISCAL_QUARTER');
// { start: "2026-01-01", end: "2026-03-31" }
```

##### Hotel/Hospitality Presets

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

##### External Preset Packages

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

// Install external package
npm install @acme/fiscal-presets

// Use in app (app.config.ts)
import { provideFiscalPresets } from '@acme/fiscal-presets';
providers: [provideFiscalPresets()]
```

#### Design Principles Applied

- ✅ **Open/Closed Principle**: Extend presets without modifying core
- ✅ **Dependency Injection**: DateClock + DateAdapter passed to plugins
- ✅ **Single Responsibility**: Plugin defines logic, registry manages collection
- ✅ **Interface Segregation**: Minimal interface (key + resolve)
- ✅ **Testability**: Pure plugin functions, easy to mock

#### Benefits

**For Library Users**:
- ✅ Zero config for built-in presets (unchanged)
- ✅ Easy custom preset creation
- ✅ Industry-specific presets available as packages
- ✅ Dynamic preset management at runtime
- ✅ 100% backward compatible

**For Enterprise**:
- ✅ Fiscal year support (governments, education, corporations)
- ✅ Hotel/hospitality workflows (check-in cycles, night stays)
- ✅ Logistics/shipping schedules (shipping weeks, delivery windows)
- ✅ Custom business logic (company reporting periods)
- ✅ Multi-tenant preset management

**For Library Maintainers**:
- ✅ No more feature requests for industry presets
- ✅ Extensible without code changes
- ✅ Enables ecosystem of external packages
- ✅ Cleaner architecture (~230 lines deleted from PresetEngine)
- ✅ Easier testing and mocking

#### Files Changed

**New Files**:
- `src/core/range-preset.plugin.ts` (~200 lines)
- `src/core/preset-registry.ts` (~250 lines)
- `src/core/built-in-presets.ts` (~320 lines)
- `src/core/preset-providers.ts` (~280 lines)
- `PRESET_PLUGIN_EXAMPLES.ts` (~450 lines examples)
- `docs/PRESET_PLUGINS.md` (comprehensive documentation)

**Modified Files**:
- `src/core/preset.engine.ts` (refactored, ~230 lines deleted)
- `src/core/index.ts` (added 4 exports)
- `src/dual-datepicker.component.ts` (added auto-registration)

#### Migration Guide

**No migration required!** Existing code works unchanged:

```typescript
// ✅ Still works exactly the same
const store = inject(DualDateRangeStore);
store.applyPreset('LAST_30_DAYS');
```

**New features (optional)**:

```typescript
// ✅ Add custom presets
providers: [provideCustomPresets([MY_CUSTOM_PRESET])]

// ✅ Direct registry access
const registry = inject(PresetRegistry);
registry.register(MY_PLUGIN);
```

#### Bug Fixes

- Fixed: Used `adapter.getDayOfWeek()` in `THIS_WEEK_PRESET` and `LAST_WEEK_PRESET` (method doesn't exist)
- Changed to: `adapter.getDay()` (correct method name, returns 0-6 where Sunday=0)

#### Documentation

- Added: [PRESET_PLUGINS.md](docs/PRESET_PLUGINS.md) - Complete plugin architecture guide
- Added: [PRESET_PLUGIN_EXAMPLES.ts](PRESET_PLUGIN_EXAMPLES.ts) - 8 comprehensive examples
- Examples include: fiscal year, hotel/hospitality, logistics, external packages, testing, dynamic registration

### Added

- `RangePresetPlugin` interface for extensible presets
- `PresetRegistry` service for plugin management
- `provideCustomPresets()` function for app-level custom presets
- `providePresetPackage()` function for external preset packages
- 18 built-in presets converted to plugin format
- Comprehensive plugin system documentation
- 8 industry-specific preset examples

### Changed

- **PresetEngine** refactored to use `PresetRegistry` (deleted ~230 lines)
- Built-in presets now register via `APP_INITIALIZER`
- Exports updated in `src/core/index.ts`

### Fixed

- Used correct `adapter.getDay()` method in week-based presets (was `getDayOfWeek()`)

### Deprecated

- Legacy `RangePreset` interface (replaced by `RangePresetPlugin`)
- Still supported for backward compatibility

### Breaking Changes

**None** - 100% backward compatible

## [3.5.1] - 2026-02-21

### 🛡️ Enterprise Feature: Timezone-Safe Date Adapter Layer

**Fixed**: Enterprise-critical timezone bugs in ERP, BI, POS, and invoicing systems caused by native `Date` operations.

#### The Problem

Before this update:
- ❌ Date ranges shifted by ±1 day due to timezone/DST conversions
- ❌ `toISOString()` caused UTC conversion bugs ("2024-03-15" → "2024-03-14T18:00:00Z" in GMT-6)
- ❌ Month arithmetic had overflow bugs (Jan 31 + 1 month = Mar 2)
- ❌ Server (UTC) vs client (local) timezone discrepancies in ERP/BI reports
- ❌ No way to swap date libraries without rewriting core logic

**Real-world impact**: Invoices dated wrong day, "This Month" reports include wrong dates, hotel reservations appear for incorrect days.

#### The Solution: DateAdapter Interface

New **DateAdapter** abstraction layer with 18 timezone-safe operations:

```typescript
interface DateAdapter {
  // Core operations (no timezone shift)
  normalize(date: Date | null): Date;
  toISODate(date: Date | null): string; // Timezone-safe YYYY-MM-DD
  parseISODate(isoDate: string | null): Date | null;
  
  // Comparison (ignores time)
  isSameDay(date1: Date, date2: Date): boolean;
  isBeforeDay(date1: Date, date2: Date): boolean;
  isAfterDay(date1: Date, date2: Date): boolean;
  
  // Arithmetic (handles overflow)
  addDays(date: Date, days: number): Date;
  addMonths(date: Date, months: number): Date; // Jan 31 + 1m = Feb 28 ✅
  
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

#### What Changed

**✅ Core Refactored to Use DateAdapter**:
- `PresetEngine`: All 18 presets (TODAY, LAST_7_DAYS, THIS_MONTH, etc.) now use adapter methods
- `DualDateRangeStore`: All date operations (parsing, formatting, navigation) use adapter
- `NativeDateAdapter`: Zero-dependency implementation included by default

**Example Before/After**:
```typescript
// ❌ Before (v3.5.0) - Timezone bugs possible
this.register('YESTERDAY', {
  resolve: (now) => {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    return { start: date, end: date };
  }
});

// ✅ After (v3.5.1) - Timezone-safe
this.register('YESTERDAY', {
  resolve: (now) => {
    const date = this.adapter.addDays(now, -1);
    return { start: date, end: date };
  }
});
```

#### Zero Breaking Changes

**✅ Backward Compatible**: Existing code works unchanged.

```typescript
// Still works exactly the same way
const store = inject(DualDateRangeStore);
store.applyPreset('THIS_MONTH');
const range = store.range(); // { start: "2024-03-01", end: "2024-03-31" }
```

**Default Behavior**: Uses `NativeDateAdapter` (zero dependencies) automatically.

#### Custom Adapters (Optional)

Swap to Luxon, Day.js, or any date library:

```typescript
// 1. Implement DateAdapter interface
@Injectable({ providedIn: 'root' })
export class LuxonDateAdapter implements DateAdapter {
  toISODate(date: Date | null): string {
    return DateTime.fromJSDate(date).toISODate();
  }
  // ... implement remaining methods
}

// 2. Provide via DATE_ADAPTER token
providers: [
  { provide: DATE_ADAPTER, useClass: LuxonDateAdapter }
]
```

#### Files Changed

**New Files**:
- `src/core/date-adapter.ts` - DateAdapter interface + DATE_ADAPTER token
- `src/core/native-date-adapter.ts` - Zero-dependency implementation
- `docs/TIMEZONE_ADAPTER.md` - Complete guide and examples

**Updated Files**:
- `src/core/preset.engine.ts` - Injects DateAdapter, all presets refactored
- `src/core/dual-date-range.store.ts` - Uses adapter for all date operations
- `src/core/index.ts` - Exports date-adapter and native-date-adapter

#### Benefits for Enterprise

**ERP Systems**:
- ✅ Invoice dates never shift due to timezone/DST
- ✅ Accounting periods align correctly across regions

**BI/Analytics**:
- ✅ "This Month" returns actual month data (not shifted ±1 day)
- ✅ Date filters work consistently across server/client

**POS Systems**:
- ✅ Daily sales reports match actual business days
- ✅ No "ghost transactions" from previous/next day

**Hotel/Booking**:
- ✅ Reservations appear for correct check-in dates
- ✅ DST transitions don't break availability calendars

#### Documentation

See complete guide: [TIMEZONE_ADAPTER.md](./docs/TIMEZONE_ADAPTER.md)

#### API Additions

**New Exports** (from `@oneluiz/dual-datepicker/core`):
- `DateAdapter` - Interface for custom adapters
- `NativeDateAdapter` - Default zero-dependency implementation
- `DATE_ADAPTER` - Injection token for providing custom adapters

**Injection Tokens**:
```typescript
import { DATE_ADAPTER } from '@oneluiz/dual-datepicker/core';

// Provide custom adapter
providers: [
  { provide: DATE_ADAPTER, useClass: MyCustomAdapter }
]
```

---

## [3.5.0] - 2026-02-20

### 🚀 Major Feature: Headless Architecture

**Use date range state WITHOUT the UI component** - Brand new architecture that separates logic from UI!

#### Core Modules

**DualDateRangeStore** - Signal-based state container:
- `@Injectable` store using Angular Signals
- Works in services, components, guards, resolvers
- SSR-compatible (no window/document dependencies)
- Deterministic and testable
- Observable-free (pure Signals)

**PresetEngine** - Headless preset resolver:
- Resolve presets without rendering
- 15+ built-in presets (TODAY, THIS_MONTH, THIS_QUARTER, etc.)
- Register custom presets
- Deterministic date calculation
- **NEW**: Injectable service with Clock Injection for SSR-safe resolution

**RangeValidator** - Pure validation functions:
- `validateRangeOrder(start, end)`
- `validateDateBounds(date, min, max)`
- `isDateDisabled(date, disabledDates)`
- No side effects, pure functions

#### 🔥 SSR-Safe Clock Injection

**Problem Solved**: Presets like "Last 7 Days" used `new Date()`, causing SSR hydration mismatches.

**Solution**: Inject `DATE_CLOCK` token to control time deterministically:

```typescript
// Server (SSR)
provide(DATE_CLOCK, {
  useValue: { now: () => new Date('2026-02-21T00:00:00Z') }
});

// Client uses same time → Perfect hydration ✅
```

**Benefits**:
- ✅ No SSR hydration mismatches
- ✅ Consistent date filters across server and client
- ✅ Perfect for ERP/BI dashboards requiring identical server/client state
- ✅ Testable with controlled time
- ✅ Zero breaking changes (backward compatible)

**Architecture**:
- `DateClock` interface for time abstraction
- `SystemClock` default implementation (uses `new Date()`)
- `DATE_CLOCK` injection token for override
- PresetEngine now uses DI instead of static `new Date()`

See [SSR_CLOCK_INJECTION.md](./SSR_CLOCK_INJECTION.md) for complete guide.

#### Use Cases

Perfect for:
- 📊 **Dashboard filters** - Control multiple charts with single global state
- 🏢 **SSR applications** - Server-side date range logic with hydration consistency
- 🔄 **Global state** - Share range across unrelated components
- 🎯 **Service layer** - Filter API calls without UI
- 📈 **Analytics & BI** - Headless reporting engines
- 🧪 **Testing** - Test date logic without DOM, with controlled time

#### Example Usage

```typescript
// In any service or component
const rangeStore = inject(DualDateRangeStore);

// Apply preset
rangeStore.applyPreset('THIS_MONTH');

// Get range for API call
const range = rangeStore.range();
http.get(`/api/sales?start=${range.start}&end=${range.end}`);
```

#### Architecture

```
Core Logic (v3.5.0)           UI Layer
├── DualDateRangeStore        ├── DualDatepickerComponent
├── PresetEngine              │   └─► Uses DualDateRangeStore internally
└── RangeValidator            └── 100% backward compatible API
```

**Component Now Uses Store**: The `DualDatepickerComponent` has been refactored to use `DualDateRangeStore` internally for all state management. This provides cleaner architecture, better testability, and consistent state handling. The public API remains unchanged for backward compatibility.

#### Documentation

- **[HEADLESS.md](HEADLESS.md)** - Complete architecture guide
- **[HEADLESS_EXAMPLES.ts](HEADLESS_EXAMPLES.ts)** - 9 real-world code examples
- Updated README with Quick Start section

### 🔄 Backward Compatibility

- ✅ **Zero breaking changes** - All existing code works unchanged
- ✅ Existing `DualDatepickerComponent` unchanged  
- ✅ All inputs/outputs preserved
- ✅ Component will be refactored to use store internally in v4.0

### 📦 New Exports

```typescript
// New in public API
export { DualDateRangeStore } from './core';
export { PresetEngine, presetEngine, createPreset } from './core';
export { 
  validateRangeOrder,
  validateDateBounds,
  isDateDisabled,
  ValidationResult 
} from './core';
```

## [3.2.0] - 2026-02-20

### ✨ Features

#### 🎨 Hover Range Preview

**Visual feedback while selecting dates** - See a live preview of the date range before confirming selection:

- **Automatic hover preview**: Light purple background (#e0e7ff) with dashed border (#6366f1)
- **Instant visual feedback**: Range preview updates immediately as you hover over dates
- **Subtle and professional**: 70% opacity with clear distinction from confirmed selection
- **Zero configuration**: Always enabled, works seamlessly with all modes
- **Universal compatibility**: Works with single range, multi-range, and requireApply modes

**User Experience:**
1. Select start date
2. Hover over other dates → see preview range
3. Click end date to confirm

#### 🔒 Apply/Confirm Button

**Explicit confirmation before emitting changes** - Perfect for dashboards and enterprise applications:

- **New input**: `[requireApply]="true"` enables confirmation mode
- **Pending state**: Selected dates shown as "pending" until confirmed
- **Apply button**: Confirms selection and emits `dateRangeChange` event
- **Cancel button**: Discards pending selection and reverts to previous dates
- **Prevents unwanted API calls**: Events only emitted after explicit confirmation

**Benefits:**
- ✅ Reduce server load (single API call vs multiple)
- ✅ Better UX for expensive operations (data loading, calculations)
- ✅ Professional enterprise pattern
- ✅ Works with all features (presets, formats, disabled dates)

**Perfect for:**
- 📊 Dashboards with data loading
- 📈 Reports with expensive calculations
- 🔍 Analytics with API calls
- 💰 Financial systems

#### 🎨 Display Format Customization

**Flexible date formatting with token system** - Customize how dates appear in the input:

- **New input**: `[displayFormat]="'DD/MM/YYYY'"` 
- **8 format tokens**: YYYY, YY, MMMM, MMM, MM, M, DD, D
- **Default**: `'D MMM'` (e.g., "15 Feb")
- **Examples**:
  - `'DD/MM/YYYY'` → "15/02/2026" (European)
  - `'MM/DD/YYYY'` → "02/15/2026" (US)
  - `'YYYY-MM-DD'` → "2026-02-15" (ISO)
  - `'D MMMM YYYY'` → "15 February 2026" (Long)

**Tokens:**
- `YYYY` → Full year (2026)
- `YY` → Short year (26)
- `MMMM` → Full month name (February)
- `MMM` → Short month name (Feb)
- `MM` → Month with leading zero (02)
- `M` → Month without zero (2)
- `DD` → Day with leading zero (05)
- `D` → Day without zero (5)

#### 🚫 Disabled Dates

**Block specific dates from selection** - Two powerful modes:

**Array Mode** (specific dates):
```typescript
disabledDates: Date[] = [
  new Date(2026, 0, 1),   // New Year
  new Date(2026, 11, 25)  // Christmas
];
```

**Function Mode** (dynamic rules):
```typescript
disabledDates = (date: Date): boolean => {
  // Block weekends
  const day = date.getDay();
  return day === 0 || day === 6;
};
```

**Visual styling:**
- Strikethrough text decoration
- Gray color (#9ca3af)
- Light gray background (#f9fafb)
- Cannot be hovered or selected
- Clear visual distinction from available dates

**Use cases:**
- 🚫 Block weekends for business calendars
- 📅 Block holidays for booking systems
- 🔒 Block past dates for future-only selection
- 🎯 Custom business rules (blackout dates, maintenance windows)

### 📦 Demo & Documentation

- **16 comprehensive examples** showcasing all features
- **Interactive keyboard shortcuts guide** in demo
- **Complete README** with 1,897 lines of documentation
- **Visual examples** for each feature
- **Code samples** for all use cases

### 🎯 Bundle & Performance

- **Package size**: 89.3 kB (481 kB unpacked)
- **SCSS**: 8.89 kB (rich styling for premium UX)
- **Zero dependencies**: Pure Angular implementation
- **Tree-shakeable**: Import only what you need

### ✨ What's New Since v3.1.1

This release adds **4 major features** that significantly enhance UX and enterprise readiness:

1. 🎨 **Hover Preview** - Visual feedback (automatic, always enabled)
2. 🔒 **Apply Button** - Explicit confirmation for expensive operations
3. 🎨 **Display Format** - Flexible date formatting (8 tokens)
4. 🚫 **Disabled Dates** - Block specific dates (array + function modes)

**Zero breaking changes** - 100% compatible with v3.1.x

## [3.1.1] - 2026-02-19

### 🐛 Bug Fixes

#### Keyboard Navigation Refinements

- **Fixed monthIndex calculation**: Corrected focus positioning after month changes during vertical and horizontal navigation
- **Fixed initializeFocus validation**: Ensured focused dates are only initialized if they're within visible month range
- **Fixed timezone issue**: Resolved day-skipping bug in horizontal navigation caused by UTC/local timezone interpretation of ISO date strings (YYYY-MM-DD)
  - Updated `NativeDateAdapter.parse()` to explicitly parse ISO dates as local dates
  - Prevents incorrect day calculations in different timezones
  - Arrow left/right now navigate correctly one day at a time

#### Documentation & Configuration

- **Complete documentation update**: Updated all sections including footer, roadmap, API reference, and accessibility documentation
- **Added configuration option**: Keyboard navigation can now be disabled with `[enableKeyboardNavigation]="false"` input (enabled by default)

## [3.1.0] - 2026-02-19

### ✨ Features

#### Full Keyboard Navigation Support

Complete keyboard navigation for enhanced accessibility and professional UX:

**Arrow Keys Navigation:**
- **←/→**: Navigate between days (horizontal)
- **↑/↓**: Navigate by weeks (vertical) 
- **Home**: Jump to first day of visible range
- **End**: Jump to last day of visible range
- **PageUp/PageDown**: Navigate months
- **Shift + PageUp/PageDown**: Navigate years

**Selection & Actions:**
- **Enter/Space**: Select focused day
- **Escape**: Close datepicker
- **Tab**: Navigate between input, presets, and calendar (natural tab order)

**Visual Indicators:**
- Blue outline ring for keyboard-focused day
- ARIA attributes for screen reader support
- Proper focus management when opening/closing picker

**Accessibility Improvements:**
- `role="combobox"` on input with `aria-expanded` and `aria-haspopup`
- `aria-label`, `aria-selected`, and `aria-current` on calendar days
- Intelligent tabindex management (0 for focused element, -1 for others)
- Focus automatically initialized to selected date or current day

**Configuration:**
- New `@Input() enableKeyboardNavigation: boolean = true` - Keyboard navigation enabled by default, can be disabled if needed

This brings the component to WCAG 2.1 Level AA compliance for keyboard accessibility.

## [3.0.0] - 2026-02-19

### 🚨 BREAKING CHANGES

#### Interface Property Renames (Spanish → English)

All `DateRange` interface properties have been renamed to English for better international adoption:

```typescript
// v2.x (DEPRECATED)
interface DateRange {
  fechaInicio: string;
  fechaFin: string;
  rangoTexto: string;
}

// v3.0.0 (NEW)
interface DateRange {
  startDate: string;
  endDate: string;
  rangeText: string;
}
```

**Migration**: Replace all references:
- `range.fechaInicio` → `range.startDate`
- `range.fechaFin` → `range.endDate`
- `range.rangoTexto` → `range.rangeText`

#### Component Input Properties Renamed (Angular `@Input` decorator)

```typescript
// v2.x (DEPRECATED)
<ngx-dual-datepicker
  [fechaInicio]="startDate"
  [fechaFin]="endDate">
</ngx-dual-datepicker>

// v3.0.0 (NEW)
<ngx-dual-datepicker
  [startDate]="startDate"
  [endDate]="endDate">
</ngx-dual-datepicker>
```

#### Deprecated `daysAgo` Pattern Removed

The deprecated `daysAgo` property has been completely removed from `PresetConfig`. You must now use the `getValue()` pattern:

```typescript
// v2.x (NO LONGER WORKS)
presets = [
  { label: 'Last 30 days', daysAgo: 30 }
];

// v3.0.0 (REQUIRED)
import { getLastNDays, CommonPresets } from '@oneluiz/dual-datepicker';

// Option 1: Use helper function
presets = [
  { label: 'Last 30 days', getValue: () => getLastNDays(30) }
];

// Option 2: Use pre-built collections
presets = CommonPresets.dashboard;
```

#### Component Methods Renamed to English

All public methods have been renamed:

| v2.x | v3.0.0 |
|------|--------|
| `limpiar()` | `clear()` |
| `seleccionarDia()` | `selectDay()` |
| `cambiarMes()` | `changeMonth()` |
| `cerrarDatePicker()` | `closeDatePicker()` |
| `actualizarRangoFechasTexto()` | `updateDateRangeText()` |
| `generarCalendarios()` | `generateCalendars()` |
| `seleccionarRangoPredefinido()` | `selectPresetRange()` |
| `eliminarRango()` | `removeRange()` |

**Migration**: Update method calls:
```typescript
// v2.x
this.datepicker.limpiar();

// v3.0.0
this.datepicker.clear();
```

#### Signals Renamed to English

All internal signals have been renamed (only affects direct signal access):

- `mostrarDatePicker` → `showDatePicker`
- `rangoFechas` → `dateRangeText`
- `fechaSeleccionandoInicio` → `selectingStartDate`
- `mesActual` → `currentMonth`
- `mesAnterior` → `previousMonth`
- `diasMesActual` → `currentMonthDays`
- `diasMesAnterior` → `previousMonthDays`
- `nombreMesActual` → `currentMonthName`
- `nombreMesAnterior` → `previousMonthName`
- `diasSemana` → `weekDayNames`

### 📖 Migration Guide

See [MIGRATION_V3.md](MIGRATION_V3.md) for complete migration instructions including:
- Step-by-step migration checklist
- Find & replace patterns
- Before/after code examples
- Rollback instructions

### 🎯 Why These Changes?

1. **International Adoption**: English property names make the library more accessible to the global developer community
2. **TypeScript Best Practices**: Aligns with Angular and TypeScript naming conventions
3. **Maintainability**: Consistent English naming reduces cognitive overhead
4. **Technical Debt Elimination**: Removed deprecated `daysAgo` pattern that was replaced by more flexible `getValue()` in v2.6.0

### ✅ What's NOT Breaking

- All styling properties remain unchanged
- All output events remain unchanged (`dateRangeSelected`, `dateRangeChange`, `multiDateRangeSelected`)
- Component selector (`<ngx-dual-datepicker>`) unchanged
- `LocaleConfig` interface unchanged
- Multi-range functionality unchanged
- All visual behavior unchanged

---

## [2.7.0] - 2026-02-15

### Added

- **Multi-Range Support**: Select multiple non-overlapping date ranges in a single picker
  - New `multiRange` input property (boolean, default: false)
  - New `multiDateRangeSelected` @Output event
  - New `multiDateRangeChange` @Output event
  - Visual indicators for multiple ranges
  - Delete button for each range
  - Validation to prevent overlapping ranges
  - Perfect for booking systems, blackout dates, and complex scheduling

### Changed

- Updated GitHub Page Documentation tab with Multi-Range section
- Updated API Reference with new v2.7.0 properties

---

## [2.6.0] - 2025-12-10

### Added

- **Flexible Preset System**: New `getValue()` pattern for dynamic presets
  - Allows custom date calculation logic
  - Helper functions: `getLastNDays()`, `getThisMonth()`, `getLastMonth()`, `getYearToDate()`
  - Pre-built preset collections: `CommonPresets.simple`, `CommonPresets.dashboard`, `CommonPresets.analytics`

### Deprecated

- `daysAgo` property in `PresetConfig` (use `getValue()` instead)

---

## [2.5.0] - 2025-10-05

### Added

- **Date Adapter System**: Support for third-party date libraries
  - DayJS adapter
  - date-fns adapter
  - Luxon adapter
  - Custom adapter interface

---

## [2.4.0] - 2025-08-20

### Added

- **Reactive Forms Support**: Implement `ControlValueAccessor` interface
  - Full Angular Forms integration
  - Support for `ngModel`, `formControl`, `formControlName`
  - Validation support

### Changed

- **Default `showClearButton` changed to `false`** (BREAKING CHANGE)
- Redesigned clear button with minimalist UI

---

## [2.3.0] - 2025-06-15

### Added

- Spanish locale support
- Custom locale configuration
- Internationalization (i18n) infrastructure

---

## [2.2.0] - 2025-04-10

### Added

- Preset ranges (via `presetRanges` input)
- Auto-close on selection (via `closeOnSelection` input)
- Auto-close on preset selection (via `closeOnPresetSelection` input)

---

## [2.1.0] - 2025-02-01

### Added

- Custom styling properties (16 CSS customization inputs)
- Theme support

---

## [2.0.0] - 2024-12-15

### Added

- **Angular Signals**: Complete rewrite using Angular Signals for better reactivity and performance
- Standalone component architecture
- Zero dependencies

### Changed

- Minimum Angular version: 17.0.0 (BREAKING CHANGE)

---

## [1.0.0] - 2024-10-01

### Added

- Initial release
- Basic date range picker functionality
- Dual calendar view
- Date range selection
- Custom date range text formatting
