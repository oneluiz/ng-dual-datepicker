import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DualDatepickerComponent, DateRange, PresetConfig } from '../../../src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DualDatepickerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Ejemplo 1: Básico
  example1Range: DateRange | null = null;

  // Ejemplo 2: Con presets personalizados
  example2Range: DateRange | null = null;
  customPresets: PresetConfig[] = [
    { label: 'Hoy', daysAgo: 0 },
    { label: 'Última semana', daysAgo: 7 },
    { label: 'Último mes', daysAgo: 30 },
    { label: 'Últimos 3 meses', daysAgo: 90 }
  ];

  // Ejemplo 3: Con colores personalizados (GitHub style)
  example3Range: DateRange | null = null;

  // Ejemplo 4: Con presets y colores personalizados
  example4Range: DateRange | null = null;

  // Ejemplo 5: Sin presets, solo calendario
  example5Range: DateRange | null = null;

  // Ejemplo 6: Con fechas iniciales
  example6Range: DateRange | null = null;
  fechaInicio = '2026-02-01';
  fechaFin = '2026-02-18';

  onDateRangeChange(example: number, range: DateRange) {
    switch(example) {
      case 1:
        this.example1Range = range;
        break;
      case 2:
        this.example2Range = range;
        break;
      case 3:
        this.example3Range = range;
        break;
      case 4:
        this.example4Range = range;
        break;
      case 5:
        this.example5Range = range;
        break;
      case 6:
        this.example6Range = range;
        break;
    }
  }

  get codeExamples() {
    return {
      basic: `<ngx-dual-datepicker
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>`,
      presets: `<ngx-dual-datepicker
  [presets]="customPresets"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// En tu componente:
customPresets: PresetConfig[] = [
  { label: 'Hoy', daysAgo: 0 },
  { label: 'Última semana', daysAgo: 7 },
  { label: 'Último mes', daysAgo: 30 }
];`,
      colors: `<ngx-dual-datepicker
  inputBackgroundColor="#0d1117"
  inputTextColor="#c9d1d9"
  inputBorderColor="#30363d"
  inputBorderColorHover="#58a6ff"
  inputBorderColorFocus="#58a6ff"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>`,
      noPresets: `<ngx-dual-datepicker
  [showPresets]="false"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>`,
      initial: `<ngx-dual-datepicker
  [fechaInicio]="fechaInicio"
  [fechaFin]="fechaFin"
  (dateRangeChange)="onDateRangeChange($event)">
</ngx-dual-datepicker>

// En tu componente:
fechaInicio = '2026-02-01';
fechaFin = '2026-02-18';`,
      install: `npm install @oneluiz/dual-datepicker`
    };
  }
}
