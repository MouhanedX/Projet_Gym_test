import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Program } from '../models/program';

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private http = inject(HttpClient);
  private baseUrl = '/api/programs';

  list(): Observable<Program[]> {
    return this.http.get<Program[]>(this.baseUrl);
  }

  get(id: string): Observable<Program> {
    return this.http.get<Program>(`${this.baseUrl}/${id}`);
  }

  getByGym(gymId: string): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.baseUrl}/gym/${gymId}`);
  }

  getByCoach(coachId: string): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.baseUrl}/coach/${coachId}`);
  }

  getByType(type: string): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.baseUrl}/type/${type}`);
  }

  create(program: Program): Observable<Program> {
    return this.http.post<Program>(this.baseUrl, program);
  }

  update(id: string, program: Program): Observable<Program> {
    return this.http.put<Program>(`${this.baseUrl}/${id}`, program);
  }

  enroll(id: string): Observable<Program> {
    return this.http.put<Program>(`${this.baseUrl}/${id}/enroll`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
