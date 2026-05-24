// core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if logged in at all
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Check if user's role is in the allowed roles for this route
  const allowedRoles: string[] = route.data['roles'];
  const userRole = authService.getRole();

  // ADMIN can access everything
  if (userRole === 'ADMIN') return true;

  if (allowedRoles && userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // Not authorized — send to home
  router.navigate(['/requests']);
  return false;
};