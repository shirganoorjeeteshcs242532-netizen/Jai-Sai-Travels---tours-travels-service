import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ThemeOption {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  bgPreview: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  
  readonly themes: ThemeOption[] = [
    {
      id: 'theme-default',
      name: 'Obsidian & Gold',
      mode: 'dark',
      primaryColor: '#1d4ed8',
      accentColor: '#d4af37',
      bgPreview: 'linear-gradient(135deg, #070b14, #1e3a8a)',
      description: ''
    },
    {
      id: 'theme-dark',
      name: 'Titanium & Sapphire',
      mode: 'dark',
      primaryColor: '#0284c7',
      accentColor: '#38bdf8',
      bgPreview: 'linear-gradient(135deg, #050608, #1e293b)',
      description: ''
    },
    {
      id: 'theme-light',
      name: 'Pearl White',
      mode: 'light',
      primaryColor: '#1d4ed8',
      accentColor: '#b45309',
      bgPreview: 'linear-gradient(135deg, #ffffff, #f1f5f9)',
      description: ''
    },
    {
      id: 'theme-green',
      name: 'Racing Emerald',
      mode: 'dark',
      primaryColor: '#047857',
      accentColor: '#d4af37',
      bgPreview: 'linear-gradient(135deg, #03140e, #064e3b)',
      description: ''
    },
    {
      id: 'theme-purple',
      name: 'Imperial Sapphire',
      mode: 'dark',
      primaryColor: '#4338ca',
      accentColor: '#d4af37',
      bgPreview: 'linear-gradient(135deg, #050713, #312e81)',
      description: ''
    },
    {
      id: 'theme-orange',
      name: 'Cognac & Bronze',
      mode: 'dark',
      primaryColor: '#c2410c',
      accentColor: '#d4af37',
      bgPreview: 'linear-gradient(135deg, #0d0603, #431407)',
      description: ''
    }
  ];

  currentTheme = signal<string>('theme-default');
  private lastDarkTheme: string = 'theme-default';

  currentMode = computed<'light' | 'dark'>(() => {
    const theme = this.themes.find(t => t.id === this.currentTheme());
    return theme ? theme.mode : 'dark';
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const savedTheme = localStorage.getItem('jai_sai_theme');
        if (savedTheme && this.themes.some(t => t.id === savedTheme)) {
          this.setTheme(savedTheme);
        } else {
          this.setTheme('theme-default');
        }
      } catch (e) {
        this.setTheme('theme-default');
      }
    }
  }

  setTheme(themeId: string): void {
    const selected = this.themes.find(t => t.id === themeId);
    if (selected) {
      if (selected.mode === 'dark') {
        this.lastDarkTheme = selected.id;
      }
      this.currentTheme.set(themeId);
      if (isPlatformBrowser(this.platformId)) {
        try {
          document.body.classList.remove(
            'theme-default',
            'theme-dark',
            'theme-green',
            'theme-purple',
            'theme-orange',
            'theme-light'
          );
          document.body.classList.add(themeId);
          localStorage.setItem('jai_sai_theme', themeId);
        } catch (e) {}
      }
    }
  }

  setMode(mode: 'light' | 'dark'): void {
    if (mode === 'light') {
      this.setTheme('theme-light');
    } else {
      this.setTheme(this.lastDarkTheme || 'theme-default');
    }
  }

  toggleMode(): void {
    if (this.currentMode() === 'light') {
      this.setMode('dark');
    } else {
      this.setMode('light');
    }
  }

  getCurrentThemeDetails(): ThemeOption {
    return this.themes.find(t => t.id === this.currentTheme()) || this.themes[0];
  }
}
