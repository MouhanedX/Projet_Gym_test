export interface Program {
  id?: string;
  title: string;
  description?: string;
  gymId?: string;
  gymName?: string;
  coachId?: string;
  coachName?: string;
  type?: string;
  difficulty?: string;
  daysOfWeek?: string[];
  startTime?: string;
  endTime?: string;
  capacity?: number;
  enrolledCount?: number;
  price?: number;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
}
