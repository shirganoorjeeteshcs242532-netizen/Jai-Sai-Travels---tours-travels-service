import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { SiteSettings } from '../../shared/models/admin.model';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiService = inject(ApiService);

  // Reactive global signal for site settings
  settings = signal<SiteSettings>({
    siteTitle: environment.company.name + ' - Tours & Travels Car Rental Service',
    tagline: environment.company.tagline,
    contactPhone: environment.company.phone,
    contactPhone2: environment.company.phone2,
    whatsappPhone: environment.company.whatsapp,
    whatsappPhone2: environment.company.whatsapp2,
    contactEmail: environment.company.email,
    address: environment.company.address,
    businessHours: environment.company.hours,
    theme: 'theme-default',
    socialLinks: {
      facebook: 'https://facebook.com/jaisaitravels',
      instagram: 'https://instagram.com/jaisaitravels',
      youtube: 'https://youtube.com/@jaisaitravels',
      whatsapp: `https://wa.me/${environment.company.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20Jai%20Sai%20Travels,%20I%20would%20like%20to%20enquire%20about%20your%20car%20rental%20and%20tour%20packages.`,
      whatsapp2: `https://wa.me/${environment.company.whatsapp2.replace(/[^0-9]/g, '')}?text=Hello%20Jai%20Sai%20Travels,%20I%20would%20like%20to%20enquire%20about%20your%20car%20rental%20and%20tour%20packages.`
    },
    googleReviewUrl: 'https://share.google/Al7nlldXLMbIoH9Ih'
  });

  constructor() {
    this.loadSettings();
  }

  loadSettings(): void {
    this.apiService.getSettings().subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          this.settings.set({
            ...this.settings(),
            ...res.data
          });
        }
      },
      error: () => {
        // Fallback to environment defaults already set
      }
    });
  }

  updateSettings(newSettings: Partial<SiteSettings>): Observable<{ success: boolean; message: string; data: SiteSettings }> {
    return this.apiService.updateSettings(newSettings).pipe(
      tap((res) => {
        if (res && res.success && res.data) {
          this.settings.set({
            ...this.settings(),
            ...res.data
          });
        }
      })
    );
  }
}
