import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation } from '../models/conversation';
import { Message } from '../models/message';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private http = inject(HttpClient);
  private baseUrl = '/api/conversations';

  list(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(this.baseUrl);
  }

  get(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.baseUrl}/${id}`);
  }

  getByUser(userId: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.baseUrl}/user/${userId}`);
  }

  create(conversation: Conversation): Observable<Conversation> {
    return this.http.post<Conversation>(this.baseUrl, conversation);
  }

  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/${conversationId}/messages`);
  }

  sendMessage(conversationId: string, message: Message): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/${conversationId}/messages`, message);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
