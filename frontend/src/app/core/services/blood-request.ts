// core/services/blood-request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BloodRequest, CreateBloodRequest, UpdateBloodRequest, RequestStatus } from '../models/blood-request.model';
import { ApiResponse, PageResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class BloodRequestService {

  private apiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  private unwrapPageResponse<T>(response: ApiResponse<PageResponse<T>>): ApiResponse<T[]> {
    return {
      ...response,
      data: response.data?.content ?? []
    };
  }

  // ── Public: get all requests ──────────────────
  getAllRequests(): Observable<ApiResponse<BloodRequest[]>> {
    return this.http.get<ApiResponse<PageResponse<BloodRequest>>>(this.apiUrl).pipe(
      map(response => this.unwrapPageResponse(response))
    );
  }

  // ── Public: get open requests ─────────────────
  getOpenRequests(): Observable<ApiResponse<BloodRequest[]>> {
    return this.http.get<ApiResponse<PageResponse<BloodRequest>>>(`${this.apiUrl}/open`).pipe(
      map(response => this.unwrapPageResponse(response))
    );
  }

  // ── Public: search by blood group ────────────
  searchByBloodGroup(bloodGroup: string): Observable<ApiResponse<BloodRequest[]>> {
    return this.http.get<ApiResponse<PageResponse<BloodRequest>>>(`${this.apiUrl}/search`, {
      params: { bloodGroup }
    }).pipe(
      map(response => this.unwrapPageResponse(response))
    );
  }

  // ── Get request by ID ────────────────────────
  getRequestById(id: number): Observable<ApiResponse<BloodRequest>> {
    return this.http.get<ApiResponse<BloodRequest>>(`${this.apiUrl}/${id}`);
  }

  // ── Logged-in: get my requests ────────────────
  getMyRequests(): Observable<ApiResponse<BloodRequest[]>> {
    return this.http.get<ApiResponse<PageResponse<BloodRequest>>>(`${this.apiUrl}/my`).pipe(
      map(response => this.unwrapPageResponse(response))
    );
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