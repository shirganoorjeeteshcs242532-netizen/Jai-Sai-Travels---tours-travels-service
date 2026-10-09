import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { BackToTopComponent } from './shared/components/back-to-top/back-to-top.component';
import { LenisService } from './core/services/lenis.service';
import { ThemeService } from './core/services/theme.service';

import { SettingsService } from './core/services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    BackToTopComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private lenisService = inject(LenisService);
  themeService = inject(ThemeService);
  settingsService = inject(SettingsService);

  ngOnInit(): void {
    this.lenisService.init();
  }
}
