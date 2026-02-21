# Testing Guide

## Running Tests

The library uses **Node.js built-in test runner** (zero external dependencies).

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run specific test file

```bash
npm run test:compile
node --test dist-test/core/tests/native-date-adapter.spec.js
```

## Test Architecture

### Zero Dependencies

Tests use only Node.js built-in modules:
- `node:test` - Test runner
- `node:assert/strict` - Assertions

No external testing frameworks (Vitest, Jest, Mocha, etc.)

### Deterministic Testing

All tests use **FixedClock** for deterministic date resolution:

```typescript
import { FixedClock, makeDate } from '../testing';

// Fixed date: Feb 21, 2026
const clock = new FixedClock(makeDate(2026, 2, 21));
```

**NO** usage of:
- `new Date()` without fixed date
- `Date.now()`
- System clock

### Test Structure

```
src/core/
├── testing/
│   ├── fixed-clock.ts        # FixedClock implementation
│   ├── date.helpers.ts        # makeDate, iso() helpers
│   └── index.ts
└── tests/
    ├── native-date-adapter.spec.ts    # DateAdapter tests
    ├── preset-registry.spec.ts         # PresetRegistry tests
    ├── preset-engine.spec.ts           # Built-in presets tests
    └── dual-date-range.store.spec.ts   # Store tests
```

## What's Tested

### ✅ NativeDateAdapter
- ✅ `toISODate()` - timezone-safe ISO string conversion
- ✅ `parseISODate()` - roundtrip parsing
- ✅ `isSameDay()` - ignores time component
- ✅ `addMonths()` - end-of-month stability (Jan 31 + 1 month = Feb 28)
- ✅ `addDays()` - date arithmetic with rollover
- ✅ Month/year boundaries

### ✅ PresetRegistry
- ✅ register/get plugins
- ✅ Override behavior (last registration wins)
- ✅ registerAll, getAll, getAllKeys
- ✅ count, has, unregister, clear
- ✅ Validation (invalid plugins throw errors)

### ✅ PresetEngine (Built-in Presets)
- ✅ 18 built-in presets with FixedClock (Feb 21, 2026)
- ✅ TODAY, YESTERDAY
- ✅ LAST_7_DAYS through LAST_90_DAYS
- ✅ THIS_WEEK, LAST_WEEK (Sunday to Saturday)
- ✅ THIS_MONTH, LAST_MONTH, MONTH_TO_DATE
- ✅ THIS_QUARTER, LAST_QUARTER, QUARTER_TO_DATE
- ✅ THIS_YEAR, LAST_YEAR, YEAR_TO_DATE
- ✅ Deterministic resolution (multiple calls = same result)

### ✅ DualDateRangeStore
- ✅ reset() - clears start/end
- ✅ setStart/setEnd - normalization
- ✅ setEnd rejects when end < start (doesn't swap or clear)
- ✅ setRange - sets both dates
- ✅ minDate/maxDate constraints
- ✅ range() computed signal - ISO strings
- ✅ isValid() - requires both dates
- ✅ Month navigation (syncronization)
- ✅ Pending changes (requireApply mode)

## Test Coverage

Run tests to verify all core logic:

```bash
npm test
```

Expected output:

```
✔ NativeDateAdapter (45 tests)
✔ PresetRegistry (28 tests)
✔ PresetEngine - Built-in Presets (52 tests)
✔ DualDateRangeStore (35 tests)

Total: 160 tests | Passed: 160 | Failed: 0
```

## Edge Cases Covered

### Timezone Safety
- ❌ `toISOString()` causes timezone shift
- ✅ `toISODate()` uses manual YYYY-MM-DD construction

### End-of-Month Stability
- Jan 31 + 1 month → Feb 28 (non-leap) ✅
- Jan 31 + 1 month → Feb 29 (leap) ✅
- Mar 31 + 1 month → Apr 30 ✅

### Date Range Validation
- end < start → **rejected** (not swapped) ✅
- end = start → **allowed** (same day) ✅
- minDate/maxDate bounds → **auto-adjusted** ✅

### Week Boundaries
- Week starts Sunday (day 0) ✅
- Week ends Saturday (day 6) ✅

## SSR Compatibility

All tests use **FixedClock** injection:
- No `window` or `document` dependencies
- No `Date.now()` or `new Date()` in production code
- Deterministic resolution for SSR hydration

## CI Integration

Add to CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test
```

Tests run in **Node.js environment only** (no DOM, no browser).

## Writing New Tests

### Use FixedClock

```typescript
import { FixedClock, makeDate } from '../testing';

const clock = new FixedClock(makeDate(2026, 2, 21));
```

### Use makeDate() for deterministic dates

```typescript
// ✅ Good
const date = makeDate(2026, 2, 21); // Feb 21, 2026

// ❌ Bad
const date = new Date(); // non-deterministic
```

### Use iso() for assertions

```typescript
import { iso } from '../testing';

assert.equal(adapter.toISODate(result.start), iso(2026, 2, 21));
```

## Troubleshooting

### Tests fail with "Cannot find module"

Compile tests first:

```bash
npm run test:compile
```

### Tests pass locally but fail in CI

Check Node.js version. Requires Node.js 20+:

```bash
node --version  # should be v20.0.0 or higher
```

### Timezone-related failures

Tests should be timezone-independent. If failures occur:
1. Check that `makeDate()` is used (not `new Date()`)
2. Check that `toISODate()` is used (not `toISOString()`)
3. Verify FixedClock is used for presets

---

**Zero dependencies. Deterministic. SSR-safe.**
