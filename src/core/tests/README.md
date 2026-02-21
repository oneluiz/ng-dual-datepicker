# Core Tests

Deterministic tests for the headless date range core using Node.js built-in test runner.

## Test Files

- **native-date-adapter.spec.ts** - DateAdapter timezone-safe operations
- **preset-registry.spec.ts** - Plugin registration and retrieval
- **preset-engine.spec.ts** - Built-in presets with FixedClock
- **dual-date-range.store.spec.ts** - Headless store behavior

## Running Tests

```bash
# From project root
npm test
```

See [TESTING.md](../../TESTING.md) for complete guide.
