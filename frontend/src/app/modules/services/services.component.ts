import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { EncodeUriPipe } from '../../shared/pipes/encode-uri.pipe';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { TravelService } from '../../shared/models/service.model';
import { SettingsService } from '../../core/services/settings.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbComponent, EncodeUriPipe],
  templateUrl: './services.component.html'
})
export class ServicesComponent implements OnInit {
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  public settingsService = inject(SettingsService);

  company = environment.company;

  breadcrumbItems = [
    { label: 'Our Services' }
  ];

  services = signal<TravelService[]>([]);
  isLoading = signal<boolean>(true);

  // Service Booking Modal
  isModalOpen = signal<boolean>(false);
  activeServiceForBooking = signal<TravelService | null>(null);

  bookingData = {
    name: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    message: ''
  };
  isSubmitting = signal<boolean>(false);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.apiService.getServices().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.services.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  openBookingModal(service: TravelService): void {
    this.activeServiceForBooking.set(service);
    this.isModalOpen.set(true);
  }

  closeBookingModal(): void {
    this.isModalOpen.set(false);
    this.activeServiceForBooking.set(null);
  }

  submitServiceBooking(): void {
    if (!this.bookingData.name || !this.bookingData.phone) {
      this.notificationService.warning('Please provide your name and phone number.');
      return;
    }

    const serviceName = this.activeServiceForBooking()?.title || 'General Service Inquiry';

    this.isSubmitting.set(true);
    this.apiService.createBooking({
      name: this.bookingData.name,
      phone: this.bookingData.phone,
      email: this.bookingData.email ? this.bookingData.email.trim() : '',
      service: serviceName,
      date: new Date(this.bookingData.date),
      message: this.bookingData.message || `Booking request for ${serviceName}`
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.success(`Thank you! Your booking for ${serviceName} is received. We will confirm shortly.`);
        this.closeBookingModal();
        this.bookingData.name = '';
        this.bookingData.phone = '';
        this.bookingData.email = '';
        this.bookingData.message = '';
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notificationService.error('Failed to submit booking inquiry. Please call us directly.');
      }
    });
  }
}
