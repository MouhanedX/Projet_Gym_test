import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Echange } from '../models/echange';

@Injectable({ providedIn: 'root' })
export class EchangeService {
  private http = inject(HttpClient);
  private baseUrl = '/api/echanges';

  list(): Observable<Echange[]> {
    return this.http.get<Echange[]>(this.baseUrl);
  }

  get(id: string): Observable<Echange> {
    return this.http.get<Echange>(`${this.baseUrl}/${id}`);
  }

  getByClient(clientId: string): Observable<Echange[]> {
    return this.http.get<Echange[]>(`${this.baseUrl}/client/${clientId}`);
  }

  create(echange: Echange): Observable<Echange> {
    return this.http.post<Echange>(this.baseUrl, echange);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
