import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUser, AuthResponse } from '../../shared/models/admin.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private get apiUrl(): string {
    return `${environment.apiUrl}/admin`;
  }

  currentUser = signal<AdminUser | null>(null);
  token = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedToken = localStorage.getItem('jai_sai_token');
      const savedUser = localStorage.getItem('jai_sai_user');
      if (savedToken) {
        this.token.set(savedToken);
        if (savedUser) {
          try {
            this.currentUser.set(JSON.parse(savedUser));
          } catch (e) {
            localStorage.removeItem('jai_sai_user');
          }
        }
      }
    }
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token) {
          this.setSession(res.token, res.admin);
        }
      })
    );
  }

  register(userData: { username: string; email: string; password: string; role?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => {
        if (res.success && res.token) {
          this.setSession(res.token, res.admin);
        }
      })
    );
  }

  getProfile(): Observable<{ success: boolean; admin: AdminUser }> {
    return this.http.get<{ success: boolean; admin: AdminUser }>(`${this.apiUrl}/profile`).pipe(
      tap(res => {
        if (res.success && res.admin) {
          this.currentUser.set(res.admin);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('jai_sai_user', JSON.stringify(res.admin));
          }
        }
      })
    );
  }

  updateProfile(profileData: Partial<AdminUser> & { password?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData).pipe(
      tap((res: any) => {
        if (res.success && res.admin) {
          if (res.token) {
            this.setSession(res.token, res.admin);
          } else {
            this.currentUser.set(res.admin);
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('jai_sai_user', JSON.stringify(res.admin));
            }
          }
        }
      })
    );
  }

  private setSession(token: string, user: AdminUser): void {
    this.token.set(token);
    this.currentUser.set(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('jai_sai_token', token);
      localStorage.setItem('jai_sai_user', JSON.stringify(user));
    }
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jai_sai_token');
      localStorage.removeItem('jai_sai_user');
    }
    this.router.navigate(['/admin/login']);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  getToken(): string | null {
    return this.token();
  }
}
