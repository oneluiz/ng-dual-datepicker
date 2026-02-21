/**
 * Headless Usage Examples
 * 
 * These examples show how to use DualDateRangeStore
 * WITHOUT the UI component
 */

import { Component, Injectable, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DualDateRangeStore, presetEngine, createPreset } from '@oneluiz/dual-datepicker';

// ============================================
// Example 1: Service Integration (No UI)
// ============================================

@Injectable({ providedIn: 'root' })
export class SalesService {
  private rangeStore = inject(DualDateRangeStore);
  private http = inject(HttpClient);

  constructor() {
    // Set default range on service initialization
    this.rangeStore.applyPreset('THIS_MONTH');
  }

  getSalesData() {
    const range = this.rangeStore.range();
    return this.http.get(`/api/sales`, {
      params: {
        start: range.start,
        end: range.end
      }
    });
  }

  // Expose range as signal for components to consume
  get dateRange() {
    return this.rangeStore.range;
  }

  get rangeText() {
    return this.rangeStore.rangeText;
  }

  // Methods to control range from anywhere
  setPreset(key: string) {
    this.rangeStore.applyPreset(key);
  }

  setCustomRange(start: string, end: string) {
    this.rangeStore.setRange(start, end);
  }
}

// ============================================
// Example 2: Dashboard with Global Filter
// ============================================

@Component({
  selector: 'app-sales-dashboard',
  template: `
    <div class="dashboard">
      <!-- Filter Controls -->
      <div class="filters">
        <h3>Date Range Filter</h3>
        <button (click)="applyPreset('TODAY')">Today</button>
        <button (click)="applyPreset('THIS_WEEK')">This Week</button>
        <button (click)="applyPreset('THIS_MONTH')">This Month</button>
        <button (click)="applyPreset('THIS_QUARTER')">This Quarter</button>
        <button (click)="applyPreset('THIS_YEAR')">This Year</button>
        <p>{{ rangeText() }}</p>
      </div>

      <!-- All charts react to same store -->
      <div class="charts">
        <app-sales-chart />
        <app-revenue-chart />
        <app-conversion-chart />
      </div>
    </div>
  `
})
export class SalesDashboardComponent {
  private rangeStore = inject(DualDateRangeStore);

  // Expose signals for template
  rangeText = this.rangeStore.rangeText;

  applyPreset(key: string) {
    this.rangeStore.applyPreset(key);
    // All child components using the same store will update automatically
  }
}

// Child chart component
@Component({
  selector: 'app-sales-chart',
  template: `<div>Sales Chart: {{ salesData() | json }}</div>`
})
export class SalesChartComponent {
  private salesService = inject(SalesService);
  salesData = this.salesService.dateRange;

  constructor() {
    // Auto-reload when range changes
    effect(() => {
      const range = this.salesService.dateRange();
      console.log('Sales chart reloading for:', range);
      // Trigger HTTP request or data refresh
    });
  }
}

// ============================================
// Example 3: Custom Fiscal Year Preset
// ============================================

export function registerFiscalYearPreset() {
  // Fiscal year starts July 1
  const fiscalYearPreset = createPreset((now: Date) => {
    const fiscalYear = now.getMonth() >= 6 
      ? now.getFullYear() 
      : now.getFullYear() - 1;
    
    const start = new Date(fiscalYear, 6, 1);    // July 1
    const end = new Date(fiscalYear + 1, 5, 30); // June 30
    
    return { start, end };
  });

  presetEngine.register('FISCAL_YEAR', fiscalYearPreset);
  presetEngine.register('LAST_FISCAL_YEAR', createPreset((now: Date) => {
    const fiscalYear = now.getMonth() >= 6 
      ? now.getFullYear() - 1
      : now.getFullYear() - 2;
    
    const start = new Date(fiscalYear, 6, 1);
    const end = new Date(fiscalYear + 1, 5, 30);
    
    return { start, end };
  }));
}

// ============================================
// Example 4: Report Generator (Pure Service)
// ============================================

@Injectable({ providedIn: 'root' })
export class ReportGeneratorService {
  private rangeStore = inject(DualDateRangeStore);
  private http = inject(HttpClient);

  generateSalesReport(format: 'pdf' | 'excel') {
    const range = this.rangeStore.range();
    
    return this.http.post('/api/reports/sales', {
      startDate: range.start,
      endDate: range.end,
      format
    }, { responseType: 'blob' });
  }

  generateInventoryReport() {
    const range = this.rangeStore.range();
    
    return this.http.get('/api/reports/inventory', {
      params: {
        start: range.start,
        end: range.end
      }
    });
  }

  // Validate range before generating
  canGenerate(): boolean {
    return this.rangeStore.isValid();
  }
}

// ============================================
// Example 5: Angular Resolver (SSR-safe)
// ============================================

import { ResolveFn } from '@angular/router';

export const dashboardResolver: ResolveFn<any> = () => {
  const rangeStore = inject(DualDateRangeStore);
  const http = inject(HttpClient);

  // Set default range
  rangeStore.applyPreset('THIS_MONTH');
  
  // Load data with range
  const range = rangeStore.range();
  return http.get('/api/dashboard', {
    params: {
      start: range.start,
      end: range.end
    }
  });
};

// ============================================
// Example 6: Multi-Store Pattern
// ============================================

@Component({
  selector: 'app-comparison-view',
  providers: [
    { provide: 'CURRENT_RANGE', useClass: DualDateRangeStore },
    { provide: 'PREVIOUS_RANGE', useClass: DualDateRangeStore }
  ],
  template: `
    <div class="comparison">
      <div class="period-1">
        <h3>Current Period</h3>
        <p>{{ currentText() }}</p>
        <button (click)="setCurrentPreset('THIS_MONTH')">This Month</button>
      </div>
      
      <div class="period-2">
        <h3>Previous Period</h3>
        <p>{{ previousText() }}</p>
        <button (click)="setPreviousPreset('LAST_MONTH')">Last Month</button>
      </div>

      <div class="metrics">
        <p>Growth: {{ calculateGrowth() }}%</p>
      </div>
    </div>
  `
})
export class ComparisonViewComponent {
  private currentStore = inject(DualDateRangeStore, { self: true, providedIn: 'CURRENT_RANGE' } as any);
  private previousStore = inject(DualDateRangeStore, { self: true, providedIn: 'PREVIOUS_RANGE' } as any);

  currentText = computed(() => this.currentStore.rangeText());
  previousText = computed(() => this.previousStore.rangeText());

  setCurrentPreset(key: string) {
    this.currentStore.applyPreset(key);
  }

  setPreviousPreset(key: string) {
    this.previousStore.applyPreset(key);
  }

  calculateGrowth() {
    // Compare metrics between both ranges
    return 0; // Implement your calculation
  }
}

// ============================================
// Example 7: State Persistence
// ============================================

@Injectable({ providedIn: 'root' })
export class RangePersistenceService {
  private rangeStore = inject(DualDateRangeStore);

  constructor() {
    // Load from localStorage on init
    this.loadPersistedRange();
    
    // Save on every change
    effect(() => {
      const range = this.rangeStore.range();
      localStorage.setItem('saved-range', JSON.stringify(range));
    });
  }

  private loadPersistedRange() {
    const saved = localStorage.getItem('saved-range');
    if (saved) {
      const range = JSON.parse(saved);
      this.rangeStore.loadSnapshot(range);
    } else {
      // Default to last 30 days
      this.rangeStore.applyPreset('LAST_30_DAYS');
    }
  }
}

// ============================================
// Example 8: Validation Before Action
// ============================================

@Component({
  selector: 'app-data-export',
  template: `
    <div>
      <h3>Export Data</h3>
      <p>Range: {{ rangeText() }}</p>
      <button 
        (click)="exportData()" 
        [disabled]="!isValidRange()">
        Export
      </button>
      @if (!isValidRange()) {
        <p class="error">Please select a valid date range</p>
      }
    </div>
  `
})
export class DataExportComponent {
  private rangeStore = inject(DualDateRangeStore);
  
  rangeText = this.rangeStore.rangeText;
  isValidRange = this.rangeStore.isValid;

  exportData() {
    if (!this.isValidRange()) return;
    
    const range = this.rangeStore.range();
    console.log('Exporting data for range:', range);
    // Perform export
  }
}

// ============================================
// Example 9: App-Wide Configuration
// ============================================

import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // Configure store on app startup
    {
      provide: APP_INITIALIZER,
      useFactory: (store: DualDateRangeStore) => () => {
        // Set validation rules
        store.configure({
          minDate: new Date(2020, 0, 1),
          maxDate: new Date(),
          enableTimePicker: false
        });
        
        // Set default range
        store.applyPreset('LAST_30_DAYS');
        
        // Register custom presets
        registerFiscalYearPreset();
      },
      deps: [DualDateRangeStore],
      multi: true
    }
  ]
};
