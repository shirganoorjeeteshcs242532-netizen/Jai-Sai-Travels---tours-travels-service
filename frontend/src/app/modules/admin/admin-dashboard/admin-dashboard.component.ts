import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EncodeUriPipe } from '../../../shared/pipes/encode-uri.pipe';
import { Booking } from '../../../shared/models/booking.model';
import { TravelService } from '../../../shared/models/service.model';
import { GalleryItem } from '../../../shared/models/gallery.model';
import { SettingsService } from '../../../core/services/settings.service';
import { TeamMember } from '../../../shared/models/team.model';
import { SiteSettings } from '../../../shared/models/admin.model';
import { DashboardStats } from '../../../shared/models/admin.model';
import { FleetShowcase, FleetPhoto, FleetFeature } from '../../../shared/models/fleet.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);
  settingsService = inject(SettingsService);
  themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  activeTab = signal<'bookings' | 'services' | 'fleet' | 'gallery' | 'team' | 'settings' | 'profile'>('bookings');

  // Team CRUD
  teamMembers = signal<TeamMember[]>([]);
  isTeamModalOpen = signal<boolean>(false);
  isEditingTeamMember = signal<boolean>(false);
  editingTeamMemberId = signal<string | null>(null);
  teamForm: Partial<TeamMember> = {
    name: '',
    role: '',
    experience: '',
    bio: '',
    image: '',
    order: 0,
    isActive: true
  };
  teamImageFile: File | null = null;
  teamImagePreview: string | null = null;

  // Stats
  stats = signal<DashboardStats | null>(null);

  // Bookings
  bookings = signal<Booking[]>([]);
  bookingFilter = signal<string>('all');
  isLoadingBookings = signal<boolean>(false);

  // Services CRUD
  services = signal<TravelService[]>([]);
  isServiceModalOpen = signal<boolean>(false);
  isEditingService = signal<boolean>(false);
  editingServiceId = signal<string | null>(null);
  serviceForm: Partial<TravelService> = {
    title: '',
    description: '',
    icon: 'directions_car',
    features: [],
    priceRange: '',
    isActive: true,
    order: 0
  };
  featuresText = '';

  // Gallery CRUD
  gallery = signal<GalleryItem[]>([]);
  selectedGalleryIds = signal<string[]>([]);
  isGalleryModalOpen = signal<boolean>(false);
  isEditingGallery = signal<boolean>(false);
  editingGalleryId = signal<string | null>(null);
  galleryUploadPreview: string | null = null;
  galleryForm = {
    title: '',
    category: 'Fleet',
    type: 'image' as 'image' | 'video',
    url: '',
    isCover: false
  };
  galleryUploadFile: File | null = null;

  // ==================== FLEET SHOWCASE ====================
  fleet = signal<FleetShowcase | null>(null);
  isLoadingFleet = signal<boolean>(false);
  isSavingFleet = signal<boolean>(false);
  isUploadingFleetPhoto = signal<boolean>(false);

  fleetForm: Partial<FleetShowcase> = {
    title: 'Toyota Innova Crysta',
    tagline: 'Flagship Chauffeur Fleet • Since 2005',
    rating: '4.9/5 Customer Rating',
    description: '',
    photos: [],
    features: []
  };

  newPhoto: FleetPhoto = {
    url: '',
    title: '',
    category: 'Exterior'
  };
  newPhotoPreview: string | null = null;

  newFeature: FleetFeature = {
    title: '',
    description: '',
    icon: 'airline_seat_recline_extra',
    color: 'amber'
  };

  // Settings
  settings: Partial<SiteSettings> = {
    siteTitle: 'Jai Sai Travels - Tours & Travels Car Rental Service',
    tagline: 'Premier Luxury Car Rental & Tours • Since 2005',
    contactPhone: '+91 9224395804',
    contactPhone2: '+917349521107',
    whatsappPhone: '+91 9224395804',
    whatsappPhone2: '+917349521107',
    contactEmail: 'info@jaisaitravels.com',
    address: '1, New Link Rd, Bhagat Singh Nagar 1, Goregaon West, Mumbai, Maharashtra 400104',
    businessHours: 'Monday - Sunday: 24 Hours Open (24/7 Dispatch)',
    theme: 'theme-default',
    googleReviewUrl: 'https://share.google/Al7nlldXLMbIoH9Ih'
  };

  // Profile Form
  profileForm = {
    username: '',
    email: '',
    password: ''
  };

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }
    this.loadStats();
    this.loadBookings();
    this.loadServices();
    this.loadGallery();
    this.loadTeamMembers();
    this.loadSettings();
    this.loadFleet();

    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.username = user.username;
      this.profileForm.email = user.email;
    }
  }

  setTab(tab: 'bookings' | 'services' | 'fleet' | 'gallery' | 'team' | 'settings' | 'profile'): void {
    this.activeTab.set(tab);
  }

  loadStats(): void {
    this.apiService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats.set(res.stats);
        }
      }
    });
  }

  // ==================== BOOKINGS ====================
  loadBookings(): void {
    this.isLoadingBookings.set(true);
    const filter = this.bookingFilter() === 'all' ? undefined : this.bookingFilter();
    this.apiService.getBookings(filter).subscribe({
      next: (res) => {
        if (res.success) {
          this.bookings.set(res.data);
        }
        this.isLoadingBookings.set(false);
      },
      error: () => this.isLoadingBookings.set(false)
    });
  }

  updateBookingStatus(id?: string, status?: 'pending' | 'confirmed' | 'completed'): void {
    if (!id || !status) return;
    this.apiService.updateBookingStatus(id, status).subscribe({
      next: () => {
        this.notificationService.success(`Status updated to ${status}. Email notification sent to customer!`);
        this.loadBookings();
        this.loadStats();
      },
      error: () => this.notificationService.error('Failed to update status.')
    });
  }

  deleteBooking(id?: string): void {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this booking record?')) return;
    this.apiService.deleteBooking(id).subscribe({
      next: () => {
        this.notificationService.success('Booking deleted.');
        this.loadBookings();
        this.loadStats();
      }
    });
  }

  getWhatsAppUrl(b: Booking): string {
    const cleanPhone = (b.phone || '').replace(/[^0-9]/g, '');
    const reviewLink = this.settings.googleReviewUrl || 'https://share.google/Al7nlldXLMbIoH9Ih';
    let text = '';

    const phones = [this.settings.contactPhone, this.settings.contactPhone2].filter(Boolean).join(' / ') || '+91 9224395804';

    if (b.status === 'completed') {
      text = `Namaste ${b.name}! 🙏\n\nThank you for choosing Jai Sai Travels for your trip (${b.service}). We hope you had a pleasant, safe, and comfortable journey with us!\n\nCould you please take 30 seconds to rate us & share your valuable feedback on Google?\n⭐ Review Link: ${reviewLink}\n\nYour review helps us immensely! For future bookings: ${phones}. Thank you!`;
    } else if (b.status === 'confirmed') {
      const travelDateStr = b.date ? new Date(b.date).toLocaleDateString('en-IN') : 'Scheduled Date';
      text = `Hello ${b.name}, your booking with Jai Sai Travels for ${b.service} on ${travelDateStr} is CONFIRMED! Chauffeur and vehicle details will be shared prior to pickup. For questions call: ${phones}.`;
    } else {
      text = `Hello ${b.name}, thank you for your booking inquiry with Jai Sai Travels for ${b.service}. How can we assist you with your travel details?`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  // ==================== SERVICES CRUD ====================
  loadServices(): void {
    this.apiService.getServices(true).subscribe({
      next: (res) => {
        if (res.success) {
          this.services.set(res.data);
        }
      }
    });
  }

  openCreateServiceModal(): void {
    this.isEditingService.set(false);
    this.editingServiceId.set(null);
    this.serviceForm = {
      title: '',
      description: '',
      icon: 'directions_car',
      features: [],
      priceRange: '',
      isActive: true,
      order: 0
    };
    this.featuresText = '';
    this.isServiceModalOpen.set(true);
  }

  openEditServiceModal(service: TravelService): void {
    this.isEditingService.set(true);
    this.editingServiceId.set(service._id || null);
    this.serviceForm = { ...service };
    this.featuresText = service.features?.join(', ') || '';
    this.isServiceModalOpen.set(true);
  }

  closeServiceModal(): void {
    this.isServiceModalOpen.set(false);
  }

  saveService(): void {
    if (!this.serviceForm.title || !this.serviceForm.description) {
      this.notificationService.warning('Title and description are required.');
      return;
    }

    const payload: Partial<TravelService> = {
      ...this.serviceForm,
      features: this.featuresText.split(',').map(f => f.trim()).filter(Boolean)
    };

    if (this.isEditingService() && this.editingServiceId()) {
      this.apiService.updateService(this.editingServiceId()!, payload).subscribe({
        next: () => {
          this.notificationService.success('Service updated successfully.');
          this.closeServiceModal();
          this.loadServices();
          this.loadStats();
        }
      });
    } else {
      this.apiService.createService(payload).subscribe({
        next: () => {
          this.notificationService.success('Service created successfully.');
          this.closeServiceModal();
          this.loadServices();
          this.loadStats();
        }
      });
    }
  }

  deleteService(id?: string): void {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this service?')) return;
    this.apiService.deleteService(id).subscribe({
      next: () => {
        this.notificationService.success('Service removed.');
        this.loadServices();
        this.loadStats();
      }
    });
  }

  // ==================== GALLERY CRUD ====================
  loadGallery(): void {
    this.apiService.getGallery().subscribe({
      next: (res) => {
        if (res.success) {
          this.gallery.set(res.data);
        }
      }
    });
  }

  openCreateGalleryModal(): void {
    this.isEditingGallery.set(false);
    this.editingGalleryId.set(null);
    this.galleryUploadFile = null;
    this.galleryUploadPreview = null;
    this.galleryForm = {
      title: '',
      category: 'Fleet',
      type: 'image',
      url: '',
      isCover: false
    };
    this.isGalleryModalOpen.set(true);
  }

  openEditGalleryModal(item: GalleryItem): void {
    this.isEditingGallery.set(true);
    this.editingGalleryId.set(item._id || null);
    this.galleryUploadFile = null;
    this.galleryUploadPreview = item.thumbnail || item.url || null;
    this.galleryForm = {
      title: item.title || '',
      category: item.category || 'Fleet',
      type: item.type || 'image',
      url: item.url || '',
      isCover: !!item.isCover
    };
    this.isGalleryModalOpen.set(true);
  }

  closeGalleryModal(): void {
    this.isGalleryModalOpen.set(false);
    this.galleryUploadFile = null;
    this.galleryUploadPreview = null;
    this.isEditingGallery.set(false);
    this.editingGalleryId.set(null);
  }

  onGalleryFileSelect(e: any): void {
    const file = e.target.files[0];
    if (file) {
      this.galleryUploadFile = file;
      this.galleryForm.type = file.type.startsWith('video') ? 'video' : 'image';
      if (file.type.startsWith('image')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.galleryUploadPreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.galleryUploadPreview = null;
      }
    }
  }

  onGalleryUrlChange(): void {
    if (this.galleryForm.url) {
      this.galleryUploadFile = null;
      this.galleryUploadPreview = this.galleryForm.url;
    }
  }

  saveGalleryItem(): void {
    if (!this.galleryForm.title) {
      this.notificationService.warning('Title is required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.galleryForm.title);
    formData.append('category', this.galleryForm.category);
    formData.append('type', this.galleryForm.type);
    formData.append('isCover', String(this.galleryForm.isCover));

    if (this.galleryUploadFile) {
      formData.append('mediaFile', this.galleryUploadFile);
    } else if (this.galleryForm.url) {
      formData.append('url', this.galleryForm.url);
      formData.append('thumbnail', this.galleryForm.url);
    } else if (!this.isEditingGallery()) {
      this.notificationService.warning('Select a file or enter a media URL.');
      return;
    }

    if (this.isEditingGallery() && this.editingGalleryId()) {
      this.apiService.updateGalleryItem(this.editingGalleryId()!, formData).subscribe({
        next: () => {
          this.notificationService.success('Gallery media item updated successfully.');
          this.closeGalleryModal();
          this.loadGallery();
          this.loadStats();
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Failed to update gallery media.');
        }
      });
    } else {
      this.apiService.createGalleryItem(formData).subscribe({
        next: () => {
          this.notificationService.success('Gallery media item created.');
          this.closeGalleryModal();
          this.loadGallery();
          this.loadStats();
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Failed to add gallery media.');
        }
      });
    }
  }

  deleteGalleryItem(id?: string): void {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this media?')) return;
    this.apiService.deleteGalleryItem(id).subscribe({
      next: () => {
        this.notificationService.success('Media item deleted.');
        this.loadGallery();
        this.loadStats();
      }
    });
  }

  toggleCoverStatus(item: GalleryItem): void {
    if (!item._id) return;
    const newCoverStatus = !item.isCover;

    this.apiService.updateGalleryItem(item._id, { isCover: newCoverStatus }).subscribe({
      next: () => {
        if (newCoverStatus) {
          this.notificationService.success(`⭐ "${item.title}" set as Featured Cover Photo!`);
        } else {
          this.notificationService.info(`Cover status removed from "${item.title}".`);
        }
        this.loadGallery();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to update cover status.');
      }
    });
  }

  // ==================== TEAM & LEADERSHIP CRUD ====================
  loadTeamMembers(): void {
    this.apiService.getTeamMembers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const mapped = res.data.map((m: any) => ({
            ...m,
            image: this.resolveImageUrl(m.image)
          }));
          this.teamMembers.set(mapped);
        }
      }
    });
  }

  openTeamModal(member?: TeamMember): void {
    this.teamImageFile = null;
    this.teamImagePreview = null;
    if (member) {
      this.isEditingTeamMember.set(true);
      this.editingTeamMemberId.set(member._id || null);
      this.teamForm = {
        name: member.name,
        role: member.role,
        experience: member.experience,
        bio: member.bio || '',
        image: member.image || '',
        order: member.order || 0,
        isActive: member.isActive !== false
      };
      this.teamImagePreview = member.image || null;
    } else {
      this.isEditingTeamMember.set(false);
      this.editingTeamMemberId.set(null);
      this.teamForm = {
        name: '',
        role: '',
        experience: '',
        bio: '',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
        order: this.teamMembers().length + 1,
        isActive: true
      };
    }
    this.isTeamModalOpen.set(true);
  }

  closeTeamModal(): void {
    this.isTeamModalOpen.set(false);
    this.isEditingTeamMember.set(false);
    this.editingTeamMemberId.set(null);
    this.teamImageFile = null;
    this.teamImagePreview = null;
  }

  onTeamFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.teamImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.teamImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveTeamMember(): void {
    if (!this.teamForm.name || !this.teamForm.role || !this.teamForm.experience) {
      this.notificationService.warning('Please provide member Name, Role and Experience.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.teamForm.name);
    formData.append('role', this.teamForm.role);
    formData.append('experience', this.teamForm.experience);
    formData.append('bio', this.teamForm.bio || '');
    formData.append('order', (this.teamForm.order || 0).toString());
    formData.append('isActive', (this.teamForm.isActive !== false).toString());

    if (this.teamImageFile) {
      formData.append('imageFile', this.teamImageFile);
    } else if (this.teamForm.image) {
      formData.append('image', this.teamForm.image);
    }

    if (this.isEditingTeamMember() && this.editingTeamMemberId()) {
      this.apiService.updateTeamMember(this.editingTeamMemberId()!, formData).subscribe({
        next: (res) => {
          this.notificationService.success('Team member profile updated successfully.');
          this.closeTeamModal();
          this.loadTeamMembers();
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Failed to update team member.');
        }
      });
    } else {
      this.apiService.createTeamMember(formData).subscribe({
        next: (res) => {
          this.notificationService.success('New team member added successfully.');
          this.closeTeamModal();
          this.loadTeamMembers();
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Failed to add team member.');
        }
      });
    }
  }

  deleteTeamMember(id?: string): void {
    if (!id) return;
    if (!confirm('Are you sure you want to remove this team member?')) return;
    this.apiService.deleteTeamMember(id).subscribe({
      next: () => {
        this.notificationService.success('Team member profile deleted.');
        this.loadTeamMembers();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to delete team member.');
      }
    });
  }

  // ==================== SETTINGS & PROFILE ====================
  loadSettings(): void {
    this.settings = { ...this.settingsService.settings() };
    this.apiService.getSettings().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.settings = { ...res.data };
        }
      }
    });
  }

  saveSettings(): void {
    this.settingsService.updateSettings(this.settings).subscribe({
      next: (res) => {
        this.notificationService.success('✨ Site settings, contact numbers & theme saved and updated across entire site!');
        if (this.settings.theme) {
          this.themeService.setTheme(this.settings.theme);
        }
      },
      error: () => this.notificationService.error('Failed to save settings. Please try again.')
    });
  }

  updateProfile(): void {
    if (!this.profileForm.username || !this.profileForm.username.trim()) {
      this.notificationService.warning('Please enter an Admin Username.');
      return;
    }
    if (!this.profileForm.email || !this.profileForm.email.trim()) {
      this.notificationService.warning('Please enter an Email address.');
      return;
    }
    if (this.profileForm.password && this.profileForm.password.trim().length > 0 && this.profileForm.password.trim().length < 6) {
      this.notificationService.warning('New password must be at least 6 characters long.');
      return;
    }

    const payload: any = {
      username: this.profileForm.username.trim(),
      email: this.profileForm.email.trim()
    };
    if (this.profileForm.password && this.profileForm.password.trim()) {
      payload.password = this.profileForm.password.trim();
    }

    this.authService.updateProfile(payload).subscribe({
      next: (res: any) => {
        this.notificationService.success(res?.message || 'Admin credentials updated successfully!');
        this.profileForm.password = '';
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Failed to update profile. Please try again.';
        this.notificationService.error(msg);
      }
    });
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

  // ==================== FLEET SHOWCASE METHODS ====================
  loadFleet(): void {
    this.isLoadingFleet.set(true);
    this.apiService.getFleet().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.fleet.set(res.data);
          this.fleetForm = {
            title: res.data.title || 'Toyota Innova Crysta',
            tagline: res.data.tagline || 'Flagship Chauffeur Fleet • Since 2005',
            rating: res.data.rating || '4.9/5 Customer Rating',
            description: res.data.description || '',
            photos: res.data.photos ? res.data.photos.map((p: any) => ({ ...p, url: this.resolveImageUrl(p.url) })) : [],
            features: res.data.features ? [...res.data.features] : []
          };
        }
        this.isLoadingFleet.set(false);
      },
      error: () => this.isLoadingFleet.set(false)
    });
  }

  popularFeatureIcons = [
    { label: '💺 Comfortable Recliners / Seating', value: 'airline_seat_recline_extra' },
    { label: '❄️ Multi-Zone AC / Climate', value: 'ac_unit' },
    { label: '🧳 Massive Luggage Space', value: 'luggage' },
    { label: '🛡️ Airbags & Safe Travel', value: 'security' },
    { label: '🎵 Music & Sound System', value: 'music_note' },
    { label: '🔌 USB & Phone Charging', value: 'power' },
    { label: '🗺️ GPS Route Navigation', value: 'navigation' },
    { label: '✨ Clean & Sanitized Cabin', value: 'cleaning_services' },
    { label: '🌟 VIP & Luxury Experience', value: 'workspace_premium' },
    { label: '⚡ Smooth Engine & Speed', value: 'speed' },
    { label: '📶 Free Onboard Wi-Fi', value: 'wifi' },
    { label: '☕ Drinks & Refreshments', value: 'local_cafe' },
    { label: '💡 Ambient Reading Lights', value: 'lightbulb' },
    { label: '🕶️ Privacy Glass & Curtains', value: 'visibility_off' },
    { label: '📞 24/7 Chauffeur Assistance', value: 'phone_in_talk' }
  ];

  isPredefinedIcon(icon?: string): boolean {
    if (!icon) return true;
    const resolved = this.resolveIcon(icon);
    return this.popularFeatureIcons.some(item => item.value === resolved || item.value === icon);
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

  saveFleet(): void {
    if (this.fleetForm.features) {
      this.fleetForm.features = this.fleetForm.features.map(f => ({
        ...f,
        icon: this.resolveIcon(f.icon)
      }));
    }
    this.isSavingFleet.set(true);
    this.apiService.updateFleet(this.fleetForm).subscribe({
      next: (res) => {
        this.isSavingFleet.set(false);
        this.notificationService.success('✨ Vehicle Fleet showcase updated & published!');
        if (res.success && res.data) {
          this.fleet.set(res.data);
          if (res.data.features) {
            this.fleetForm.features = [...res.data.features];
          }
        }
      },
      error: () => {
        this.isSavingFleet.set(false);
        this.notificationService.error('Failed to update vehicle showcase.');
      }
    });
  }

  onFleetPhotoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    // Instant local preview so admin immediately sees the photo without waiting
    const reader = new FileReader();
    reader.onload = () => {
      this.newPhotoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.isUploadingFleetPhoto.set(true);
    this.apiService.uploadFleetPhoto(file).subscribe({
      next: (res) => {
        this.isUploadingFleetPhoto.set(false);
        const uploadedUrl = res.fullUrl || res.url;
        if (res.success && uploadedUrl) {
          this.notificationService.success('Photo uploaded successfully!');
          this.newPhoto.url = this.resolveImageUrl(uploadedUrl);
        }
      },
      error: () => {
        this.isUploadingFleetPhoto.set(false);
        this.notificationService.error('Failed to upload image. Please try JPG/PNG/WebP.');
      }
    });
  }

  addPhotoToFleet(): void {
    const photoUrl = this.newPhoto.url || this.newPhotoPreview;
    if (!photoUrl) {
      this.notificationService.warning('Please select an image file to upload or enter an image URL.');
      return;
    }
    if (!this.fleetForm.photos) {
      this.fleetForm.photos = [];
    }
    this.fleetForm.photos.push({
      url: this.resolveImageUrl(this.newPhoto.url || photoUrl),
      title: this.newPhoto.title || this.fleetForm.title || 'Innova Crysta',
      category: this.newPhoto.category || 'Exterior'
    });
    this.newPhoto = {
      url: '',
      title: '',
      category: 'Exterior'
    };
    this.newPhotoPreview = null;
    this.notificationService.success('Photo added to showcase! Click "Save & Publish Changes" below.');
  }

  removePhotoFromFleet(index: number): void {
    if (!this.fleetForm.photos) return;
    this.fleetForm.photos.splice(index, 1);
  }

  addFeatureToFleet(): void {
    if (!this.newFeature.title) {
      this.notificationService.warning('Please enter a Feature Title.');
      return;
    }
    if (!this.fleetForm.features) {
      this.fleetForm.features = [];
    }
    this.fleetForm.features.push({
      title: this.newFeature.title,
      description: this.newFeature.description || '',
      icon: this.resolveIcon(this.newFeature.icon) || 'airline_seat_recline_extra',
      color: this.newFeature.color || 'amber'
    });
    this.newFeature = {
      title: '',
      description: '',
      icon: 'airline_seat_recline_extra',
      color: 'amber'
    };
    this.notificationService.success('Feature added! Click "Save & Publish Changes" below.');
  }

  removeFeatureFromFleet(index: number): void {
    if (!this.fleetForm.features) return;
    this.fleetForm.features.splice(index, 1);
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.info('Logged out successfully.');
  }
}
