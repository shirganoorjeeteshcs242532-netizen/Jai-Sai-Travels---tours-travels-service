function getDynamicApiUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    // When accessed from real phone via IP (e.g., 192.168.1.112):
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.vercel.app') && !hostname.endsWith('.onrender.com')) {
      return `${protocol}//${hostname}:5000/api`;
    }
  }
  return 'http://localhost:5000/api';
}

function getDynamicBackendBase(): string {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.vercel.app') && !hostname.endsWith('.onrender.com')) {
      return `${protocol}//${hostname}:5000`;
    }
  }
  return 'http://localhost:5000';
}

export const environment = {
  production: false,
  get apiUrl(): string {
    return getDynamicApiUrl();
  },
  get backendBaseUrl(): string {
    return getDynamicBackendBase();
  },
  company: {
    name: 'Jai Sai Travels',
    tagline: 'Premier Luxury Car Rental & Tours • Since 2005',
    since: '2005',
    experienceYears: '21+',
    phone: '+91 9224395804',
    phone2: '+917349521107',
    whatsapp: '+91 9224395804',
    whatsapp2: '+917349521107',
    email: 'jaisaitravels@rocketmail.com',
    address: 'Goregaon West Mumbai 400104',
    hours: 'Monday - Sunday: 24 Hours Open (24/7 Dispatch)'
  }
};
