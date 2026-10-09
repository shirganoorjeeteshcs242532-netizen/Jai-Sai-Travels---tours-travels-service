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
  activePhotoIndex = signal<number>(0);
  private slideshowTimer: any = null;

  defaultPhotos: FleetPhoto[] = [
    {
      url: 'http://localhost:5000/uploads/photo-1791458143672-606816611.jpeg',
      title: 'Toyota Innova Crysta - Premium Wedding Convoy',
      category: 'Exterior'
    },
    {
      url: 'http://localhost:5000/uploads/photo-1791534170531-29535222.jpeg',
      title: 'Toyota Innova Crysta - Sleek Front Profile',
      category: 'Fleet Profile'
    },
    {
      url: 'http://localhost:5000/uploads/photo-1791534244480-961044775.jpeg',
      title: 'Toyota Innova Crysta - Hill Station Outstation Tour',
      category: 'Tour Fleet'
    },
    {
      url: 'http://localhost:5000/uploads/photo-1791534367128-460654916.jpeg',
      title: 'Toyota Innova Crysta - Side Luxury Profile',
      category: 'Executive Fleet'
    }
  ];

  timelineEvents = [
    {
      year: '2005',
      title: 'Humble Beginnings',
      description: 'Founded in 2005 with a vision to provide honest, punctual, and comfortable intercity road travel across Maharashtra.'
    },
    {
      year: '2012',
      title: 'Fleet Modernization',
      description: 'Expanded into a specialized Toyota Innova fleet and established 24/7 dedicated Pune-Mumbai airport transfer corridors.'
    },
    {
      year: '2019',
      title: 'Corporate & Wedding Convoy Alliances',
      description: 'Partnered with leading corporate firms and luxury wedding planners for executive transit and VIP guest logistics.'
    },
    {
      year: '2026',
      title: '21+ Years of Road Travel Excellence',
      description: 'Serving over 50,000 happy families, corporate executives, and pilgrims with a state-of-the-art Toyota Innova Crysta fleet and dedicated 24/7 customer support.'
    }
  ];

  teamMembers = signal<TeamMember[]>([
    {
      name: 'Jaykumar Sharma',
      role: 'Founder & Managing Director',
      experience: '21+ Years Experience (Since 2005)',
      bio: 'Visionary founder behind Jai Sai Travels, devoted to setting the highest industry standards for passenger safety, vehicle hygiene, and hospitality.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Sangeeta Jaykumar',
      role: 'Operations & Customer Relations Head',
      experience: '16+ Years Experience',
      bio: 'Directs seamless daily dispatch operations, flight schedule tracking, and ensures 24/7 passenger comfort and customer delight.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Rajendra Verma',
      role: 'Fleet Maintenance & Safety Manager',
      experience: '18+ Years Experience',
      bio: 'Oversees rigorous Toyota mechanical inspections, preventative upkeep, and cabin sanitization protocols.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Sunil Gaikwad',
      role: 'Senior Chauffeur & Route Strategist',
      experience: '15+ Years Experience',
      bio: 'Lead driver instructor specializing in highway safety, defensive driving protocols, and courteous customer hospitality.',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
    }
  ]);

  isLoadingTeam = signal<boolean>(false);

  ngOnInit(): void {
    this.loadTeamMembers();
    this.loadFleetPhotos();
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }

  resolveImageUrl(url?: string): string {
    if (!url) return '';
    if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
      return url.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/, environment.backendBaseUrl);
    }
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/uploads/')) {
      return `${environment.backendBaseUrl}${url}`;
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
        }
        this.startSlideshow();
      },
      error: () => {
        this.startSlideshow();
      }
    });
  }

  getPhotos(): FleetPhoto[] {
    const p = this.fleetPhotos();
    return p && p.length > 0 ? p : this.defaultPhotos;
  }

  getActivePhoto(): FleetPhoto {
    const photos = this.getPhotos();
    const photo = photos[this.activePhotoIndex()] || photos[0] || this.defaultPhotos[0];
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
      title: 'Courteous & Verified Chauffeurs',
      desc: 'All chauffeurs undergo extensive background verifications, safety training, and hospitality etiquette coaching.'
    },
    {
      icon: 'directions_car',
      title: 'Pristine Innova Crysta Fleet',
      desc: 'Our flagship Toyota Innova Crysta cars offer supreme comfort, reclining captain seats, and ice-cold dual climate AC.'
    },
    {
      icon: 'access_time',
      title: 'Strict Punctuality Guarantee',
      desc: 'Never miss a flight or conference. We guarantee on-time arrivals with drivers reaching 15 minutes before pickup.'
    },
    {
      icon: 'receipt_long',
      title: 'Crystal Clear Honest Pricing',
      desc: 'Transparent pricing with zero hidden surge fares, unexpected charges, or cancellation surprises.'
    },
    {
      icon: 'support_agent',
      title: '24/7 Dedicated Operations Desk',
      desc: 'Our operations center is awake 24 hours every day to assist your bookings, route updates, or special inquiries.'
    },
    {
      icon: 'workspace_premium',
      title: '21+ Years of Continuous Trust',
      desc: 'Proudly serving thousands of happy travelers since 2005 with zero compromise on safety and comfort.'
    }
  ];
}
