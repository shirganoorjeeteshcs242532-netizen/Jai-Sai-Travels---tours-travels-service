import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeOption } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-switcher.component.html'
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);
  isOpen = signal<boolean>(false);

  toggleMenu(): void {
    this.isOpen.update(v => !v);
  }

  setMode(mode: 'light' | 'dark'): void {
    this.themeService.setMode(mode);
  }

  selectTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
    this.isOpen.set(false);
  }
}

