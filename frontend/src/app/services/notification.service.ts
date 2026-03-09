import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = '/api/notifications';

  getByUser(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${userId}`);
  }

  getUnread(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${userId}/unread`);
  }

  create(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(this.baseUrl, notification);
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.put<Notification>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(userId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/user/${userId}/read-all`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
