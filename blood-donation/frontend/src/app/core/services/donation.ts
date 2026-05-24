// core/services/donation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Donation, CreateDonationRequest } from '../models/donation.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class DonationService {

  private apiUrl = `${environment.apiUrl}/donations`;

  constructor(private http: HttpClient) {}

  // ── Admin: get all donations ──────────────────
  getAllDonations(): Observable<ApiResponse<Donation[]>> {
    return this.http.get<ApiResponse<Donation[]>>(this.apiUrl);
  }

  // ── Donor: get my donations ───────────────────
  getMyDonations(): Observable<ApiResponse<Donation[]>> {
    return this.http.get<ApiResponse<Donation[]>>(`${this.apiUrl}/my`);
  }

  // ── Get donation by ID ────────────────────────
  getDonationById(id: number): Observable<ApiResponse<Donation>> {
    return this.http.get<ApiResponse<Donation>>(`${this.apiUrl}/${id}`);
  }

  // ── Donor: create donation ─────────────────────
  createDonation(donation: CreateDonationRequest): Observable<ApiResponse<Donation>> {
    return this.http.post<ApiResponse<Donation>>(this.apiUrl, donation);
  }

  // ── Admin: delete donation ────────────────────
  deleteDonation(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}