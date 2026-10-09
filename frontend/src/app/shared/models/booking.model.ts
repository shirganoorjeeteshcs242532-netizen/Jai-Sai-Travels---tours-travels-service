export interface Booking {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string | Date;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt?: string | Date;
}
