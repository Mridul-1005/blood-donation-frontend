// core/services/blood-inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BloodInventory, UpdateInventoryRequest } from '../models/blood-inventory.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class BloodInventoryService {

  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  // ── Public: get all inventory ────────────────
  getAllInventory(): Observable<ApiResponse<BloodInventory[]>> {
    return this.http.get<ApiResponse<BloodInventory[]>>(this.apiUrl);
  }

  // ── Public: get inventory by blood group ──────
  getInventoryByBloodGroup(bloodGroup: string): Observable<ApiResponse<BloodInventory>> {
    return this.http.get<ApiResponse<BloodInventory>>(`${this.apiUrl}/${bloodGroup}`);
  }

  // ── Admin: update inventory ───────────────────
  updateInventory(inventory: UpdateInventoryRequest): Observable<ApiResponse<BloodInventory>> {
    return this.http.patch<ApiResponse<BloodInventory>>(`${this.apiUrl}/update`, inventory);
  }
}