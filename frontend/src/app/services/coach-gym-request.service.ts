import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoachGymRequest } from '../models/coach-gym-request';

@Injectable({ providedIn: 'root' })
export class CoachGymRequestService {
  private http = inject(HttpClient);
  private baseUrl = '/api/coach-gym-requests';

  getByCoach(coachId: string): Observable<CoachGymRequest[]> {
    return this.http.get<CoachGymRequest[]>(`${this.baseUrl}/coach/${coachId}`);
  }

  getByGym(gymId: string): Observable<CoachGymRequest[]> {
    return this.http.get<CoachGymRequest[]>(`${this.baseUrl}/gym/${gymId}`);
  }

  getByOwner(ownerId: string): Observable<CoachGymRequest[]> {
    return this.http.get<CoachGymRequest[]>(`${this.baseUrl}/owner/${ownerId}`);
  }

  getPendingByOwner(ownerId: string): Observable<CoachGymRequest[]> {
    return this.http.get<CoachGymRequest[]>(`${this.baseUrl}/owner/${ownerId}/pending`);
  }

  create(request: CoachGymRequest): Observable<CoachGymRequest> {
    return this.http.post<CoachGymRequest>(this.baseUrl, request);
  }

  accept(id: string): Observable<CoachGymRequest> {
    return this.http.put<CoachGymRequest>(`${this.baseUrl}/${id}/accept`, {});
  }

  reject(id: string): Observable<CoachGymRequest> {
    return this.http.put<CoachGymRequest>(`${this.baseUrl}/${id}/reject`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
