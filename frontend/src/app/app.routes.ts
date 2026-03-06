import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing').then(m => m.Landing)
  },
  {
    path: 'auth',
    loadComponent: () => import('./components/auth/auth').then(m => m.Auth)
  },
  {
    path: 'member',
    loadComponent: () => import('./components/member/member-dashboard').then(m => m.MemberDashboard),
    canActivate: [authGuard],
    data: { role: 'MEMBER' }
  },
  {
    path: 'owner',
    loadComponent: () => import('./components/owner/owner-dashboard').then(m => m.OwnerDashboard),
    canActivate: [authGuard],
    data: { role: 'OWNER' }
  },
  {
    path: 'coach',
    loadComponent: () => import('./components/coach/coach-dashboard').then(m => m.CoachDashboard),
    canActivate: [authGuard],
    data: { role: 'COACH' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
