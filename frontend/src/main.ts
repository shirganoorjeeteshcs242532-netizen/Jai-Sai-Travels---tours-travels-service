import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => {
    console.error('Bootstrap error:', err);
    if (typeof document !== 'undefined') {
      const root = document.querySelector('app-root');
      if (root) {
        root.innerHTML = `
          <div style="padding: 2rem; color: #f87171; font-family: sans-serif; background: #0f172a; min-height: 100vh;">
            <h2 style="color: #fbbf24;">Application Initialization Notice</h2>
            <p style="color: #cbd5e1;">An error occurred while loading the application:</p>
            <pre style="white-space: pre-wrap; font-size: 13px; background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); color: #fca5a5;">${err && err.stack ? err.stack : err}</pre>
          </div>
        `;
      }
    }
  });
