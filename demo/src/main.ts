import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';
import { DATE_ADAPTER, NativeDateAdapter } from '../../src/public-api';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: DATE_ADAPTER, useClass: NativeDateAdapter }
  ]
})
  .catch(err => console.error(err));
