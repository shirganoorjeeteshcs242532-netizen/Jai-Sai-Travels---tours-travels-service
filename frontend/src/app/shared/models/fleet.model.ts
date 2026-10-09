export interface FleetPhoto {
  _id?: string;
  url: string;
  title: string;
  category: string;
}

export interface FleetFeature {
  _id?: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface FleetShowcase {
  _id?: string;
  title: string;
  tagline: string;
  rating: string;
  description: string;
  photos: FleetPhoto[];
  features: FleetFeature[];
  updatedAt?: string;
}
