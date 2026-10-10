import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ApiService } from '../../core/services/api.service';
import { TeamMember } from '../../shared/models/team.model';
import { SettingsService } from '../../core/services/settings.service';
import { environment } from '../../../environments/environment';
import { FleetPhoto } from '../../shared/models/fleet.model';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent],
  templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  public settingsService = inject(SettingsService);
  company = environment.company;

  breadcrumbItems = [
    { label: 'About Us' }
  ];

  // Dynamic Real Fleet Slideshow (Innova Crysta)
  fleetPhotos = signal<FleetPhoto[]>([]);
  isLoadingFleet = signal<boolean>(true);
  activePhotoIndex = signal<number>(0);
  private slideshowTimer: any = null;

  timelineEvents = [
    {
      year: '2005',
      title: 'Our Beginning',
      description: 'Started in 2005 with a clear goal: provide safe, on-time, and comfortable travel for families across Maharashtra.'
    },
    {
      year: '2012',
      title: 'Expanding Our Fleet',
      description: 'Added dedicated Toyota Innova cars and started 24/7 on-time Mumbai and Pune airport pickup and drop services.'
    },
    {
      year: '2019',
      title: 'Corporate & Wedding Travel',
      description: 'Started specialized car rental services for corporate business trips, marriage events, and VIP family travel.'
    },
    {
      year: '2026',
      title: '21+ Years of Happy Journeys',
      description: 'Completed over 50,000 successful trips with our well-maintained Toyota Innova Crysta cars and caring 24/7 customer support.'
    }
  ];

  teamMembers = signal<TeamMember[]>([]);
  isLoadingTeam = signal<boolean>(true);

  ngOnInit(): void {
    try {
      const cachedFleet = localStorage.getItem('jst_about_fleet');
      if (cachedFleet) {
        const parsed = JSON.parse(cachedFleet);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.fleetPhotos.set(parsed);
        }
      }
      const cachedTeam = localStorage.getItem('jst_about_team');
      if (cachedTeam) {
        const parsedTeam = JSON.parse(cachedTeam);
        if (Array.isArray(parsedTeam) && parsedTeam.length > 0) {
          this.teamMembers.set(parsedTeam);
        }
      }
    } catch {}

    this.loadTeamMembers();
    this.loadFleetPhotos();
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
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

  loadFleetPhotos(): void {
    this.apiService.getFleet().subscribe({
      next: (res) => {
        if (res && res.success && res.data && res.data.photos && res.data.photos.length > 0) {
          const mapped = res.data.photos.map((p: any) => ({
            ...p,
            url: this.resolveImageUrl(p.url)
          }));
          this.fleetPhotos.set(mapped);
          try {
            localStorage.setItem('jst_about_fleet', JSON.stringify(mapped));
          } catch {}
        }
        this.isLoadingFleet.set(false);
        this.startSlideshow();
      },
      error: () => {
        this.isLoadingFleet.set(false);
        this.startSlideshow();
      }
    });
  }

  getPhotos(): FleetPhoto[] {
    return this.fleetPhotos();
  }

  getActivePhoto(): FleetPhoto {
    const photos = this.getPhotos();
    const photo = photos[this.activePhotoIndex()] || photos[0] || { url: '', title: '', category: '' };
    return {
      ...photo,
      url: this.resolveImageUrl(photo.url)
    };
  }

  startSlideshow(): void {
    this.stopSlideshow();
    this.slideshowTimer = setInterval(() => {
      const photos = this.getPhotos();
      if (photos && photos.length > 1) {
        this.activePhotoIndex.update(i => (i + 1) % photos.length);
      }
    }, 3000);
  }

  stopSlideshow(): void {
    if (this.slideshowTimer) {
      clearInterval(this.slideshowTimer);
      this.slideshowTimer = null;
    }
  }

  loadTeamMembers(): void {
    this.isLoadingTeam.set(true);
    this.apiService.getTeamMembers().subscribe({
      next: (res) => {
        this.isLoadingTeam.set(false);
        if (res && res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((m: any) => ({
            ...m,
            image: this.resolveImageUrl(m.image)
          }));
          this.teamMembers.set(mapped);
          try {
            localStorage.setItem('jst_about_team', JSON.stringify(mapped));
          } catch {}
        }
      },
      error: () => {
        this.isLoadingTeam.set(false);
      }
    });
  }

  whyChoosePoints = [
    {
      icon: 'person_pin',
      title: 'Polite & Verified Drivers',
      desc: 'All our drivers are background-checked, experienced on highways, and trained to be polite and helpful throughout your journey.'
    },
    {
      icon: 'directions_car',
      title: 'Clean Innova Crysta Cars',
      desc: 'Travel in clean, comfortable Toyota Innova Crysta cars with soft pushback seats and powerful chilled AC.'
    },
    {
      icon: 'access_time',
      title: 'Always On Time',
      desc: 'Our driver reaches your doorstep 15 minutes before the scheduled time so you never miss a flight, train, or meeting.'
    },
    {
      icon: 'receipt_long',
      title: 'Clear & Honest Pricing',
      desc: 'Fair, transparent rates with zero hidden charges. What we quote is what you pay.'
    },
    {
      icon: 'support_agent',
      title: '24/7 Helpful Support',
      desc: 'We are available 24 hours every day on call and WhatsApp to assist you with bookings and route queries.'
    },
    {
      icon: 'workspace_premium',
      title: '21+ Years of Trust',
      desc: 'Serving thousands of satisfied families and business travelers since 2005 with a track record of safety and comfort.'
    }
  ];
}
