export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  admin: AdminUser;
}

export interface DashboardStats {
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  services: {
    total: number;
    active: number;
  };
  gallery: {
    total: number;
    images: number;
    videos: number;
  };
  recentBookings?: any[];
}

export interface SiteSettings {
  _id?: string;
  theme?: string;
  siteTitle?: string;
  tagline?: string;
  contactPhone?: string;
  contactPhone2?: string;
  whatsappPhone?: string;
  whatsappPhone2?: string;
  contactEmail?: string;
  address?: string;
  businessHours?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
    whatsapp2?: string;
  };
  googleReviewUrl?: string;
}
