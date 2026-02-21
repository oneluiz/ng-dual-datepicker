# SSR-Safe Clock Injection

## Problem

Presets like "Last 7 Days" or "This Month" use `new Date()` internally, which causes:

- **SSR hydration mismatch**: Server renders "2026-02-14", client renders "2026-02-15"
- **Different filters in dashboards**: User sees different data after hydration
- **Different queries in ERP/BI**: Server-side rendering uses different date ranges
- **Cache inconsistency**: Server-rendered HTML has different dates than client state

## Example Issue

```typescript
// Server (SSR) - Renders at 23:50 UTC on Feb 14
preset('LAST_7_DAYS') → { start: '2026-02-07', end: '2026-02-14' }

// Client (Browser) - Hydrates at 00:10 UTC on Feb 15
preset('LAST_7_DAYS') → { start: '2026-02-08', end: '2026-02-15' }

// Result: Angular throws hydration mismatch error ❌
```

## Solution: Clock Injection (v3.5.0)

The **PresetEngine** now uses **Dependency Injection** to control time deterministically.

### Architecture

```
PresetEngine
    ↓ (injects)
DateClock ← You control this in SSR
    ↓
clock.now() → Deterministic Date
```

### Default Behavior (No Changes Required)

By default, `SystemClock` is used, which returns `new Date()`:

```typescript
// Client-side app (default)
bootstrapApplication(AppComponent);

// PresetEngine automatically uses SystemClock
// "Today" → actual today ✅
```

### SSR Setup

Override the `DATE_CLOCK` token to ensure server and client resolve identical presets:

```typescript
// server.ts (Angular Universal)
import { DATE_CLOCK } from '@oneluiz/dual-datepicker';

export function app() {
  const server = express();
  
  server.get('*', (req, res) => {
    // Fix clock to request time
    const requestTime = new Date();
    
    const html = await renderApplication(AppComponent, {
      providers: [
        {
          provide: DATE_CLOCK,
          useValue: {
            now: () => requestTime // ✅ Frozen time
          }
        }
      ]
    });
    
    res.send(html);
  });
}
```

### Client Hydration (Match Server)

```typescript
// main.ts
import { DATE_CLOCK } from '@oneluiz/dual-datepicker';

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: DATE_CLOCK,
      useValue: {
        // Get server-rendered time from transfer state or meta tag
        now: () => new Date(document.querySelector('meta[name="ssr-time"]')?.content || Date.now())
      }
    }
  ]
});
```

### Full SSR Example (Angular Universal)

```typescript
// Step 1: Server - Embed timestamp in HTML
import { DATE_CLOCK } from '@oneluiz/dual-datepicker';

const requestTime = new Date().toISOString();

const html = await renderApplication(AppComponent, {
  providers: [
    {
      provide: DATE_CLOCK,
      useValue: { now: () => new Date(requestTime) }
    }
  ]
});

// Inject timestamp into HTML
const htmlWithTime = html.replace(
  '</head>',
  `<meta name="ssr-time" content="${requestTime}"></head>`
);

res.send(htmlWithTime);
```

```typescript
// Step 2: Client - Read timestamp from HTML
import { DATE_CLOCK } from '@oneluiz/dual-datepicker';

const ssrTime = document.querySelector('meta[name="ssr-time"]')?.content;

bootstrapApplication(AppComponent, {
  providers: [
    ssrTime ? {
      provide: DATE_CLOCK,
      useValue: { now: () => new Date(ssrTime) }
    } : []
  ]
});
```

### Result

```
Server:  LAST_7_DAYS → { start: '2026-02-07', end: '2026-02-14' }
Client:  LAST_7_DAYS → { start: '2026-02-07', end: '2026-02-14' }
✅ Perfect hydration match!
```

## Testing

Control time for predictable test results:

```typescript
import { DATE_CLOCK } from '@oneluiz/dual-datepicker';

TestBed.configureTestingModule({
  providers: [
    {
      provide: DATE_CLOCK,
      useValue: {
        now: () => new Date('2026-01-15T12:00:00Z')
      }
    }
  ]
});

// Now all presets are deterministic ✅
expect(engine.resolve('TODAY')).toEqual({
  start: '2026-01-15',
  end: '2026-01-15'
});
```

## Use Cases

### 1. SSR Applications
Ensure server and client render identical date ranges.

### 2. ERP/BI Dashboards
Server-side rendered reports must match client filters exactly.

### 3. Hotel Booking Systems
Availability queries must be consistent across server and client.

### 4. E-commerce Analytics
Date filters for sales reports must be deterministic.

### 5. POS Systems
Transaction reports must show identical date ranges in SSR.

## API Reference

### DateClock Interface

```typescript
interface DateClock {
  now(): Date;
}
```

### DATE_CLOCK Token

```typescript
const DATE_CLOCK: InjectionToken<DateClock>
```

Injection token for overriding clock behavior.

### SystemClock (Default)

```typescript
@Injectable({ providedIn: 'root' })
class SystemClock implements DateClock {
  now(): Date {
    return new Date();
  }
}
```

Default implementation that uses system time.

## Backward Compatibility

✅ **Zero breaking changes**

Apps that don't use SSR continue working exactly as before.

The `SystemClock` is automatically provided by default, so existing code doesn't need any changes.

## Migration from v3.4.0

**No migration needed!**

Clock injection is optional. If you don't override `DATE_CLOCK`, the library uses `SystemClock` (which returns `new Date()`), maintaining identical behavior to v3.4.0.

## Why This Matters

In production ERP/BI/POS systems, date filter consistency is **business-critical**:

- **Invoicing**: "This Month" must resolve identically on server and client
- **Reporting**: SSR-rendered reports must match client-side data
- **Compliance**: Audit logs require deterministic timestamps
- **Caching**: CDN-cached HTML with date ranges must remain valid

Clock injection solves all these issues with **zero breaking changes** to existing code.

## Architecture Benefits

1. **Testable**: Control time in unit tests
2. **Deterministic**: Same input → same output
3. **SSR-Safe**: Server and client resolve identical presets
4. **Flexible**: Override for demos, replays, time-travel debugging
5. **Clean**: Dependency injection instead of global state

## Implementation Details

### Before (v3.4.0)

```typescript
class PresetEngine {
  resolve(key: string): PresetRange {
    const now = new Date(); // ❌ Non-deterministic
    return presets[key].resolve(now);
  }
}
```

### After (v3.5.0)

```typescript
@Injectable({ providedIn: 'root' })
class PresetEngine {
  private clock = inject(DATE_CLOCK);
  
  resolve(key: string): PresetRange {
    const now = this.clock.now(); // ✅ Deterministic
    return presets[key].resolve(now);
  }
}
```

## Questions?

- **Q: Do I need to change my code?**  
  A: No! By default, `SystemClock` is used (same behavior as v3.4.0).

- **Q: When should I override DATE_CLOCK?**  
  A: Only in SSR scenarios where server/client consistency is required.

- **Q: Can I still use `new Date()` in my presets?**  
  A: Yes, custom presets can do anything. But for SSR apps, use `clock.now()` from the resolver's `now` parameter.

- **Q: Does this affect bundle size?**  
  A: No. Clock injection adds ~0.5 KB. If not used, tree-shaking removes it.

- **Q: What about time zones?**  
  A: `DateClock` returns a `Date` object which respects the environment's time zone. For UTC consistency, use `new Date('2026-02-21T00:00:00Z')`.
