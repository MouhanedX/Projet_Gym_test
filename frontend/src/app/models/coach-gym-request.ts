export interface CoachGymRequest {
  id?: string;
  coachId: string;
  coachName: string;
  gymId: string;
  gymName: string;
  ownerId: string;
  message?: string;
  statut?: string; // EN_ATTENTE, ACCEPTEE, REFUSEE
  createdAt?: string;
}
