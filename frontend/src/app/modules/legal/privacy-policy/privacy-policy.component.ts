import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { SettingsService } from '../../../core/services/settings.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent],
  templateUrl: './privacy-policy.component.html'
})
export class PrivacyPolicyComponent {
  public settingsService = inject(SettingsService);
  company = environment.company;
  lastUpdated = 'October 2026';

  breadcrumbItems = [
    { label: 'Privacy Policy' }
  ];
}
