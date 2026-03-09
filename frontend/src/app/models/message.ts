export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  contenu: string;
  dateEnvoi?: string;
}
