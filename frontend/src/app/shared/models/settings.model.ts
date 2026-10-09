export interface SiteSettings {
  _id?: string;
  theme: string;
  siteTitle: string;
  tagline?: string;
  contactPhone: string;
  whatsappPhone?: string;
  contactEmail: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
  businessHours: string;
}
