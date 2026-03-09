import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GymBuddy } from '../models/gym-buddy';

@Injectable({
  providedIn: 'root'
})
export class GymBuddyService {
  private apiUrl = '/api/gymbuddy';

  constructor(private http: HttpClient) {}

  list(): Observable<GymBuddy[]> {
    return this.http.get<GymBuddy[]>(this.apiUrl);
  }

  getById(id: string): Observable<GymBuddy> {
    return this.http.get<GymBuddy>(`${this.apiUrl}/${id}`);
  }

  getMyPosts(clientId: string): Observable<GymBuddy[]> {
    return this.http.get<GymBuddy[]>(`${this.apiUrl}/my/${clientId}`);
  }

  getOthersPosts(clientId: string): Observable<GymBuddy[]> {
    return this.http.get<GymBuddy[]>(`${this.apiUrl}/others/${clientId}`);
  }

  getByGym(gymId: string): Observable<GymBuddy[]> {
    return this.http.get<GymBuddy[]>(`${this.apiUrl}/gym/${gymId}`);
  }

  create(gymBuddy: GymBuddy): Observable<GymBuddy> {
    return this.http.post<GymBuddy>(this.apiUrl, gymBuddy);
  }

  update(id: string, gymBuddy: GymBuddy): Observable<GymBuddy> {
    return this.http.put<GymBuddy>(`${this.apiUrl}/${id}`, gymBuddy);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addMatch(id: string, matchedPostId: string): Observable<GymBuddy> {
    return this.http.post<GymBuddy>(`${this.apiUrl}/${id}/match/${matchedPostId}`, {});
  }
}
