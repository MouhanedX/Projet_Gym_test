export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  durationSeconds?: number;
  notes?: string;
}

export interface WorkoutLog {
  id?: string;
  memberId: string;
  memberName?: string;
  date?: string;
  type?: string;
  exercises?: Exercise[];
  durationMinutes?: number;
  caloriesBurned?: number;
  notes?: string;
  mood?: string;
  createdAt?: string;
}
