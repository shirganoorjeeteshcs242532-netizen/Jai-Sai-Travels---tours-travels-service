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

export const DEFAULT_SERVICES: TravelService[] = [
  {
    _id: 'srv-local',
    title: 'Local City Travel',
    description: 'Flexible 4-hour and 8-hour city packages for shopping, temple visits, meetings, and family sightseeing.',
    icon: 'location_city',
    features: ['8 Hours / 80 KMs Packages', 'Clean Air-Conditioned Fleet', 'Experienced Local Chauffeurs', 'Zero Toll Confusion'],
    priceRange: 'Contact for inquiry',
    isActive: true,
    order: 1
  },
  {
    _id: 'srv-outstation',
    title: 'Outstation Trips',
    description: 'Round-trip and one-way outstation cab services across Maharashtra and all major Indian destinations.',
    icon: 'travel_explore',
    features: ['Per KM Transparent Billing', 'Night Charges Included Options', 'Highway-Trained Drivers', 'Toll & State Tax Assistance'],
    priceRange: 'Contact for inquiry',
    isActive: true,
    order: 2
  },
  {
    _id: 'srv-airport',
    title: 'Airport Pickup & Drop (24/7)',
    description: 'Guaranteed on-time airport transfers with flight tracking and polite meet & greet assistance.',
    icon: 'flight_takeoff',
    features: ['24/7 Availability', 'Flight Delay Monitoring', 'Luggage Handling Assistance', 'Fixed Flat Rates'],
    priceRange: 'Contact for inquiry',
    isActive: true,
    order: 3
  },
  {
    _id: 'srv-corporate',
    title: 'Corporate Travel',
    description: 'Executive car rentals and monthly cab dispatch solutions tailored for business leaders and corporate teams.',
    icon: 'business_center',
    features: ['GST Invoicing Available', 'Clean Innova Crysta Cars', '24/7 Dedicated Support', 'Flexible Monthly Terms'],
    priceRange: 'Contact for inquiry',
    isActive: true,
    order: 4
  },
  {
    _id: 'srv-wedding',
    title: 'Wedding & Event Rentals',
    description: 'Luxury fleet coordination and decorative guest convoys for unforgettable wedding celebrations and VIP guests.',
    icon: 'celebration',
    features: ['Decorated Car Options', 'Fleet Dispatch Manager', 'On-Time Guest Pickup', 'Well-Dressed Chauffeurs'],
    priceRange: 'Contact for inquiry',
    isActive: true,
    order: 5
  },
  {
    _id: 'srv-longterm',
    title: 'Long-Term Car Rental',
    description: 'Affordable weekly and monthly car rentals with dedicated, experienced drivers for families and companies.',
    icon: 'calendar_month',
    features: ['Zero Maintenance Hassle', 'Quick Replacement Vehicle', 'Dedicated Regular Driver', 'Flexible Terms'],
    priceRange: 'Contact for inquiry',
    isActive: true,
    order: 6
  }
];
