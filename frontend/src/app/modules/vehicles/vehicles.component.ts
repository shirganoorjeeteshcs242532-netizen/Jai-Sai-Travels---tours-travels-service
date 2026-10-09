import { Component, signal, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { NotificationService } from '../../core/services/notification.service';
import { ApiService } from '../../core/services/api.service';
import { SettingsService } from '../../core/services/settings.service';
import { environment } from '../../../environments/environment';
import { FleetShowcase, FleetPhoto, FleetFeature } from '../../shared/models/fleet.model';

export type VehiclePhoto = FleetPhoto;

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbComponent],
  templateUrl: './vehicles.component.html'
})
export class VehiclesComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private apiService = inject(ApiService);
  public settingsService = inject(SettingsService);

  company = environment.company;

  breadcrumbItems = [
    { label: 'Fleet Showcase' }
  ];

  fleet = signal<FleetShowcase | null>(null);
  activePhotoIndex = signal<number>(0);
  isZoomModalOpen = signal<boolean>(false);

  // 3-Second Automatic Slideshow
  private slideshowTimer: any = null;
  isHoveringGallery = signal<boolean>(false);

  // Interactive Zoom & Pan State
  zoomScale = signal<number>(1);
  panX = signal<number>(0);
  panY = signal<number>(0);
  isDragging = signal<boolean>(false);
  dragStartX = 0;
  dragStartY = 0;
  initialPanX = 0;
  initialPanY = 0;

  defaultVehiclePhotos: FleetPhoto[] = [
    {
      url: 'http://localhost:5000/uploads/photo-1791458143672-606816611.jpeg',
      title: 'Toyota Innova Crysta - Sleek Front Luxury Profile',
      category: 'Exterior'
    },
    {
      url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80',
      title: 'Luxury Captain Seats & Executive Armrests',
      category: 'Interior'
    },
    {
      url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80',
      title: 'Ergonomic Cockpit & Smart Infotainment Touchscreen',
      category: 'Dashboard'
    },
    {
      url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80',
      title: 'Massive Boot Space for Luggage & Suitcases',
      category: 'Luggage'
    }
  ];

  defaultFeatures: FleetFeature[] = [
    {
      title: 'Ultra-Plush Captain Recliners',
      description: 'Individual armrests and adjustable recline angles for first-class comfort.',
      icon: 'airline_seat_recline_extra',
      color: 'amber'
    },
    {
      title: 'Multi-Zone Dual Climate Control',
      description: 'Dedicated roof air-conditioning vents for 2nd and 3rd-row passengers.',
      icon: 'ac_unit',
      color: 'blue'
    },
    {
      title: 'Massive Luggage Capacity',
      description: 'Ample boot space with folding rear seats to fit 4 to 5 large suitcases easily.',
      icon: 'luggage',
      color: 'emerald'
    },
    {
      title: 'Advanced Safety & Airbags',
      description: '7 SRS airbags, ABS with EBD, and robust high-tensile crash safety frame.',
      icon: 'security',
      color: 'purple'
    }
  ];

  ngOnInit(): void {
    this.loadFleet();
    this.startSlideshow();
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }

  startSlideshow(): void {
    this.stopSlideshow();
    this.slideshowTimer = setInterval(() => {
      if (!this.isHoveringGallery() && !this.isZoomModalOpen()) {
        const photos = this.getPhotos();
        if (photos && photos.length > 1) {
          this.activePhotoIndex.update(i => (i + 1) % photos.length);
        }
      }
    }, 3000);
  }

  stopSlideshow(): void {
    if (this.slideshowTimer) {
      clearInterval(this.slideshowTimer);
      this.slideshowTimer = null;
    }
  }

  restartSlideshow(): void {
    this.startSlideshow();
  }

  onGalleryMouseEnter(): void {
    this.isHoveringGallery.set(true);
  }

  onGalleryMouseLeave(): void {
    this.isHoveringGallery.set(false);
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

  resolveIcon(icon?: string): string {
    if (!icon) return 'star';
    const clean = icon.trim().toLowerCase();
    const map: Record<string, string> = {
      'armchair': 'airline_seat_recline_extra',
      'chair': 'airline_seat_recline_extra',
      'seat': 'airline_seat_recline_extra',
      'seats': 'airline_seat_recline_extra',
      'sofa': 'airline_seat_recline_extra',
      'couch': 'airline_seat_recline_extra',
      'captain seat': 'airline_seat_recline_extra',
      'captain seats': 'airline_seat_recline_extra',
      'recline': 'airline_seat_recline_extra',
      'recliners': 'airline_seat_recline_extra',
      'snowflake': 'ac_unit',
      'snow': 'ac_unit',
      'ac': 'ac_unit',
      'cooling': 'ac_unit',
      'cooler': 'ac_unit',
      'air conditioning': 'ac_unit',
      'air condition': 'ac_unit',
      'luggage': 'luggage',
      'bag': 'luggage',
      'bags': 'luggage',
      'suitcase': 'luggage',
      'suitcases': 'luggage',
      'boot': 'luggage',
      'trunk': 'luggage',
      'safety': 'security',
      'safe': 'security',
      'airbag': 'security',
      'airbags': 'security',
      'shield': 'security',
      'security': 'security',
      'music': 'music_note',
      'audio': 'headphones',
      'sound': 'volume_up',
      'bluetooth': 'bluetooth',
      'charger': 'power',
      'charging': 'power',
      'power': 'power',
      'usb': 'usb',
      'gps': 'navigation',
      'navigation': 'navigation',
      'wifi': 'wifi',
      'clean': 'cleaning_services',
      'sanitized': 'cleaning_services',
      'luxury': 'workspace_premium',
      'vip': 'workspace_premium',
      'speed': 'speed'
    };
    return map[clean] || clean.replace(/[^a-z0-9_]/g, '') || 'star';
  }

  loadFleet(): void {
    this.apiService.getFleet().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const fleetData = { ...res.data };
          if (fleetData.photos) {
            fleetData.photos = fleetData.photos.map((p: any) => ({
              ...p,
              url: this.resolveImageUrl(p.url)
            }));
          }
          this.fleet.set(fleetData);
        }
      },
      error: () => {
        // Fallback to defaults
      }
    });
  }

  getPhotos(): FleetPhoto[] {
    const f = this.fleet();
    return f && f.photos && f.photos.length > 0 ? f.photos : this.defaultVehiclePhotos;
  }

  getActivePhoto(): FleetPhoto {
    const photos = this.getPhotos();
    return photos[this.activePhotoIndex()] || photos[0] || { url: '', title: '', category: '' };
  }

  getFeatures(): FleetFeature[] {
    const f = this.fleet();
    return f && f.features && f.features.length > 0 ? f.features : this.defaultFeatures;
  }

  // Quick booking state
  bookingForm = {
    name: '',
    phone: '',
    email: '',
    serviceType: 'Outstation Tour',
    passengers: '7 Seater (Captain Seats)',
    date: new Date().toISOString().split('T')[0],
    message: ''
  };
  isSubmitting = signal<boolean>(false);

  selectPhoto(index: number): void {
    this.activePhotoIndex.set(index);
    this.resetZoom();
    this.restartSlideshow();
  }

  openZoom(): void {
    this.resetZoom();
    this.isZoomModalOpen.set(true);
  }

  closeZoom(): void {
    this.isZoomModalOpen.set(false);
    this.resetZoom();
    this.restartSlideshow();
  }

  zoomIn(): void {
    this.zoomScale.update(s => Math.min(4, +(s + 0.35).toFixed(2)));
  }

  zoomOut(): void {
    this.zoomScale.update(s => {
      const next = Math.max(1, +(s - 0.35).toFixed(2));
      if (next <= 1) {
        this.panX.set(0);
        this.panY.set(0);
      }
      return next;
    });
  }

  resetZoom(): void {
    this.zoomScale.set(1);
    this.panX.set(0);
    this.panY.set(0);
    this.isDragging.set(false);
  }

  toggleDoubleZoom(e: MouseEvent): void {
    e.preventDefault();
    if (this.zoomScale() > 1) {
      this.resetZoom();
    } else {
      this.zoomScale.set(2.2);
      this.panX.set(0);
      this.panY.set(0);
    }
  }

  onWheelZoom(e: WheelEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  startDrag(e: MouseEvent): void {
    if (this.zoomScale() <= 1) return;
    e.preventDefault();
    this.isDragging.set(true);
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.initialPanX = this.panX();
    this.initialPanY = this.panY();
  }

  onDrag(e: MouseEvent): void {
    if (!this.isDragging() || this.zoomScale() <= 1) return;
    e.preventDefault();
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    this.panX.set(this.initialPanX + dx);
    this.panY.set(this.initialPanY + dy);
  }

  endDrag(): void {
    this.isDragging.set(false);
  }

  startTouchDrag(e: TouchEvent): void {
    if (this.zoomScale() <= 1 || e.touches.length !== 1) return;
    this.isDragging.set(true);
    this.dragStartX = e.touches[0].clientX;
    this.dragStartY = e.touches[0].clientY;
    this.initialPanX = this.panX();
    this.initialPanY = this.panY();
  }

  onTouchDrag(e: TouchEvent): void {
    if (!this.isDragging() || this.zoomScale() <= 1) return;
    const dx = e.touches[0].clientX - this.dragStartX;
    const dy = e.touches[0].clientY - this.dragStartY;
    this.panX.set(this.initialPanX + dx);
    this.panY.set(this.initialPanY + dy);
  }

  nextPhoto(): void {
    const photos = this.getPhotos();
    if (!photos || photos.length === 0) return;
    this.activePhotoIndex.update(i => (i + 1) % photos.length);
    this.resetZoom();
    this.restartSlideshow();
  }

  prevPhoto(): void {
    const photos = this.getPhotos();
    if (!photos || photos.length === 0) return;
    this.activePhotoIndex.update(i => (i - 1 + photos.length) % photos.length);
    this.resetZoom();
    this.restartSlideshow();
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isZoomModalOpen()) return;
    if (event.key === 'Escape') {
      this.closeZoom();
    } else if (event.key === 'ArrowRight') {
      this.nextPhoto();
    } else if (event.key === 'ArrowLeft') {
      this.prevPhoto();
    } else if (event.key === '+' || event.key === '=') {
      this.zoomIn();
    } else if (event.key === '-' || event.key === '_') {
      this.zoomOut();
    } else if (event.key === '0') {
      this.resetZoom();
    }
  }

  submitBooking(): void {
    if (!this.bookingForm.name || !this.bookingForm.phone) {
      this.notificationService.warning('Please enter your Name and Mobile Number.');
      return;
    }

    this.isSubmitting.set(true);
    this.apiService.createBooking({
      name: this.bookingForm.name,
      phone: this.bookingForm.phone,
      email: this.bookingForm.email ? this.bookingForm.email.trim() : '',
      service: `Toyota Innova Crysta (${this.bookingForm.passengers}) - ${this.bookingForm.serviceType}`,
      date: new Date(this.bookingForm.date),
      message: this.bookingForm.message || 'Innova Crysta rental inquiry submitted.'
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        const msg = this.bookingForm.email 
          ? 'Your Innova Crysta booking inquiry has been recorded and confirmation email sent! Our executive team will contact you shortly.'
          : 'Your Innova Crysta booking inquiry has been recorded! Our executive team will contact you shortly.';
        this.notificationService.success(msg);
        this.bookingForm.name = '';
        this.bookingForm.phone = '';
        this.bookingForm.email = '';
        this.bookingForm.message = '';
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notificationService.error('Failed to submit booking. Please call our 24/7 hotline directly.');
      }
    });
  }
}
