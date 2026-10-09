export interface TravelService {
  _id?: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  priceRange: string;
  isActive: boolean;
  order: number;
  createdAt?: string | Date;
}
