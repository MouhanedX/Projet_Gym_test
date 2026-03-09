import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { tap, timeout, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('gym_user');
      if (stored) {
        try {
          this.currentUserSubject.next(JSON.parse(stored));
        } catch { }
      }
    }
  }

  register(user: User): Observable<User> {
    return this.http.post<User>('/api/auth/register', user).pipe(
      timeout(10000),
      catchError(err => {
        if (err.name === 'TimeoutError') {
          return throwError(() => ({ error: { message: 'Server not responding. Please make sure the backend is running.' } }));
        }
        return throwError(() => err);
      }),
      tap(u => this.setUser(u))
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>('/api/auth/login', { email, password }).pipe(
      timeout(10000),
      catchError(err => {
        if (err.name === 'TimeoutError') {
          return throwError(() => ({ error: { message: 'Server not responding. Please make sure the backend is running.' } }));
        }
        return throwError(() => err);
      }),
      tap(u => this.setUser(u))
    );
  }

  updateProfile(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`/api/auth/user/${id}`, data).pipe(
      tap(u => this.setUser(u))
    );
  }

  getUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getRole(): string | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('gym_user');
    }
    this.currentUserSubject.next(null);
  }

  private setUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('gym_user', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }
}
