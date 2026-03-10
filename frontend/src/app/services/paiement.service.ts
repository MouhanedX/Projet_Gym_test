import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paiement } from '../models/paiement';

@Injectable({ providedIn: 'root' })
export class PaiementService {
  private http = inject(HttpClient);
  private baseUrl = '/api/paiements';

  list(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(this.baseUrl);
  }

  get(id: string): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.baseUrl}/${id}`);
  }

  getByClient(clientId: string): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.baseUrl}/client/${clientId}`);
  }

  getByInscription(inscriptionId: string): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.baseUrl}/inscription/${inscriptionId}`);
  }

  getBySalle(salleId: string): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.baseUrl}/salle/${salleId}`);
  }

  create(paiement: Paiement): Observable<Paiement> {
    return this.http.post<Paiement>(this.baseUrl, paiement);
  }

  updateStatut(id: string, statut: string): Observable<Paiement> {
    return this.http.put<Paiement>(`${this.baseUrl}/${id}/statut`, { statut });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
