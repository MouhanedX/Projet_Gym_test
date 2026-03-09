export interface GymBuddy {
  id?: string;
  clientId: string;
  clientName?: string;
  clientAvatar?: string;
  title: string;
  description?: string;
  specifications?: string[];
  gymId?: string;
  gymName?: string;
  status?: string; // ACTIVE, MATCHED, CLOSED
  matches?: string[];
  createdAt?: string;
  updatedAt?: string;
}
