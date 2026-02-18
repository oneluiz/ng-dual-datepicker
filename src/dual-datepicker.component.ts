import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef, forwardRef, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DateRange {
  fechaInicio: string;
  fechaFin: string;
  rangoTexto: string;
}

export interface PresetConfig {
  label: string;
  daysAgo: number;
}

export interface LocaleConfig {
  monthNames?: string[];
  monthNamesShort?: string[];
  dayNames?: string[];
  dayNamesShort?: string[];
  firstDayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
}

@Component({
  selector: 'ngx-dual-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dual-datepicker.component.html',
  styleUrl: './dual-datepicker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DualDatepickerComponent),
      multi: true
    }
  ]
})
export class DualDatepickerComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() placeholder: string = 'Select date range';
  @Input() fechaInicio: string = '';
  @Input() fechaFin: string = '';
  @Input() showPresets: boolean = true;
  @Input() showClearButton: boolean = false;
  @Input() closeOnSelection: boolean = true;
  @Input() closeOnPresetSelection: boolean = true;
  @Input() closeOnClickOutside: boolean = true;
  @Input() presets: PresetConfig[] = [
    { label: 'Last month', daysAgo: 30 },
    { label: 'Last 6 months', daysAgo: 180 },
    { label: 'Last year', daysAgo: 365 }
  ];
  @Input() inputBackgroundColor: string = '#fff';
  @Input() inputTextColor: string = '#495057';
  @Input() inputBorderColor: string = '#ced4da';
  @Input() inputBorderColorHover: string = '#ced4da';
  @Input() inputBorderColorFocus: string = '#80bdff';
  @Input() inputPadding: string = '0.375rem 0.75rem';
  @Input() locale: LocaleConfig = {};

  @Output() dateRangeChange = new EventEmitter<DateRange>();
  @Output() dateRangeSelected = new EventEmitter<DateRange>();

  // Signals for reactive state
  mostrarDatePicker = signal(false);
  rangoFechas = signal('');
  fechaSeleccionandoInicio = signal(true);
  mesActual = signal(new Date());
  mesAnterior = signal(new Date());
  diasMesActual = signal<any[]>([]);
  diasMesAnterior = signal<any[]>([]);
  isDisabled = signal(false);

  // Computed values
  nombreMesActual = computed(() => this.getNombreMes(this.mesActual()));
  nombreMesAnterior = computed(() => this.getNombreMes(this.mesAnterior()));
  diasSemana = computed(() => this.getDayNames());

  private readonly defaultMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private readonly defaultMonthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private readonly defaultDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  private readonly defaultDayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // ControlValueAccessor callbacks
  private onChange: (value: DateRange | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {
    // Effect to emit changes when dates change
    effect(() => {
      const rango = this.rangoFechas();
      if (this.fechaInicio || this.fechaFin) {
        this.onChange(this.getDateRangeValue());
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.mostrarDatePicker() && this.closeOnClickOutside) {
      const clickedInside = this.elementRef.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.cerrarDatePicker();
      }
    }
  }

  ngOnInit(): void {
    if (this.fechaInicio && this.fechaFin) {
      this.actualizarRangoFechasTexto();
      this.generarCalendarios();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fechaInicio'] || changes['fechaFin']) {
      if (this.fechaInicio && this.fechaFin) {
        this.actualizarRangoFechasTexto();
        this.generarCalendarios();
      } else if (!this.fechaInicio && !this.fechaFin) {
        this.rangoFechas.set('');
      }
    }
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatearFechaDisplay(fechaStr: string): string {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr + 'T00:00:00');
    const monthNames = this.locale.monthNamesShort || this.defaultMonthNamesShort;
    return `${fecha.getDate()} ${monthNames[fecha.getMonth()]}`;
  }

  actualizarRangoFechasTexto(): void {
    if (this.fechaInicio && this.fechaFin) {
      const inicio = this.formatearFechaDisplay(this.fechaInicio);
      const fin = this.formatearFechaDisplay(this.fechaFin);
      this.rangoFechas.set(`${inicio} - ${fin}`);
    } else {
      this.rangoFechas.set('');
    }
  }

  toggleDatePicker(): void {
    this.mostrarDatePicker.update(value => !value);
    if (this.mostrarDatePicker()) {
      this.fechaSeleccionandoInicio.set(true);
      const mesActualValue = this.mesActual();
      this.mesAnterior.set(new Date(mesActualValue.getFullYear(), mesActualValue.getMonth() - 1, 1));
      this.generarCalendarios();
    }
    this.onTouched();
  }

  cerrarDatePicker(): void {
    this.mostrarDatePicker.set(false);
    this.onTouched();
  }

  generarCalendarios(): void {
    this.diasMesAnterior.set(this.generarCalendarioMes(this.mesAnterior()));
    this.diasMesActual.set(this.generarCalendarioMes(this.mesActual()));
  }

  generarCalendarioMes(fecha: Date): any[] {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const diasMes = [];

    for (let i = 0; i < primerDiaSemana; i++) {
      diasMes.push({ dia: null, esMesActual: false });
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(año, mes, dia);
      const fechaStr = this.formatearFecha(fechaDia);
      diasMes.push({
        dia: dia,
        fecha: fechaStr,
        esMesActual: true,
        esInicio: this.fechaInicio === fechaStr,
        esFin: this.fechaFin === fechaStr,
        enRango: this.estaEnRango(fechaStr)
      });
    }

    return diasMes;
  }

  estaEnRango(fechaStr: string): boolean {
    if (!this.fechaInicio || !this.fechaFin) return false;
    return fechaStr >= this.fechaInicio && fechaStr <= this.fechaFin;
  }

  seleccionarDia(diaObj: any): void {
    if (!diaObj.esMesActual || this.isDisabled()) return;

    if (this.fechaSeleccionandoInicio()) {
      this.fechaInicio = diaObj.fecha;
      this.fechaFin = '';
      this.rangoFechas.set('');
      this.fechaSeleccionandoInicio.set(false);
      this.emitirCambio();
    } else {
      if (diaObj.fecha < this.fechaInicio) {
        this.fechaFin = this.fechaInicio;
        this.fechaInicio = diaObj.fecha;
      } else {
        this.fechaFin = diaObj.fecha;
      }
      this.actualizarRangoFechasTexto();
      if (this.closeOnSelection) {
        this.mostrarDatePicker.set(false);
      }
      this.fechaSeleccionandoInicio.set(true);
      this.emitirCambio();
      this.emitirSeleccion();
    }
    this.generarCalendarios();
  }

  cambiarMes(direccion: number): void {
    const mesActualValue = this.mesActual();
    this.mesActual.set(new Date(mesActualValue.getFullYear(), mesActualValue.getMonth() + direccion, 1));
    const nuevoMesActual = this.mesActual();
    this.mesAnterior.set(new Date(nuevoMesActual.getFullYear(), nuevoMesActual.getMonth() - 1, 1));
    this.generarCalendarios();
  }

  getNombreMes(fecha: Date): string {
    const monthNames = this.locale.monthNames || this.defaultMonthNames;
    return `${monthNames[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  getDayNames(): string[] {
    return this.locale.dayNamesShort || this.defaultDayNamesShort;
  }

  seleccionarRangoPredefinido(preset: PresetConfig): void {
    const hoy = new Date();
    const fechaInicio = new Date(hoy);
    fechaInicio.setDate(hoy.getDate() - preset.daysAgo);

    this.fechaInicio = this.formatearFecha(fechaInicio);
    this.fechaFin = this.formatearFecha(hoy);
    this.actualizarRangoFechasTexto();
    this.generarCalendarios();
    if (this.closeOnPresetSelection) {
      this.mostrarDatePicker.set(false);
    }
    this.emitirSeleccion();
  }

  limpiar(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.rangoFechas.set('');
    this.mostrarDatePicker.set(false);
    this.fechaSeleccionandoInicio.set(true);
    this.emitirCambio();
    this.onTouched();
  }

  private emitirCambio(): void {
    this.dateRangeChange.emit({
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      rangoTexto: this.rangoFechas()
    });
  }

  private emitirSeleccion(): void {
    this.dateRangeSelected.emit({
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      rangoTexto: this.rangoFechas()
    });
  }

  private getDateRangeValue(): DateRange {
    return {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      rangoTexto: this.rangoFechas()
    };
  }

  // ControlValueAccessor implementation
  writeValue(value: DateRange | null): void {
    if (value) {
      this.fechaInicio = value.fechaInicio || '';
      this.fechaFin = value.fechaFin || '';
      if (this.fechaInicio && this.fechaFin) {
        this.actualizarRangoFechasTexto();
        this.generarCalendarios();
      }
    } else {
      this.fechaInicio = '';
      this.fechaFin = '';
      this.rangoFechas.set('');
    }
  }

  registerOnChange(fn: (value: DateRange | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
