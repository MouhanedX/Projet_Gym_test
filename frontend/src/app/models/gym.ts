export interface Gym {
  id?: string;
  name: string;
  description?: string;
  address: string;
  city?: string;
  phone?: string;
  ownerId?: string;
  ownerName?: string;
  image?: string;
  amenities?: string[];
  images?: string[];
  openingHours?: string;
  rating?: number;
  memberCount?: number;
  monthlyPrice?: number;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
}
