# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

#### Component @Input Properties Renamed

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
  - New `multiRange` @Input property (boolean, default: false)
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

- Preset ranges (`presetRanges` @Input)
- Auto-close on selection (`closeOnSelection` @Input)
- Auto-close on preset selection (`closeOnPresetSelection` @Input)

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
