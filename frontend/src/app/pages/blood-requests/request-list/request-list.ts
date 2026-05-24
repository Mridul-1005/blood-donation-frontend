// pages/blood-requests/request-list/request-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BloodRequestService } from '../../../core/services/blood-request';
import { AuthService } from '../../../core/services/auth';
import { BloodRequest } from '../../../core/models/blood-request.model';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './request-list.html'
  ,
  styleUrls: ['./request-list.css']
})
export class RequestListComponent implements OnInit {

  requests: BloodRequest[] = [];
  isLoading = false;
  selectedBloodGroup = '';

  bloodGroups = [
    { value: 'A_POSITIVE',  label: 'A+' },
    { value: 'A_NEGATIVE',  label: 'A-' },
    { value: 'B_POSITIVE',  label: 'B+' },
    { value: 'B_NEGATIVE',  label: 'B-' },
    { value: 'AB_POSITIVE', label: 'AB+' },
    { value: 'AB_NEGATIVE', label: 'AB-' },
    { value: 'O_POSITIVE',  label: 'O+' },
    { value: 'O_NEGATIVE',  label: 'O-' },
  ];

  constructor(
    private bloodRequestService: BloodRequestService,
    public authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOpenRequests();
  }

  loadOpenRequests(): void {
    this.isLoading = true;
    this.bloodRequestService.getOpenRequests().subscribe({
      next: (res) => {
        this.requests = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load requests', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.isLoading = true;
    if (!this.selectedBloodGroup) {
      this.loadOpenRequests();
      return;
    }
    this.bloodRequestService.searchByBloodGroup(this.selectedBloodGroup).subscribe({
      next: (res) => {
        this.requests = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to filter requests', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  clearFilter(): void {
    this.selectedBloodGroup = '';
    this.loadOpenRequests();
  }

  deleteRequest(id: number): void {
    if (!confirm('Are you sure you want to delete this request?')) return;

    this.bloodRequestService.deleteRequest(id).subscribe({
      next: () => {
        this.snackBar.open('Request deleted', 'Close', { duration: 3000 });
        this.loadOpenRequests();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Delete failed', 'Close', { duration: 3000 });
      }
    });
  }

  canModify(request: BloodRequest): boolean {
    const userId = this.authService.getUserId();
    const isAdmin = this.authService.isAdmin();
    const createdBy = request.createdBy;
    const isOwner = typeof createdBy === 'object' && createdBy?.id === userId;
    return isAdmin || isOwner;
  }

  getBloodGroupLabel(value: string): string {
    return this.bloodGroups.find(bg => bg.value === value)?.label || value;
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'OPEN':      return 'warn';
      case 'FULFILLED': return 'primary';
      case 'CLOSED':    return 'accent';
      default:          return '';
    }
  }
}