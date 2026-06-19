import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import {roleGuard} from "./core/guards/role-guard";

export const routes: Routes = [

  // ── Default redirect ──────────────────────────
  { path: '', redirectTo: 'requests', pathMatch: 'full' },

  // ── Public routes ─────────────────────────────
  { path: 'login',    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./pages/auth/reset-password/reset-password').then(m => m.ResetPasswordComponent) },
  { path: 'requests', loadComponent: () => import('./pages/blood-requests/request-list/request-list').then(m => m.RequestListComponent) },
  { path: 'requests/my', loadComponent: () => import('./pages/blood-requests/request-list/request-list').then(m => m.RequestListComponent), canActivate: [authGuard] },
  { path: 'inventory', loadComponent: () => import('./pages/inventory/inventory').then(m => m.InventoryComponent) },

  // ── Logged-in user routes ─────────────────────
  { path: 'profile',  loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'requests/new', loadComponent: () => import('./pages/blood-requests/request-form/request-form').then(m => m.RequestFormComponent), canActivate: [authGuard] },
  { path: 'requests/edit/:id', loadComponent: () => import('./pages/blood-requests/request-form/request-form').then(m => m.RequestFormComponent), canActivate: [authGuard] },

  // ── Donor routes ──────────────────────────────
  {
    path: 'donor',
    canActivate: [roleGuard],
    data: { roles: ['DONOR'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/donor-dashboard/donor-dashboard').then(m => m.DonorDashboardComponent) },
      { path: 'donations', loadComponent: () => import('./pages/donations/donation-list/donation-list').then(m => m.DonationListComponent) },
      { path: 'donations/new', loadComponent: () => import('./pages/donations/donation-form/donation-form').then(m => m.DonationFormComponent) },
    ]
  },

  // ── Admin routes ──────────────────────────────
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent) },
      { path: 'donations', loadComponent: () => import('./pages/donations/donation-list/donation-list').then(m => m.DonationListComponent) },
    ]
  },

  // ── Fallback ──────────────────────────────────
  { path: '**', redirectTo: 'requests' }
];