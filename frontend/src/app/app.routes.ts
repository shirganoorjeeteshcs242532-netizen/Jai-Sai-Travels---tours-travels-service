import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./modules/home/home.component').then(m => m.HomeComponent),
    title: 'Jai Sai Travels | Tours & Travels Car Rental Service'
  },
  {
    path: 'about',
    loadComponent: () => import('./modules/about/about.component').then(m => m.AboutComponent),
    title: 'About Us | Jai Sai Travels'
  },
  {
    path: 'vehicles',
    loadComponent: () => import('./modules/vehicles/vehicles.component').then(m => m.VehiclesComponent),
    title: 'Toyota Innova Crysta Fleet | Jai Sai Travels'
  },
  {
    path: 'services',
    loadComponent: () => import('./modules/services/services.component').then(m => m.ServicesComponent),
    title: 'Our Travel & Rental Services | Jai Sai Travels'
  },
  {
    path: 'gallery',
    loadComponent: () => import('./modules/gallery/gallery.component').then(m => m.GalleryComponent),
    title: 'Fleet & Tour Gallery | Jai Sai Travels'
  },
  {
    path: 'contact',
    loadComponent: () => import('./modules/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact Us & Book Now | Jai Sai Travels'
  },
  {
    path: 'terms-of-service',
    loadComponent: () => import('./modules/legal/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent),
    title: 'Terms of Service | Jai Sai Travels'
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./modules/legal/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
    title: 'Privacy Policy | Jai Sai Travels'
  },
  {
    path: 'admin',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./modules/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
    title: 'Admin Login | Jai Sai Travels'
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./modules/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard],
    title: 'Admin Dashboard | Jai Sai Travels'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
