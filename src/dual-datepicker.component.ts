import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef, forwardRef, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateAdapter, DATE_ADAPTER } from './date-adapter';
import { NativeDateAdapter } from './native-date-adapter';

export interface DateRange {
  fechaInicio: string;
  fechaFin: string;
  rangoTexto: string;
}

export interface MultiDateRange {
  ranges: DateRange[];
}

export interface PresetRange {
  start: string;
  end: string;
}

export interface PresetConfig {
  label: string;
  /** @deprecated Use getValue() instead for more flexibility */
  daysAgo?: number;
  getValue?: () => PresetRange;
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
    },
    {
      provide: DATE_ADAPTER,
      useClass: NativeDateAdapter
    }
  ]
})
export class DualDatepickerComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() placeholder: string = 'Select date range';
  @Input() fechaInicio: string = '';
  @Input() fechaFin: string = '';
  @Input() showPresets: boolean = true;
  @Input() showClearButton: boolean = false;
  @Input() multiRange: boolean = false;
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
  @Output() multiDateRangeChange = new EventEmitter<MultiDateRange>();
  @Output() multiDateRangeSelected = new EventEmitter<MultiDateRange>();

  // Date adapter injection
  private dateAdapter = inject<DateAdapter>(DATE_ADAPTER);

  // Signals for reactive state
  mostrarDatePicker = signal(false);
  rangoFechas = signal('');
  fechaSeleccionandoInicio = signal(true);
  mesActual = signal(this.dateAdapter.today());
  mesAnterior = signal(this.dateAdapter.today());
  diasMesActual = signal<any[]>([]);
  diasMesAnterior = signal<any[]>([]);
  isDisabled = signal(false);
  
  // Multi-range support
  selectedRanges = signal<DateRange[]>([]);
  currentRangeIndex = signal<number>(-1);

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
    const year = this.dateAdapter.getYear(fecha);
    const month = String(this.dateAdapter.getMonth(fecha) + 1).padStart(2, '0');
    const day = String(this.dateAdapter.getDate(fecha)).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatearFechaDisplay(fechaStr: string): string {
    if (!fechaStr) return '';
    const fecha = this.dateAdapter.parse(fechaStr);
    if (!fecha) return '';
    const monthNames = this.locale.monthNamesShort || this.defaultMonthNamesShort;
    return `${this.dateAdapter.getDate(fecha)} ${monthNames[this.dateAdapter.getMonth(fecha)]}`;
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
      const año = this.dateAdapter.getYear(mesActualValue);
      const mes = this.dateAdapter.getMonth(mesActualValue);
      const mesAnteriorDate = this.dateAdapter.createDate(año, mes - 1, 1);
      this.mesAnterior.set(mesAnteriorDate);
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
    const año = this.dateAdapter.getYear(fecha);
    const mes = this.dateAdapter.getMonth(fecha);
    const primerDia = this.dateAdapter.createDate(año, mes, 1);
    const ultimoDia = this.dateAdapter.createDate(año, mes + 1, 0);
    const diasEnMes = this.dateAdapter.getDate(ultimoDia);
    const primerDiaSemana = this.dateAdapter.getDay(primerDia);

    const diasMes = [];

    for (let i = 0; i < primerDiaSemana; i++) {
      diasMes.push({ dia: null, esMesActual: false });
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = this.dateAdapter.createDate(año, mes, dia);
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
    if (this.multiRange) {
      // Check if date is in any of the selected ranges
      return this.selectedRanges().some(range => {
        return fechaStr >= range.fechaInicio && fechaStr <= range.fechaFin;
      });
    } else {
      if (!this.fechaInicio || !this.fechaFin) return false;
      return fechaStr >= this.fechaInicio && fechaStr <= this.fechaFin;
    }
  }

  seleccionarDia(diaObj: any): void {
    if (!diaObj.esMesActual || this.isDisabled()) return;

    if (this.multiRange) {
      // Multi-range mode: add ranges to array
      if (this.fechaSeleccionandoInicio()) {
        this.fechaInicio = diaObj.fecha;
        this.fechaFin = '';
        this.rangoFechas.set('');
        this.fechaSeleccionandoInicio.set(false);
      } else {
        if (diaObj.fecha < this.fechaInicio) {
          this.fechaFin = this.fechaInicio;
          this.fechaInicio = diaObj.fecha;
        } else {
          this.fechaFin = diaObj.fecha;
        }
        
        // Add the new range to the array
        const newRange: DateRange = {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
          rangoTexto: this.formatearFechaDisplay(this.fechaInicio) + ' – ' + this.formatearFechaDisplay(this.fechaFin)
        };
        
        const currentRanges = [...this.selectedRanges()];
        currentRanges.push(newRange);
        this.selectedRanges.set(currentRanges);
        
        // Reset for next range selection
        this.fechaInicio = '';
        this.fechaFin = '';
        this.fechaSeleccionandoInicio.set(true);
        
        // Update display text
        this.actualizarMultiRangoTexto();
        
        // Don't close if multiRange, allow adding more ranges
        if (this.closeOnSelection && !this.multiRange) {
          this.mostrarDatePicker.set(false);
        }
        
        this.emitirMultiCambio();
        this.emitirMultiSeleccion();
      }
      this.generarCalendarios();
    } else {
      // Single range mode (original behavior)
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
  }

  cambiarMes(direccion: number): void {
    const mesActualValue = this.mesActual();
    const año = this.dateAdapter.getYear(mesActualValue);
    const mes = this.dateAdapter.getMonth(mesActualValue);
    const nuevoMesActual = this.dateAdapter.createDate(año, mes + direccion, 1);
    this.mesActual.set(nuevoMesActual);
    
    const añoNuevo = this.dateAdapter.getYear(nuevoMesActual);
    const mesNuevo = this.dateAdapter.getMonth(nuevoMesActual);
    const mesAnteriorNuevo = this.dateAdapter.createDate(añoNuevo, mesNuevo - 1, 1);
    this.mesAnterior.set(mesAnteriorNuevo);
    this.generarCalendarios();
  }

  getNombreMes(fecha: Date): string {
    const monthNames = this.locale.monthNames || this.defaultMonthNames;
    return `${monthNames[this.dateAdapter.getMonth(fecha)]} ${this.dateAdapter.getYear(fecha)}`;
  }

  getDayNames(): string[] {
    return this.locale.dayNamesShort || this.defaultDayNamesShort;
  }

  seleccionarRangoPredefinido(preset: PresetConfig): void {
    let start: string;
    let end: string;

    // New flexible pattern with getValue()
    if (preset.getValue) {
      const range = preset.getValue();
      start = range.start;
      end = range.end;
    }
    // Backward compatibility with daysAgo pattern
    else if (preset.daysAgo !== undefined) {
      const hoy = this.dateAdapter.today();
      const fechaInicio = this.dateAdapter.addDays(hoy, -preset.daysAgo);
      start = this.formatearFecha(fechaInicio);
      end = this.formatearFecha(hoy);
    }
    else {
      console.error('PresetConfig must have either getValue() or daysAgo');
      return;
    }

    this.fechaInicio = start;
    this.fechaFin = end;
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
    
    if (this.multiRange) {
      this.selectedRanges.set([]);
      this.currentRangeIndex.set(-1);
      this.emitirMultiCambio();
    } else {
      this.emitirCambio();
    }
    
    this.onTouched();
    this.generarCalendarios();
  }
  
  eliminarRango(index: number): void {
    if (!this.multiRange) return;
    
    const currentRanges = [...this.selectedRanges()];
    currentRanges.splice(index, 1);
    this.selectedRanges.set(currentRanges);
    
    this.actualizarMultiRangoTexto();
    this.emitirMultiCambio();
    this.emitirMultiSeleccion();
    this.generarCalendarios();
  }
  
  private actualizarMultiRangoTexto(): void {
    const count = this.selectedRanges().length;
    if (count === 0) {
      this.rangoFechas.set('');
    } else if (count === 1) {
      this.rangoFechas.set('1 range selected');
    } else {
      this.rangoFechas.set(`${count} ranges selected`);
    }
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
  
  private emitirMultiCambio(): void {
    this.multiDateRangeChange.emit({
      ranges: this.selectedRanges()
    });
  }
  
  private emitirMultiSeleccion(): void {
    this.multiDateRangeSelected.emit({
      ranges: this.selectedRanges()
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
