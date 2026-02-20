# Time Picker - Date + Time Range Selection

> **NEW in v3.4.0** – Select precise datetime ranges with optional time picker

The time picker feature allows users to select not just date ranges, but precise datetime ranges. Perfect for appointment booking, event scheduling, meeting planners, and time-based reporting systems.

## Features

- ✅ **Optional Time Selection** – Enable/disable time picker per component
- 🕐 **12h or 24h Format** – Choose AM/PM or 24-hour format
- ⏱️ **Configurable Minute Steps** – 1, 5, 15, or 30-minute intervals
- 🎯 **Default Times** – Set default start and end times
- 🎨 **Works with All Themes** – Fully styled for all built-in themes
- 🔄 **Backward Compatible** – Disabled by default, won't affect existing implementations
- ✅ **requireApply Integration** – Works seamlessly with apply/confirm button

## Basic Usage

### Enable Time Picker (24h format)

```typescript
<ngx-dual-datepicker
  [enableTimePicker]="true"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>
```

**Result includes time:**
```typescript
{
  startDate: '2026-02-01',
  endDate: '2026-02-15',
  rangeText: '1 Feb - 15 Feb',
  startTime: '09:00',    // HH:mm format
  endTime: '17:30'       // HH:mm format
}
```

### 12-hour Format with AM/PM

```typescript
<ngx-dual-datepicker
  [enableTimePicker]="true"
  timeFormat="12h"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>
```

**Result with 12h format:**
```typescript
{
  startDate: '2026-02-01',
  endDate: '2026-02-15',
  rangeText: '1 Feb - 15 Feb',
  startTime: '09:00 AM',
  endTime: '05:30 PM'
}
```

### Custom Minute Steps

Control the granularity of minute selection:

```typescript
// 30-minute intervals
<ngx-dual-datepicker
  [enableTimePicker]="true"
  [minuteStep]="30"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// 15-minute intervals (default)
<ngx-dual-datepicker
  [enableTimePicker]="true"
  [minuteStep]="15"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// 5-minute intervals
<ngx-dual-datepicker
  [enableTimePicker]="true"
  [minuteStep]="5"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// 1-minute intervals (most precise)
<ngx-dual-datepicker
  [enableTimePicker]="true"
  [minuteStep]="1"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>
```

### Default Start/End Times

Set default times when the picker opens:

```typescript
<ngx-dual-datepicker
  [enableTimePicker]="true"
  defaultStartTime="09:00"
  defaultEndTime="18:00"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>
```

### With Apply/Confirm Button

Combine time picker with requireApply for controlled datetime selection:

```typescript
<ngx-dual-datepicker
  [enableTimePicker]="true"
  [requireApply]="true"
  defaultStartTime="08:00"
  defaultEndTime="17:00"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>
```

## Configuration Options

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `enableTimePicker` | boolean | false | Enable time selection |
| `timeFormat` | '12h' \| '24h' | '24h' | Time display format |
| `minuteStep` | number | 15 | Step for minute selector (1, 5, 15, 30) |
| `defaultStartTime` | string | '00:00' | Default start time (HH:mm format) |
| `defaultEndTime` | string | '23:59' | Default end time (HH:mm format) |

## DateRange Interface

When `enableTimePicker` is true, the DateRange interface includes optional time properties:

```typescript
interface DateRange {
  startDate: string;        // 'YYYY-MM-DD'
  endDate: string;          // 'YYYY-MM-DD'
  rangeText: string;        // Display text
  startTime?: string;       // 'HH:mm' or 'HH:mm AM/PM'
  endTime?: string;         // 'HH:mm' or 'HH:mm AM/PM'
}
```

## Use Cases

### Appointment Booking

```typescript
export class AppointmentComponent {
  selectedAppointment: DateRange | null = null;

  onAppointmentSelected(range: DateRange) {
    console.log(`Appointment scheduled:`);
    console.log(`From: ${range.startDate} at ${range.startTime}`);
    console.log(`To: ${range.endDate} at ${range.endTime}`);
  }
}
```

```html
<ngx-dual-datepicker
  [enableTimePicker]="true"
  timeFormat="12h"
  [minuteStep]="30"
  defaultStartTime="09:00"
  defaultEndTime="10:00"
  [requireApply]="true"
  (dateRangeChange)="onAppointmentSelected($event)">
</ngx-dual-datepicker>
```

### Event Scheduling

```typescript
export class EventComponent {
  eventRange: DateRange | null = null;

  scheduleEvent(range: DateRange) {
    const event = {
      startDateTime: `${range.startDate}T${range.startTime}`,
      endDateTime: `${range.endDate}T${range.endTime}`,
      duration: this.calculateDuration(range)
    };
    // Save event...
  }

  calculateDuration(range: DateRange): string {
    // Calculate duration logic...
    return '2 hours';
  }
}
```

```html
<ngx-dual-datepicker
  [enableTimePicker]="true"
  [minuteStep]="15"
  (dateRangeSelected)="scheduleEvent($event)">
</ngx-dual-datepicker>
```

### Meeting Planner

```typescript
export class MeetingComponent {
  meetingSchedule: DateRange | null = null;

  scheduleMeeting(range: DateRange) {
    // Send calendar invites with precise datetime
    this.calendarService.createEvent({
      start: `${range.startDate}T${range.startTime}:00`,
      end: `${range.endDate}T${range.endTime}:00`,
      title: 'Team Meeting'
    });
  }
}
```

```html
<ngx-dual-datepicker
  [enableTimePicker]="true"
  timeFormat="12h"
  [minuteStep]="30"
  defaultStartTime="10:00"
  defaultEndTime="11:00"
  [requireApply]="true"
  placeholder="Select meeting time"
  (dateRangeChange)="scheduleMeeting($event)">
</ngx-dual-datepicker>
```

## Time Picker UI

The time picker displays below the calendar with:

- **Start Time Section** – Hour and minute selectors for start time
- **End Time Section** – Hour and minute selectors for end time
- **Increment/Decrement Buttons** – Up/down arrows to adjust time
- **Visual Separator** – Clear distinction between start and end times
- **AM/PM Indicator** – Displayed when using 12h format

## Styling

The time picker is fully styled and works with all built-in themes:

- Default theme
- Bootstrap theme
- Bulma theme
- Foundation theme
- Tailwind theme
- Custom theme

All CSS is automatically included - no additional imports needed.

## Backward Compatibility

The time picker is **100% backward compatible**:

- ✅ Disabled by default (`enableTimePicker: false`)
- ✅ Existing code continues to work without changes
- ✅ Optional `startTime` and `endTime` properties in DateRange
- ✅ Works with all existing features (multi-range, disabled dates, presets, etc.)

## Keyboard Navigation

Time picker supports keyboard navigation:

- **Arrow Keys** – Increment/decrement hours and minutes
- **Tab** – Navigate between time inputs
- **Enter/Space** – Activate buttons
- **Escape** – Close picker

## Accessibility

The time picker is fully accessible:

- ✅ ARIA labels on all controls
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus management
- ✅ WCAG 2.1 AA compliant

## FAQ

**Q: Can I use time picker with multi-range mode?**  
A: Currently, time picker works best with single-range selection. Multi-range + time picker support is planned for a future release.

**Q: What time format is returned?**  
A: Time is always returned in HH:mm format (24h) for `timeFormat="24h"`, or HH:mm AM/PM for `timeFormat="12h"`.

**Q: Can I set time constraints (min/max times)?**  
A: Not yet. Time validation constraints are planned for a future release.

**Q: Does it work with Reactive Forms?**  
A: Yes! The time picker is fully integrated with ControlValueAccessor and works seamlessly with Reactive Forms.

**Q: What about time zones?**  
A: The time picker returns local time. Time zone handling should be done in your application logic.

## Examples

Check out the [live demo](https://oneluiz.github.io/ng-dual-datepicker/) for interactive examples of the time picker in action!

---

## See Also

- [README.md](README.md) – Main documentation
- [THEMING.md](THEMING.md) – Theming guide
- [MIGRATION_V3.md](MIGRATION_V3.md) – Migration guide

---

**Made with ♥️ for the Angular community**
