import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = '/api/users';

  getCoaches(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/coaches`);
  }

  getCoachesByGym(gymId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/coaches/gym/${gymId}`);
  }

  getMembers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/members`);
  }

  get(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  update(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user);
  }
}
