// core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface AuthData {
  token: string;
  role: string;
  name: string;
  userId: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthData;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  bloodGroup: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // ── Register ──────────────────────────────────
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  // ── Login ─────────────────────────────────────
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  // ── Save token & user info to localStorage ────
  private saveSession(res: AuthResponse): void {
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('userId', res.data.userId.toString());
    }
  }

  // ── Logout ────────────────────────────────────
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
  }

  // ── Check if logged in ───────────────────────
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ── Get role ─────────────────────────────────
  getRole(): string | null {
    return localStorage.getItem('role');
  }

  // ── Get name ─────────────────────────────────
  getName(): string | null {
    return localStorage.getItem('name');
  }

  // ── Get user ID ──────────────────────────────
  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

  // ── Check if admin ───────────────────────────
  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  // ── Check if donor ───────────────────────────
  isDonor(): boolean {
    return this.getRole() === 'DONOR';
  }
}