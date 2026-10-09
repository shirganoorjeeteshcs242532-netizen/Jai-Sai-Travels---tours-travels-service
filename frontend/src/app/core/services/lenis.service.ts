import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LenisService {
  private platformId = inject(PLATFORM_ID);
  private lenis: any = null;

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') return;

    try {
      const lenisModule = await import('lenis');
      const LenisClass = (lenisModule as any).default || lenisModule;
      if (typeof LenisClass === 'function') {
        this.lenis = new LenisClass({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
          infinite: false
        });

        const raf = (time: number) => {
          this.lenis?.raf(time);
          requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);
      }
    } catch (e) {
      // Gracefully fall back to browser native smooth scroll
    }
  }

  scrollTo(target: string | HTMLElement | number, options?: any): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.lenis) {
      try {
        this.lenis.scrollTo(target, options);
        return;
      } catch (e) {}
    }

    if (typeof target === 'string' && target.startsWith('#')) {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  }

  destroy(): void {
    try {
      this.lenis?.destroy();
    } catch (e) {}
    this.lenis = null;
  }
}
