// pages/dashboard/donor-dashboard/donor-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from '../../../core/services/user';
import { DonationService } from '../../../core/services/donation';
import { BloodRequestService } from '../../../core/services/blood-request';
import { AuthService } from '../../../core/services/auth';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-donor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './donor-dashboard.html',
  styleUrls: ['./donor-dashboard.css']
})
export class DonorDashboardComponent implements OnInit, OnDestroy {
  profile: any = null;
  myDonations: any[] = [];
  myRequests: any[] = [];
  openRequests: any[] = [];
  isLoading = false;
  hasError = false;

  private destroy$ = new Subject<void>();

  bloodGroups: Record<string, string> = {
    A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+', O_NEGATIVE: 'O-'
  };

  constructor(
    private userService: UserService,
    private donationService: DonationService,
    private bloodRequestService: BloodRequestService,
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
      profile: this.userService.getMyProfile().pipe(
        timeout(15000),
        catchError(err => of({ data: null, success: false }))
      ),
      donations: this.donationService.getMyDonations().pipe(
        timeout(15000),
        catchError(err => of({ data: [], success: false }))
      ),
      myRequests: this.bloodRequestService.getMyRequests().pipe(
        timeout(15000),
        catchError(err => of({ data: [], success: false }))
      ),
      openRequests: this.bloodRequestService.getOpenRequests().pipe(
        timeout(15000),
        catchError(err => of({ data: [], success: false }))
      )
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.profile = results.profile.data;
          this.myDonations = results.donations.data || [];
          this.myRequests = results.myRequests.data || [];
          this.openRequests = (results.openRequests.data || []).slice(0, 5);
          this.isLoading = false;
          if (!results.profile.data) {
            this.hasError = true;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }

  getBloodLabel(value: string): string {
    return this.bloodGroups[value] || value;
  }

  canDonateAgain(): boolean {
    if (!this.profile?.lastDonated) return true;
    const last = new Date(this.profile.lastDonated);
    const threeMonthsLater = new Date(last);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    return new Date() >= threeMonthsLater;
  }

  getDaysUntilNextDonation(): number {
    if (!this.profile?.lastDonated) return 0;
    const last = new Date(this.profile.lastDonated);
    const nextDate = new Date(last);
    nextDate.setMonth(nextDate.getMonth() + 3);
    const diff = nextDate.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  refreshData(): void {
    this.loadAllData();
  }
}