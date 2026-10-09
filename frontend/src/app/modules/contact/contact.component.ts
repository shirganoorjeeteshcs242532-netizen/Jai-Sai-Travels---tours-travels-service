import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { environment } from '../../../environments/environment';

import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  settingsService = inject(SettingsService);

  breadcrumbItems = [
    { label: 'Contact Us' }
  ];

  contactForm = {
    name: '',
    email: '',
    phone: '',
    service: 'Toyota Innova Crysta Rental',
    date: new Date().toISOString().split('T')[0],
    message: ''
  };

  isSubmitting = signal<boolean>(false);

  submitForm(): void {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.phone) {
      this.notificationService.warning('Please fill in your name, email and phone number.');
      return;
    }

    this.isSubmitting.set(true);
    this.apiService.createBooking({
      name: this.contactForm.name,
      email: this.contactForm.email,
      phone: this.contactForm.phone,
      service: this.contactForm.service,
      date: new Date(this.contactForm.date),
      message: this.contactForm.message || 'Contact message inquiry.'
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.success('Thank you for reaching out! We will contact you immediately.');
        this.contactForm = {
          name: '',
          email: '',
          phone: '',
          service: 'Toyota Innova Crysta Rental',
          date: new Date().toISOString().split('T')[0],
          message: ''
        };
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notificationService.error('Could not submit inquiry. Please call us directly.');
      }
    });
  }
}
