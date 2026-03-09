import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avis } from '../models/avis';

@Injectable({ providedIn: 'root' })
export class AvisService {
  private http = inject(HttpClient);
  private baseUrl = '/api/avis';

  list(): Observable<Avis[]> {
    return this.http.get<Avis[]>(this.baseUrl);
  }

  get(id: string): Observable<Avis> {
    return this.http.get<Avis>(`${this.baseUrl}/${id}`);
  }

  getByClient(clientId: string): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.baseUrl}/client/${clientId}`);
  }

  getBySalle(salleId: string): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.baseUrl}/salle/${salleId}`);
  }

  getByCoach(coachId: string): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.baseUrl}/coach/${coachId}`);
  }

  create(avis: Avis): Observable<Avis> {
    return this.http.post<Avis>(this.baseUrl, avis);
  }

  update(id: string, avis: Partial<Avis>): Observable<Avis> {
    return this.http.put<Avis>(`${this.baseUrl}/${id}`, avis);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
