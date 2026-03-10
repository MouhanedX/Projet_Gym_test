export interface Inscription {
  id?: string;
  clientId: string;
  clientName?: string;
  salleId: string;
  salleName?: string;
  proprietaireId?: string;
  dateDemande?: string;
  statut?: string; // EN_ATTENTE, ACCEPTEE, REFUSEE
  paiementStatut?: string; // NON_PAYE, PAYE
}
