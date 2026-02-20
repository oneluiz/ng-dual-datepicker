# Theming System

The `ng-dual-datepicker` component comes with a flexible theming system that allows you to style it according to your preferred CSS framework or custom design.

## Available Themes

- **default** - Original styling (no additional imports needed)
- **bootstrap** - Bootstrap 5 compatible styling
- **bulma** - Bulma CSS compatible styling
- **foundation** - Foundation CSS compatible styling
- **tailwind** - Tailwind CSS compatible styling
- **custom** - Customizable theme with CSS variables

## Usage

### 1. Set the Theme

Add the `theme` input to your component:

```html
<ngx-dual-datepicker 
  theme="bootstrap"
  [presets]="presets"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>
```

### 2. Import the Theme Styles

Import the corresponding theme stylesheet in your global `styles.scss`:

```scss
// For Bootstrap theme
@import '@oneluiz/dual-datepicker/themes/bootstrap';

// For Bulma theme
@import '@oneluiz/dual-datepicker/themes/bulma';

// For Foundation theme
@import '@oneluiz/dual-datepicker/themes/foundation';

// For Tailwind theme
@import '@oneluiz/dual-datepicker/themes/tailwind';

// For Custom theme
@import '@oneluiz/dual-datepicker/themes/custom';
```

## Theme Details

### Default Theme

No additional configuration needed. This is the original styling that works out of the box.

```html
<ngx-dual-datepicker [presets]="presets"></ngx-dual-datepicker>
```

### Bootstrap Theme

Compatible with Bootstrap 5. Make sure you have Bootstrap CSS loaded in your project.

```html
<ngx-dual-datepicker theme="bootstrap" [presets]="presets"></ngx-dual-datepicker>
```

```scss
@import '@oneluiz/dual-datepicker/themes/bootstrap';
```

### Bulma Theme

Compatible with Bulma CSS. Make sure you have Bulma CSS loaded in your project.

```html
<ngx-dual-datepicker theme="bulma" [presets]="presets"></ngx-dual-datepicker>
```

```scss
@import '@oneluiz/dual-datepicker/themes/bulma';
```

### Foundation Theme

Compatible with Foundation CSS. Make sure you have Foundation CSS loaded in your project.

```html
<ngx-dual-datepicker theme="foundation" [presets]="presets"></ngx-dual-datepicker>
```

```scss
@import '@oneluiz/dual-datepicker/themes/foundation';
```

### Tailwind CSS Theme

Compatible with Tailwind CSS. Make sure you have Tailwind configured in your project.

```html
<ngx-dual-datepicker theme="tailwind" [presets]="presets"></ngx-dual-datepicker>
```

```scss
@import '@oneluiz/dual-datepicker/themes/tailwind';
```

### Custom Theme

The custom theme provides CSS variables that you can easily override to match your brand colors.

```html
<ngx-dual-datepicker theme="custom" [presets]="presets"></ngx-dual-datepicker>
```

```scss
@import '@oneluiz/dual-datepicker/themes/custom';

// Override the CSS variables
.datepicker-wrapper.theme-custom {
  --dp-primary-color: #ff6b6b;
  --dp-primary-hover: #ee5a6f;
  --dp-danger-color: #fa5252;
  --dp-danger-hover: #e03131;
  --dp-text-color: #2d3748;
  --dp-text-muted: #718096;
  --dp-border-color: #e2e8f0;
  --dp-border-hover: #cbd5e0;
  --dp-bg-color: #ffffff;
  --dp-bg-hover: #f7fafc;
  --dp-bg-disabled: #edf2f7;
  --dp-border-radius: 0.5rem;
}
```

## Available CSS Variables (Custom Theme)

| Variable | Default Value | Description |
|----------|--------------|-------------|
| `--dp-primary-color` | `#3b82f6` | Primary button and selection color |
| `--dp-primary-hover` | `#2563eb` | Primary hover state color |
| `--dp-danger-color` | `#ef4444` | Danger/close button color |
| `--dp-danger-hover` | `#dc2626` | Danger hover state color |
| `--dp-text-color` | `#1f2937` | Main text color |
| `--dp-text-muted` | `#6b7280` | Muted/placeholder text color |
| `--dp-border-color` | `#d1d5db` | Border color |
| `--dp-border-hover` | `#9ca3af` | Border hover color |
| `--dp-bg-color` | `#ffffff` | Background color |
| `--dp-bg-hover` | `#f3f4f6` | Hover background color |
| `--dp-bg-disabled` | `#f9fafb` | Disabled state background |
| `--dp-border-radius` | `0.375rem` | Border radius for elements |
| `--dp-transition` | `all 0.15s ease` | Transition effect |

## Creating Your Own Theme

You can create your own theme by:

1. Creating a new SCSS file (e.g., `my-theme.scss`)
2. Targeting the `.datepicker-wrapper.theme-custom` class
3. Defining your custom styles

Example:

```scss
// my-theme.scss
.datepicker-wrapper.theme-custom {
  .datepicker-input {
    // Your custom styles
    border: 2px solid #your-color;
    border-radius: 12px;
  }

  .date-picker-dropdown {
    // Your custom styles
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  }

  .day.selected {
    // Your custom styles
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}
```

## TypeScript Type

The theme type is exported from the library:

```typescript
import { ThemeType } from '@oneluiz/dual-datepicker';

const myTheme: ThemeType = 'bootstrap';
```

## Mixing Themes and Custom Inputs

You can still use the custom styling inputs (`inputBackgroundColor`, `inputBorderColor`, etc.) along with themes. The input properties will override the theme styles:

```html
<ngx-dual-datepicker 
  theme="bootstrap"
  inputBorderColor="#ff0000"
  inputBorderColorFocus="#00ff00"
  [presets]="presets">
</ngx-dual-datepicker>
```

## Best Practices

1. **Choose One Theme**: Select one theme that matches your project's CSS framework
2. **Import Only What You Need**: Only import the theme stylesheet you're using
3. **Consistent Styling**: Use the same theme across all datepicker instances
4. **Custom Variables**: For small adjustments, use the Custom theme with CSS variables instead of creating a whole new theme

## Examples

### Bootstrap Project

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { DualDatepickerComponent } from '@oneluiz/dual-datepicker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DualDatepickerComponent],
  template: `
    <ngx-dual-datepicker 
      theme="bootstrap"
      [presets]="presets"
      (dateRangeChange)="onDateRangeChange($event)">
    </ngx-dual-datepicker>
  `
})
export class AppComponent {
  // ...
}
```

```scss
// styles.scss
@import 'bootstrap/scss/bootstrap';
@import '@oneluiz/dual-datepicker/themes/bootstrap';
```

### Tailwind Project

```typescript
// app.component.ts
template: `
  <ngx-dual-datepicker 
    theme="tailwind"
    [presets]="presets">
  </ngx-dual-datepicker>
`
```

```scss
// styles.scss
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
@import '@oneluiz/dual-datepicker/themes/tailwind';
```

### Custom Branded Theme

```typescript
// app.component.ts
template: `
  <ngx-dual-datepicker 
    theme="custom"
    [presets]="presets">
  </ngx-dual-datepicker>
`
```

```scss
// styles.scss
@import '@oneluiz/dual-datepicker/themes/custom';

.datepicker-wrapper.theme-custom {
  --dp-primary-color: #your-brand-color;
  --dp-primary-hover: #your-brand-hover-color;
  --dp-border-radius: 0.75rem;
}
```

## FAQ

**Q: Can I use multiple themes in the same application?**
A: Yes, but you'll need to import all the theme stylesheets you plan to use. Each component can have its own theme.

**Q: Do I need to import Bootstrap/Bulma/Foundation/Tailwind CSS separately?**
A: Yes, the theme stylesheets only provide datepicker-specific styles. You need to have the base framework CSS loaded in your project.

**Q: Can I switch themes dynamically?**
A: Yes, you can bind the `theme` input to a variable and change it at runtime.

```typescript
currentTheme: ThemeType = 'bootstrap';

switchTheme() {
  this.currentTheme = this.currentTheme === 'bootstrap' ? 'bulma' : 'bootstrap';
}
```

**Q: What happens if I don't import the theme stylesheet?**
A: The component will still work but will use the default inline styles. The theme-specific styles won't be applied.

## Support

For issues or questions about theming, please visit [GitHub Issues](https://github.com/oneluiz/ng-dual-datepicker/issues).
