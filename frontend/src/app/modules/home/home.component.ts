import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { TravelService } from '../../shared/models/service.model';
import { SettingsService } from '../../core/services/settings.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  public settingsService = inject(SettingsService);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  company = environment.company;

  // Dynamic Cover Photo from Gallery Admin
  coverPhotoUrl = signal<string>('/uploads/photo-1791458143672-606816611.jpeg');

  // Typing animation properties with initial default text
  typedText = signal<string>('Luxury Toyota Innova Crysta');
  private typingPhrases = [
    'Toyota Innova Crysta Fleet',
    'Outstation & Holiday Trips',
    '24/7 Airport Pickup & Drop',
    'Wedding & Family Events'
  ];
  private currentPhraseIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typingTimer: any;
  private counterInterval: any;

  // Animated counters with full default values (Since 2005 => 21+ Years)
  statYears = signal<number>(21);
  statTrips = signal<number>(50000);
  statClients = signal<number>(250);
  statRating = signal<string>('4.9');

  // Featured services
  featuredServices = signal<TravelService[]>([]);
  isLoadingServices = signal<boolean>(true);

  // Quick inquiry form
  quickBooking = {
    name: '',
    phone: '',
    email: '',
    service: 'Toyota Innova Crysta - Outstation',
    date: new Date().toISOString().split('T')[0],
    message: ''
  };
  isSubmitting = signal<boolean>(false);


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        this.startTypingEffect();
        this.animateCounters();
      });
    }
    this.loadCoverPhoto();
    this.loadFeaturedServices();
  }

  ngOnDestroy(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    if (this.counterInterval) {
      clearInterval(this.counterInterval);
    }
  }

  resolveImageUrl(url?: string): string {
    if (!url) return '';
    if (url.includes('/uploads/')) {
      const filename = url.split('/uploads/')[1];
      return `/uploads/${filename}`;
    }
    if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
      return url.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/, environment.backendBaseUrl);
    }
    return url;
  }

  loadCoverPhoto(): void {
    this.apiService.getGallery().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          const coverItem = res.data.find(item => item.isCover);
          if (coverItem && coverItem.url) {
            this.coverPhotoUrl.set(this.resolveImageUrl(coverItem.url));
          } else if (res.data[0]?.url) {
            this.coverPhotoUrl.set(this.resolveImageUrl(res.data[0].url));
          }
        }
      }
    });
  }

  private startTypingEffect(): void {
    const currentPhrase = this.typingPhrases[this.currentPhraseIndex];

    if (this.isDeleting) {
      this.typedText.set(currentPhrase.substring(0, this.charIndex - 1));
      this.charIndex--;
    } else {
      this.typedText.set(currentPhrase.substring(0, this.charIndex + 1));
      this.charIndex++;
    }

    let typeSpeed = this.isDeleting ? 40 : 100;

    if (!this.isDeleting && this.charIndex === currentPhrase.length) {
      typeSpeed = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.typingPhrases.length;
      typeSpeed = 400;
    }

    this.typingTimer = setTimeout(() => this.startTypingEffect(), typeSpeed);
  }

  private animateCounters(): void {
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;

    let step = 0;
    const targetYears = 21;
    const targetTrips = 50000;
    const targetClients = 250;

    this.counterInterval = setInterval(() => {
      step++;
      const progress = step / steps;
      this.statYears.set(Math.floor(targetYears * progress));
      this.statTrips.set(Math.floor(targetTrips * progress));
      this.statClients.set(Math.floor(targetClients * progress));

      if (step >= steps) {
        this.statYears.set(targetYears);
        this.statTrips.set(targetTrips);
        this.statClients.set(targetClients);
        clearInterval(this.counterInterval);
      }
    }, stepTime);
  }

  loadFeaturedServices(): void {
    this.apiService.getServices().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.featuredServices.set(res.data.slice(0, 6));
        }
        this.isLoadingServices.set(false);
      },
      error: () => {
        this.isLoadingServices.set(false);
      }
    });
  }

  submitQuickInquiry(): void {
    if (!this.quickBooking.name || !this.quickBooking.phone) {
      this.notificationService.warning('Please enter your name and phone number for quick booking.');
      return;
    }

    this.isSubmitting.set(true);
    this.apiService.createBooking({
      name: this.quickBooking.name,
      phone: this.quickBooking.phone,
      email: this.quickBooking.email,
      service: this.quickBooking.service,
      date: new Date(this.quickBooking.date),
      message: this.quickBooking.message || 'Quick booking inquiry submitted from homepage.'
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        const msg = this.quickBooking.email 
          ? 'Thank you! Your trip inquiry has been received and a confirmation email has been sent. Our team will call you within 15 minutes.'
          : 'Thank you! Your trip inquiry has been received. Our team will call you within 15 minutes.';
        this.notificationService.success(msg);
        this.quickBooking.name = '';
        this.quickBooking.phone = '';
        this.quickBooking.email = '';
        this.quickBooking.message = '';
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notificationService.error('Failed to submit booking. Please call us directly.');
      }
    });
  }
}
