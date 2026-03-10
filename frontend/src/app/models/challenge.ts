export interface ChallengeStep {
  titre: string;
  jour: string;
  exercices: StepExercise[];
  complete: boolean;
}

export interface StepExercise {
  nom: string;
  details: string;
  done: boolean;
}

export interface Challenge {
  id?: string;
  clientId: string;
  clientName?: string;
  titre: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string; // EN_COURS, TERMINE, ABANDONNE
  etapes: ChallengeStep[];
}
