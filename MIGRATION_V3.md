# Migration Guide: v2.x → v3.0.0

## ⚠️ BREAKING CHANGES

Version 3.0.0 is a major refactoring that removes deprecated features and translates all Spanish property names to English for better international adoption and code maintainability.

## 1. DateRange Interface Changes

**All properties renamed from Spanish to English:**

### Before (v2.x):
```typescript
interface DateRange {
  fechaInicio: string;
  fechaFin: string;
  rangoTexto: string;
}
```

### After (v3.0.0):
```typescript
interface DateRange {
  startDate: string;
  endDate: string;
  rangeText: string;
}
```

**Migration:**
```typescript
// OLD
const range: DateRange = {
  fechaInicio: '2026-01-01',
  fechaFin: '2026-01-31',
  rangoTexto: 'Jan 1 - Jan 31'
};
console.log(range.fechaInicio); // OLD

// NEW
const range: DateRange = {
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  rangeText: 'Jan 1 - Jan 31'
};
console.log(range.startDate); // NEW
```

## 2. Component @Input Properties

### Before (v2.x):
```html
<ngx-dual-datepicker
  [fechaInicio]="startValue"
  [fechaFin]="endValue">
</ngx-dual-datepicker>
```

### After (v3.0.0):
```html
<ngx-dual-datepicker
  [startDate]="startValue"
  [endDate]="endValue">
</ngx-dual-datepicker>
```

## 3. PresetConfig - Removed Deprecated `daysAgo`

**The deprecated `daysAgo` pattern has been completely removed.**

### Before (v2.x):
```typescript
// This NO LONGER WORKS in v3.0.0
presets: PresetConfig[] = [
  { label: 'Last 30 days', daysAgo: 30 }  // ❌ REMOVED
];
```

### After (v3.0.0):
```typescript
import { getLastNDays } from '@oneluiz/dual-datepicker';

presets: PresetConfig[] = [
  { label: 'Last 30 days', getValue: () => getLastNDays(30) }  // ✅ REQUIRED
];
```

**Or use pre-built CommonPresets:**
```typescript
import { CommonPresets } from '@oneluiz/dual-datepicker';

presets = CommonPresets.dashboard; // ✅ Already uses getValue()
```

## 4. Event Handler Updates

### Before (v2.x):
```typescript
onDateRangeChange(range: DateRange) {
  console.log('Start:', range.fechaInicio);
  console.log('End:', range.fechaFin);
  console.log('Text:', range.rangoTexto);
}
```

### After (v3.0.0):
```typescript
onDateRangeChange(range: DateRange) {
  console.log('Start:', range.startDate);
  console.log('End:', range.endDate);
  console.log('Text:', range.rangeText);
}
```

## 5. Multi-Range Interface Updates

### Before (v2.x):
```typescript
onMultiRangeChange(data: MultiDateRange) {
  data.ranges.forEach(range => {
    console.log(range.fechaInicio, range.fechaFin);  // OLD
  });
}
```

### After (v3.0.0):
```typescript
onMultiRangeChange(data: MultiDateRange) {
  data.ranges.forEach(range => {
    console.log(range.startDate, range.endDate);  // NEW
  });
}
```

## 6. Reactive Forms / ControlValueAccessor

### Before (v2.x):
```typescript
this.form.patchValue({
  dateRange: {
    fechaInicio: '2026-01-01',
    fechaFin: '2026-01-31',
    rangoTexto: 'Jan 1 - Jan 31'
  }
});
```

### After (v3.0.0):
```typescript
this.form.patchValue({
  dateRange: {
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    rangeText: 'Jan 1 - Jan 31'
  }
});
```

## Quick Migration Checklist

- [ ] Replace `fechaInicio` with `startDate` in all templates
- [ ] Replace `fechaFin` with `endDate` in all templates
- [ ] Replace `rangoTexto` with `rangeText` in all templates
- [ ] Update `@Input()` bindings: `[fechaInicio]` → `[startDate]`, `[fechaFin]` → `[endDate]`
- [ ] Update all `DateRange` property references in TypeScript
- [ ] Remove all `daysAgo` usage and replace with `getValue: () => getLastNDays(n)`
- [ ] Update presets to use `getValue` functions or CommonPresets
- [ ] Update event handlers accessing `DateRange` properties
- [ ] Update form control value accessors
- [ ] Test multi-range functionality if used

## Automated Migration (Find & Replace)

You can use these find & replace patterns in your codebase:

1. **TypeScript files (*.ts):**
   - `fechaInicio` → `startDate`
   - `fechaFin` → `endDate`
   - `rangoTexto` → `rangeText`
   - `daysAgo:` → Remove and replace with `getValue: () => getLastNDays(...)`

2. **HTML Templates (*.html):**
   - `[fechaInicio]` → `[startDate]`
   - `[fechaFin]` → `[endDate]`
   - `range.fechaInicio` → `range.startDate`
   - `range.fechaFin` → `range.endDate`
   - `range.rangoTexto` → `range.rangeText`

## Why This Change?

1. **International Adoption**: English property names make the library more accessible globally
2. **Code Maintainability**: Consistent naming conventions across the codebase
3. **Professional Standard**: Aligns with TypeScript/Angular conventions
4. **Remove Technical Debt**: Eliminates deprecated `daysAgo` pattern
5. **Cleaner API**: More intuitive and self-documenting code

## Need Help?

- 📖 [Full Documentation](https://oneluiz.github.io/ng-dual-datepicker/)
- 🐛 [Report Issues](https://github.com/oneluiz/ng-dual-datepicker/issues)
- 💬 [Discussions](https://github.com/oneluiz/ng-dual-datepicker/discussions)

## Rollback to v2.x

If you need more time to migrate, you can stay on v2.7.0:

```bash
npm install @oneluiz/dual-datepicker@2.7.0
```

Version 2.7.0 will continue to work but will not receive new features.
