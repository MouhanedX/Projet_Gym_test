import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkoutLog } from '../models/workout';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private http = inject(HttpClient);
  private baseUrl = '/api/workouts';

  list(): Observable<WorkoutLog[]> {
    return this.http.get<WorkoutLog[]>(this.baseUrl);
  }

  get(id: string): Observable<WorkoutLog> {
    return this.http.get<WorkoutLog>(`${this.baseUrl}/${id}`);
  }

  getByMember(memberId: string): Observable<WorkoutLog[]> {
    return this.http.get<WorkoutLog[]>(`${this.baseUrl}/member/${memberId}`);
  }

  create(log: WorkoutLog): Observable<WorkoutLog> {
    return this.http.post<WorkoutLog>(this.baseUrl, log);
  }

  update(id: string, log: WorkoutLog): Observable<WorkoutLog> {
    return this.http.put<WorkoutLog>(`${this.baseUrl}/${id}`, log);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
