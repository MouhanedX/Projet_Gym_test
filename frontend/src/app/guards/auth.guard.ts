import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const requiredRole = route.data?.['role'];
    if (requiredRole && authService.getRole() !== requiredRole) {
      router.navigate(['/']);
      return false;
    }
    return true;
  }

  router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
  return false;
};
