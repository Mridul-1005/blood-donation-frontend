// core/services/blood-request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BloodRequest, CreateBloodRequest, UpdateBloodRequest, RequestStatus } from '../models/blood-request.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class BloodRequestService {

  private apiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  // ── Public: get all requests ──────────────────
  getAllRequests(): Observable<ApiResponse<BloodRequest[]>> {
    return this.http.get<ApiResponse<BloodRequest[]>>(this.apiUrl);
  }

  // ── Public: get open requests ─────────────────
  getOpenRequests(): Observable<ApiResponse<BloodRequest[]>> {
    return this.http.get<ApiResponse<BloodRequest[]>>(`${this.apiUrl}/open`);
  }

  // ── Public: search by blood group ────────────
  searchByBloodGroup(bloodGroup: string): Observable<ApiResponse<BloodRequest[]>> {
    return this.http.get<ApiResponse<BloodRequest[]>>(`${this.apiUrl}/search`, {
      params: { bloodGroup }
    });
  }

  // ── Get request by ID ────────────────────────
  getRequestById(id: number): Observable<ApiResponse<BloodRequest>> {
    return this.http.get<ApiResponse<BloodRequest>>(`${this.apiUrl}/${id}`);
  }

  // ── Logged-in: get my requests ────────────────
  getMyRequests(): Observable<ApiResponse<BloodRequest[]>> {
    return this.http.get<ApiResponse<BloodRequest[]>>(`${this.apiUrl}/my`);
  }

  // ── Logged-in: create request ─────────────────
  createRequest(request: CreateBloodRequest): Observable<ApiResponse<BloodRequest>> {
    return this.http.post<ApiResponse<BloodRequest>>(this.apiUrl, request);
  }

  // ── Owner/Admin: update request ───────────────
  updateRequest(id: number, request: UpdateBloodRequest): Observable<ApiResponse<BloodRequest>> {
    return this.http.put<ApiResponse<BloodRequest>>(`${this.apiUrl}/${id}`, request);
  }

  // ── Owner/Admin: delete request ───────────────
  deleteRequest(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}