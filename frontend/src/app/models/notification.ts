export interface Notification {
  id?: string;
  userId: string;
  type?: string;
  contenu?: string;
  dateEnvoi?: string;
  lu?: boolean;
}
