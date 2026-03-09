import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckIn } from '../models/checkin';

@Injectable({ providedIn: 'root' })
export class CheckInService {
  private http = inject(HttpClient);
  private baseUrl = '/api/checkins';

  list(): Observable<CheckIn[]> {
    return this.http.get<CheckIn[]>(this.baseUrl);
  }

  get(id: string): Observable<CheckIn> {
    return this.http.get<CheckIn>(`${this.baseUrl}/${id}`);
  }

  getByClient(clientId: string): Observable<CheckIn[]> {
    return this.http.get<CheckIn[]>(`${this.baseUrl}/client/${clientId}`);
  }

  getBySalle(salleId: string): Observable<CheckIn[]> {
    return this.http.get<CheckIn[]>(`${this.baseUrl}/salle/${salleId}`);
  }

  create(checkIn: CheckIn): Observable<CheckIn> {
    return this.http.post<CheckIn>(this.baseUrl, checkIn);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
