import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recompense } from '../models/recompense';

@Injectable({ providedIn: 'root' })
export class RecompenseService {
  private http = inject(HttpClient);
  private baseUrl = '/api/recompenses';

  list(): Observable<Recompense[]> {
    return this.http.get<Recompense[]>(this.baseUrl);
  }

  get(id: string): Observable<Recompense> {
    return this.http.get<Recompense>(`${this.baseUrl}/${id}`);
  }

  getBySalle(salleId: string): Observable<Recompense[]> {
    return this.http.get<Recompense[]>(`${this.baseUrl}/salle/${salleId}`);
  }

  create(recompense: Recompense): Observable<Recompense> {
    return this.http.post<Recompense>(this.baseUrl, recompense);
  }

  update(id: string, recompense: Partial<Recompense>): Observable<Recompense> {
    return this.http.put<Recompense>(`${this.baseUrl}/${id}`, recompense);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
