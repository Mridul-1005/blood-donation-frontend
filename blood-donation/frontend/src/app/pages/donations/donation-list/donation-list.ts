// pages/donations/donation-list/donation-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DonationService } from '../../../core/services/donation';
import { AuthService } from '../../../core/services/auth';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-donation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './donation-list.html'
  ,
  styleUrls: ['./donation-list.css']
})
export class DonationListComponent implements OnInit {

  donations: any[] = [];
  isLoading = false;

  // Admin sees more columns
  donorColumns    = ['donatedAt', 'units', 'location', 'notes'];
  adminColumns    = ['donor', 'bloodGroup', 'donatedAt', 'units', 'location', 'actions'];

  constructor(
    private donationService: DonationService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDonations();
  }

  get displayedColumns(): string[] {
    return this.authService.isAdmin() ? this.adminColumns : this.donorColumns;
  }

  loadDonations(): void {
    this.isLoading = true;
    const obs = this.authService.isAdmin()
      ? this.donationService.getAllDonations()
      : this.donationService.getMyDonations();

    obs.subscribe({
      next: (res) => {
        this.donations = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load donations', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  deleteDonation(id: number): void {
    if (!confirm('Delete this donation record?')) return;
    this.donationService.deleteDonation(id).subscribe({
      next: () => {
        this.snackBar.open('Donation deleted', 'Close', { duration: 3000 });
        this.loadDonations();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Delete failed', 'Close', { duration: 3000 });
      }
    });
  }

  getTotalUnits(): number {
    return this.donations.reduce((sum, d) => sum + d.unitsDonated, 0);
  }
}