export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'MEMBER' | 'OWNER' | 'COACH';
  phone?: string;
  bio?: string;
  avatar?: string;
  city?: string;
  specialties?: string[];
  gymId?: string;
  rating?: number;
  experienceYears?: number;
  pointsFidelite?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
}
