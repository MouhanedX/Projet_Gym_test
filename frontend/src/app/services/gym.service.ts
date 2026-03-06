import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gym } from '../models/gym';

@Injectable({ providedIn: 'root' })
export class GymService {
  private http = inject(HttpClient);
  private baseUrl = '/api/gyms';

  list(): Observable<Gym[]> {
    return this.http.get<Gym[]>(this.baseUrl);
  }

  listActive(): Observable<Gym[]> {
    return this.http.get<Gym[]>(`${this.baseUrl}/active`);
  }

  get(id: string): Observable<Gym> {
    return this.http.get<Gym>(`${this.baseUrl}/${id}`);
  }

  getByOwner(ownerId: string): Observable<Gym[]> {
    return this.http.get<Gym[]>(`${this.baseUrl}/owner/${ownerId}`);
  }

  search(q: string): Observable<Gym[]> {
    return this.http.get<Gym[]>(`${this.baseUrl}/search?q=${encodeURIComponent(q)}`);
  }

  create(gym: Gym): Observable<Gym> {
    return this.http.post<Gym>(this.baseUrl, gym);
  }

  update(id: string, gym: Gym): Observable<Gym> {
    return this.http.put<Gym>(`${this.baseUrl}/${id}`, gym);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
