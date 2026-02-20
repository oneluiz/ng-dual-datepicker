# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
