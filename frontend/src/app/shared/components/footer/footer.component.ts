import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  settingsService = inject(SettingsService);
  currentYear = new Date().getFullYear();

  quickServices = [
    { title: 'Local City Rental', path: '/services' },
    { title: 'Outstation Travel', path: '/services' },
    { title: '24/7 Airport Transfer', path: '/services' },
    { title: 'Corporate Car Rental', path: '/services' },
    { title: 'Wedding Convoy Fleet', path: '/services' },
    { title: 'Long Term Dedicated Lease', path: '/services' }
  ];

  popularDestinations = [
    'Mumbai to Pune',
    'Mumbai to Mahabaleshwar',
    'Mumbai to Shirdi Darshan',
    'Mumbai to Lonavala & Khandala',
    'Mumbai to Goa Road Trip',
    'Mumbai to Nashik Trimbakeshwar'
  ];
}
