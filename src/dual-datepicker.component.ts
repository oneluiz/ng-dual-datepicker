import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DateRange {
  fechaInicio: string;
  fechaFin: string;
  rangoTexto: string;
}

export interface PresetConfig {
  label: string;
  daysAgo: number;
}

@Component({
  selector: 'ngx-dual-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dual-datepicker.component.html',
  styleUrl: './dual-datepicker.component.scss'
})
export class DualDatepickerComponent implements OnInit, OnChanges {
  @Input() placeholder: string = 'Select date range';
  @Input() fechaInicio: string = '';
  @Input() fechaFin: string = '';
  @Input() showPresets: boolean = true;
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

  @Output() dateRangeChange = new EventEmitter<DateRange>();
  @Output() dateRangeSelected = new EventEmitter<DateRange>();

  mostrarDatePicker = false;
  rangoFechas = '';
  fechaSeleccionandoInicio = true;
  mesActual = new Date();
  mesAnterior = new Date();
  diasMesActual: any[] = [];
  diasMesAnterior: any[] = [];

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.mostrarDatePicker && this.closeOnClickOutside) {
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
        this.rangoFechas = '';
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
    const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${fecha.getDate()} ${meses[fecha.getMonth()]}`;
  }

  actualizarRangoFechasTexto(): void {
    if (this.fechaInicio && this.fechaFin) {
      const inicio = this.formatearFechaDisplay(this.fechaInicio);
      const fin = this.formatearFechaDisplay(this.fechaFin);
      this.rangoFechas = `${inicio} - ${fin}`;
    } else {
      this.rangoFechas = '';
    }
  }

  toggleDatePicker(): void {
    this.mostrarDatePicker = !this.mostrarDatePicker;
    if (this.mostrarDatePicker) {
      this.fechaSeleccionandoInicio = true;
      this.mesAnterior = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
      this.generarCalendarios();
    }
  }

  cerrarDatePicker(): void {
    this.mostrarDatePicker = false;
  }

  generarCalendarios(): void {
    this.diasMesAnterior = this.generarCalendarioMes(this.mesAnterior);
    this.diasMesActual = this.generarCalendarioMes(this.mesActual);
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
    if (!diaObj.esMesActual) return;

    if (this.fechaSeleccionandoInicio) {
      this.fechaInicio = diaObj.fecha;
      this.fechaFin = '';
      this.fechaSeleccionandoInicio = false;
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
        this.mostrarDatePicker = false;
      }
      this.fechaSeleccionandoInicio = true;
      this.emitirSeleccion();
    }
    this.generarCalendarios();
  }

  cambiarMes(direccion: number): void {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + direccion, 1);
    this.mesAnterior = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
    this.generarCalendarios();
  }

  getNombreMes(fecha: Date): string {
    const meses = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
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
      this.mostrarDatePicker = false;
    }
    this.emitirSeleccion();
  }

  limpiar(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.rangoFechas = '';
    this.mostrarDatePicker = false;
    this.fechaSeleccionandoInicio = true;
    this.emitirCambio();
  }

  private emitirCambio(): void {
    this.dateRangeChange.emit({
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      rangoTexto: this.rangoFechas
    });
  }

  private emitirSeleccion(): void {
    this.dateRangeSelected.emit({
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      rangoTexto: this.rangoFechas
    });
  }
}
