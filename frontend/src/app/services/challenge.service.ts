import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Challenge } from '../models/challenge';

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private http = inject(HttpClient);
  private baseUrl = '/api/challenges';

  list(): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(this.baseUrl);
  }

  get(id: string): Observable<Challenge> {
    return this.http.get<Challenge>(`${this.baseUrl}/${id}`);
  }

  getByClient(clientId: string): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(`${this.baseUrl}/client/${clientId}`);
  }

  create(challenge: Challenge): Observable<Challenge> {
    return this.http.post<Challenge>(this.baseUrl, challenge);
  }

  update(id: string, challenge: Challenge): Observable<Challenge> {
    return this.http.put<Challenge>(`${this.baseUrl}/${id}`, challenge);
  }

  updateStatut(id: string, statut: string): Observable<Challenge> {
    return this.http.put<Challenge>(`${this.baseUrl}/${id}/statut`, { statut });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
