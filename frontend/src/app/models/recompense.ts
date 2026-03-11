export interface Recompense {
  id?: string;
  titre: string;
  description?: string;
  coutEnPoints: number;
  partenaireFournisseur?: string;
  salleIds?: string[];
  imageBase64?: string;
}
