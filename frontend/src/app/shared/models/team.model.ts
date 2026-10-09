export interface TeamMember {
  _id?: string;
  name: string;
  role: string;
  experience: string;
  bio?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
