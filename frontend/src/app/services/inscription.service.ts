import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inscription } from '../models/inscription';

@Injectable({ providedIn: 'root' })
export class InscriptionService {
  private http = inject(HttpClient);
  private baseUrl = '/api/inscriptions';

  list(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(this.baseUrl);
  }

  get(id: string): Observable<Inscription> {
    return this.http.get<Inscription>(`${this.baseUrl}/${id}`);
  }

  getByClient(clientId: string): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.baseUrl}/client/${clientId}`);
  }

  getBySalle(salleId: string): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.baseUrl}/salle/${salleId}`);
  }

  getByProprietaire(proprietaireId: string): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.baseUrl}/proprietaire/${proprietaireId}`);
  }

  create(inscription: Inscription): Observable<Inscription> {
    return this.http.post<Inscription>(this.baseUrl, inscription);
  }

  updateStatut(id: string, statut: string): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.baseUrl}/${id}/statut`, { statut });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
