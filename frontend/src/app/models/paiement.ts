export interface Paiement {
  id?: string;
  inscriptionId?: string;
  clientId: string;
  clientName?: string;
  montant: number;
  datePaiement?: string;
  statut?: string; // CONFIRME, ECHOUE
  methode?: string; // CARTE, ESPECES, VIREMENT
  cardLast4?: string;
  cardHolder?: string;
  salleId?: string;
  salleName?: string;
}
