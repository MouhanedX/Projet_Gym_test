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
  createdAt?: string;
}
