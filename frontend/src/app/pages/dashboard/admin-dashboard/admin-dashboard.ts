// pages/dashboard/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from '../../../core/services/user';
import { BloodRequestService } from '../../../core/services/blood-request';
import { DonationService } from '../../../core/services/donation';
import { BloodInventoryService } from '../../../core/services/blood-inventory';
import { AuthService } from '../../../core/services/auth';
import { Role } from '../../../core/models/user.model';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  allUsers: any[] = [];
  allRequests: any[] = [];
  allDonations: any[] = [];
  inventory: any[] = [];
  isLoading = false;
  hasError = false;

  userColumns = ['name', 'email', 'bloodGroup', 'role', 'actions'];
  requestColumns = ['patientName', 'bloodGroup', 'hospital', 'status', 'createdAt', 'actions'];

  private destroy$ = new Subject<void>();

  bloodGroups: Record<string, string> = {
    A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+', O_NEGATIVE: 'O-'
  };

  roles = ['USER', 'DONOR', 'ADMIN'];

  constructor(
    private userService: UserService,
    private bloodRequestService: BloodRequestService,
    private donationService: DonationService,
    private inventoryService: BloodInventoryService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      users: this.userService.getAllUsers().pipe(
        timeout(15000),
        catchError(err => of({ data: [], success: false }))
      ),
      requests: this.bloodRequestService.getAllRequests().pipe(
        timeout(15000),
        catchError(err => of({ data: [], success: false }))
      ),
      donations: this.donationService.getAllDonations().pipe(
        timeout(15000),
        catchError(err => of({ data: [], success: false }))
      ),
      inventory: this.inventoryService.getAllInventory().pipe(
        timeout(15000),
        catchError(err => of({ data: [], success: false }))
      )
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.allUsers = results.users.data || [];
          this.allRequests = results.requests.data || [];
          this.allDonations = results.donations.data || [];
          this.inventory = results.inventory.data || [];
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }

  updateRole(userId: number, newRole: string): void {
    this.userService.updateRole(userId, newRole as Role).subscribe({
      next: () => {
        this.snackBar.open('Role updated!', 'Close', { duration: 3000 });
        this.loadAllData();
      },
      error: (err) => {
      }
    });
  }

  deleteUser(id: number): void {
    if (!confirm('Delete this user permanently?')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.snackBar.open('User deleted', 'Close', { duration: 3000 });
        this.loadAllData();
      },
      error: (err) => {
      }
    });
  }

  deleteRequest(id: number): void {
    if (!confirm('Delete this blood request?')) return;
    this.bloodRequestService.deleteRequest(id).subscribe({
      next: () => {
        this.snackBar.open('Request deleted', 'Close', { duration: 3000 });
        this.loadAllData();
      },
      error: (err) => {
      }
    });
  }

  getBloodLabel(value: string): string {
    return this.bloodGroups[value] || value;
  }

  getTotalDonatedUnits(): number {
    return this.allDonations.reduce((sum, d) => sum + d.unitsDonated, 0);
  }

  getOpenRequestsCount(): number {
    return this.allRequests.filter(r => r.status === 'OPEN').length;
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return '#7b1fa2';
      case 'DONOR': return '#c62828';
      default: return '#1565c0';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN': return 'warning';
      case 'FULFILLED': return 'success';
      case 'CLOSED': return 'info';
      default: return 'info';
    }
  }

  refreshData(): void {
    this.loadAllData();
  }
}