export interface CheckIn {
  id?: string;
  clientId: string;
  clientName?: string;
  salleId: string;
  salleName?: string;
  dateHeure?: string;
  pointsGagnes?: number;
  qrCodeScanne?: string;
}
