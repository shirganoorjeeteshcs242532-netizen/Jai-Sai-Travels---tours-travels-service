import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeSwitcherComponent],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  authService = inject(AuthService);
  settingsService = inject(SettingsService);
  router = inject(Router);

  isScrolled = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);

  navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Innova Crysta', path: '/vehicles' },
    { label: 'Services', path: '/services' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' }
  ];

  @HostListener('window:scroll', [])
  onScroll(): void {
    const scroll = window.pageYOffset || document.documentElement.scrollTop || 0;
    this.isScrolled.set(scroll > 20);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => {
      const next = !v;
      if (typeof document !== 'undefined') {
        document.body.style.overflow = next ? 'hidden' : '';
      }
      return next;
    });
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  getLinkIcon(path: string): string {
    switch (path) {
      case '/': return 'home';
      case '/about': return 'info';
      case '/vehicles': return 'directions_car';
      case '/services': return 'room_service';
      case '/gallery': return 'photo_library';
      case '/contact': return 'contact_phone';
      default: return 'arrow_forward';
    }
  }
}
