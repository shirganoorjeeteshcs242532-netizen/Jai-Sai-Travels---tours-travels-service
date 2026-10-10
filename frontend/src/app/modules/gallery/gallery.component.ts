import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { LightboxModalComponent } from '../../shared/components/lightbox-modal/lightbox-modal.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { GalleryItem } from '../../shared/models/gallery.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent, LightboxModalComponent],
  templateUrl: './gallery.component.html'
})
export class GalleryComponent implements OnInit {
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  company = environment.company;

  breadcrumbItems = [
    { label: 'Photo & Video Gallery' }
  ];

  categories = ['All', 'Fleet', 'Interior', 'Tours', 'Events', 'Airport', 'Videos'];
  selectedCategory = signal<string>('All');
  viewMode = signal<'grid' | 'list'>('grid');

  galleryItems = signal<GalleryItem[]>([]);
  isLoading = signal<boolean>(true);

  // Lightbox state
  isLightboxOpen = signal<boolean>(false);
  lightboxActiveIndex = signal<number>(0);

  ngOnInit(): void {
    try {
      const cached = localStorage.getItem('jst_cached_gallery');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.galleryItems.set(parsed);
        }
      }
    } catch {}

    this.loadGallery();
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

  loadGallery(): void {
    this.isLoading.set(this.galleryItems().length === 0);
    const cat = this.selectedCategory() === 'All' ? undefined : this.selectedCategory();
    const type = this.selectedCategory() === 'Videos' ? 'video' : undefined;

    this.apiService.getGallery(cat, type).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const items = (res.data || []).map(i => ({
            ...i,
            url: this.resolveImageUrl(i.url),
            thumbnail: this.resolveImageUrl(i.thumbnail || i.url)
          }));
          this.galleryItems.set(items);
          if (this.selectedCategory() === 'All' && !type) {
            try {
              localStorage.setItem('jst_cached_gallery', JSON.stringify(items));
            } catch {}
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
    this.loadGallery();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  openLightbox(index: number): void {
    this.lightboxActiveIndex.set(index);
    this.isLightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.isLightboxOpen.set(false);
  }
}
