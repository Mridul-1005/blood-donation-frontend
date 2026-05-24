// pages/donations/donation-form/donation-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DonationService } from '../../../core/services/donation';
import { BloodRequestService } from '../../../core/services/blood-request';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-donation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './donation-form.html'
  ,
  styleUrls: ['./donation-form.css']
})
export class DonationFormComponent implements OnInit {

  donationForm: FormGroup;
  isLoading = false;
  openRequests: any[] = [];
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService,
    private bloodRequestService: BloodRequestService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.donationForm = this.fb.group({
      unitsDonated: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      donatedAt:    ['', Validators.required],
      location:     [''],
      notes:        [''],
      bloodRequest: [null]   // optional link to a request
    });
  }

  ngOnInit(): void {
    this.loadOpenRequests();
  }

  loadOpenRequests(): void {
    this.bloodRequestService.getOpenRequests().subscribe({
      next: (res) => { this.openRequests = res.data; },
      error: () => {}
    });
  }

  onSubmit(): void {
    if (this.donationForm.invalid) return;

    this.isLoading = true;

    const formValue = this.donationForm.value;

    // Format date to YYYY-MM-DD string
    const rawDate = formValue.donatedAt;
    const formattedDate = rawDate instanceof Date
      ? rawDate.toISOString().split('T')[0]
      : rawDate;

    const payload: any = {
      unitsDonated: formValue.unitsDonated,
      donatedAt:    formattedDate,
      location:     formValue.location || null,
      notes:        formValue.notes || null,
    };

    // Link to blood request if selected
    if (formValue.bloodRequest) {
      payload.bloodRequest = { id: formValue.bloodRequest };
    }

    this.donationService.createDonation(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Donation logged! Thank you! 🩸', 'Close', { duration: 4000 });
        this.router.navigate(['/donor/donations']);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Failed to log donation', 'Close', { duration: 3000 });
      }
    });
  }

  get unitsDonated() { return this.donationForm.get('unitsDonated'); }
  get donatedAt()    { return this.donationForm.get('donatedAt'); }
}