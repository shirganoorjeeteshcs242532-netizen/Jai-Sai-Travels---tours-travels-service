import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LenisService } from '../../../core/services/lenis.service';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './back-to-top.component.html'
})
export class BackToTopComponent {
  private lenisService = inject(LenisService);
  isVisible = signal<boolean>(false);

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isVisible.set(scrollPosition > 350);
  }

  scrollToTop(): void {
    this.lenisService.scrollTo(0);
  }
}
