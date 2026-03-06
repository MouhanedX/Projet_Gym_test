import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private baseUrl = '/api/bookings';

  list(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.baseUrl);
  }

  get(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/${id}`);
  }

  getByMember(memberId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/member/${memberId}`);
  }

  getByGym(gymId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/gym/${gymId}`);
  }

  getByCoach(coachId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/coach/${coachId}`);
  }

  create(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(this.baseUrl, booking);
  }

  updateStatus(id: string, status: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/${id}/status`, { status });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
