import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GalleryItem } from '../../shared/models/gallery.model';
import { TravelService } from '../../shared/models/service.model';
import { Booking } from '../../shared/models/booking.model';
import { SiteSettings } from '../../shared/models/admin.model';
import { DashboardStats } from '../../shared/models/admin.model';
import { TeamMember } from '../../shared/models/team.model';
import { FleetShowcase } from '../../shared/models/fleet.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private get apiUrl(): string {
    return environment.apiUrl;
  }

  // ==================== GALLERY APIS ====================
  getGallery(category?: string, type?: string): Observable<{ success: boolean; count: number; data: GalleryItem[] }> {
    let params = new HttpParams();
    if (category && category !== 'All') {
      params = params.set('category', category);
    }
    if (type && type !== 'All') {
      params = params.set('type', type);
    }
    return this.http.get<{ success: boolean; count: number; data: GalleryItem[] }>(`${this.apiUrl}/gallery`, { params });
  }

  getGalleryItem(id: string): Observable<{ success: boolean; data: GalleryItem }> {
    return this.http.get<{ success: boolean; data: GalleryItem }>(`${this.apiUrl}/gallery/${id}`);
  }

  createGalleryItem(formData: FormData): Observable<{ success: boolean; message: string; data: GalleryItem }> {
    return this.http.post<{ success: boolean; message: string; data: GalleryItem }>(`${this.apiUrl}/gallery`, formData);
  }

  updateGalleryItem(id: string, formData: FormData | Partial<GalleryItem>): Observable<{ success: boolean; message: string; data: GalleryItem }> {
    return this.http.put<{ success: boolean; message: string; data: GalleryItem }>(`${this.apiUrl}/gallery/${id}`, formData);
  }

  deleteGalleryItem(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/gallery/${id}`);
  }

  bulkDeleteGallery(ids: string[]): Observable<{ success: boolean; message: string; deletedCount: number }> {
    return this.http.post<{ success: boolean; message: string; deletedCount: number }>(`${this.apiUrl}/gallery/bulk-delete`, { ids });
  }

  // ==================== SERVICES APIS ====================
  getServices(includeInactive = false): Observable<{ success: boolean; count: number; data: TravelService[] }> {
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('all', 'true');
    }
    return this.http.get<{ success: boolean; count: number; data: TravelService[] }>(`${this.apiUrl}/services`, { params });
  }

  getService(id: string): Observable<{ success: boolean; data: TravelService }> {
    return this.http.get<{ success: boolean; data: TravelService }>(`${this.apiUrl}/services/${id}`);
  }

  createService(serviceData: Partial<TravelService>): Observable<{ success: boolean; message: string; data: TravelService }> {
    return this.http.post<{ success: boolean; message: string; data: TravelService }>(`${this.apiUrl}/services`, serviceData);
  }

  updateService(id: string, serviceData: Partial<TravelService>): Observable<{ success: boolean; message: string; data: TravelService }> {
    return this.http.put<{ success: boolean; message: string; data: TravelService }>(`${this.apiUrl}/services/${id}`, serviceData);
  }

  deleteService(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/services/${id}`);
  }

  // ==================== BOOKINGS APIS ====================
  createBooking(bookingData: Partial<Booking>): Observable<{ success: boolean; message: string; data: Booking }> {
    return this.http.post<{ success: boolean; message: string; data: Booking }>(`${this.apiUrl}/bookings`, bookingData);
  }

  getBookings(status?: string): Observable<{ success: boolean; count: number; data: Booking[] }> {
    let params = new HttpParams();
    if (status && status !== 'all') {
      params = params.set('status', status);
    }
    return this.http.get<{ success: boolean; count: number; data: Booking[] }>(`${this.apiUrl}/bookings`, { params });
  }

  updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'completed'): Observable<{ success: boolean; message: string; data: Booking }> {
    return this.http.put<{ success: boolean; message: string; data: Booking }>(`${this.apiUrl}/bookings/${id}`, { status });
  }

  deleteBooking(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/bookings/${id}`);
  }

  // ==================== SETTINGS APIS ====================
  getSettings(): Observable<{ success: boolean; data: SiteSettings }> {
    return this.http.get<{ success: boolean; data: SiteSettings }>(`${this.apiUrl}/settings`);
  }

  updateSettings(settings: Partial<SiteSettings>): Observable<{ success: boolean; message: string; data: SiteSettings }> {
    return this.http.put<{ success: boolean; message: string; data: SiteSettings }>(`${this.apiUrl}/settings`, settings);
  }

  // ==================== ADMIN STATS ====================
  getDashboardStats(): Observable<{ success: boolean; stats: DashboardStats }> {
    return this.http.get<{ success: boolean; stats: DashboardStats }>(`${this.apiUrl}/admin/stats`);
  }

  // ==================== TEAM / LEADERSHIP APIS ====================
  getTeamMembers(): Observable<{ success: boolean; count: number; data: TeamMember[] }> {
    return this.http.get<{ success: boolean; count: number; data: TeamMember[] }>(`${this.apiUrl}/team`);
  }

  getTeamMember(id: string): Observable<{ success: boolean; data: TeamMember }> {
    return this.http.get<{ success: boolean; data: TeamMember }>(`${this.apiUrl}/team/${id}`);
  }

  createTeamMember(formData: FormData | Partial<TeamMember>): Observable<{ success: boolean; message: string; data: TeamMember }> {
    return this.http.post<{ success: boolean; message: string; data: TeamMember }>(`${this.apiUrl}/team`, formData);
  }

  updateTeamMember(id: string, formData: FormData | Partial<TeamMember>): Observable<{ success: boolean; message: string; data: TeamMember }> {
    return this.http.put<{ success: boolean; message: string; data: TeamMember }>(`${this.apiUrl}/team/${id}`, formData);
  }

  deleteTeamMember(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/team/${id}`);
  }

  // ==================== FLEET SHOWCASE APIS ====================
  getFleet(): Observable<{ success: boolean; data: FleetShowcase }> {
    return this.http.get<{ success: boolean; data: FleetShowcase }>(`${this.apiUrl}/fleet`);
  }

  updateFleet(fleet: Partial<FleetShowcase>): Observable<{ success: boolean; message: string; data: FleetShowcase }> {
    return this.http.put<{ success: boolean; message: string; data: FleetShowcase }>(`${this.apiUrl}/fleet`, fleet);
  }

  uploadFleetPhoto(file: File): Observable<{ success: boolean; message: string; url: string; fullUrl?: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<{ success: boolean; message: string; url: string; fullUrl?: string }>(`${this.apiUrl}/fleet/upload`, formData);
  }
}

