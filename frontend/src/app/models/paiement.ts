export interface Paiement {
  id?: string;
  inscriptionId?: string;
  clientId: string;
  clientName?: string;
  montant: number;
  datePaiement?: string;
  statut?: string; // EN_ATTENTE, CONFIRME, ECHOUE
  methode?: string; // CARTE, ESPECES, VIREMENT
}
