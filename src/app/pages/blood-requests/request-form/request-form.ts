// pages/blood-requests/request-form/request-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BloodRequestService } from '../../../core/services/blood-request';
import { BloodRequest } from '../../../core/models/blood-request.model';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-request-form',
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
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './request-form.html'
  ,
  styleUrls: ['./request-form.css']
})
export class RequestFormComponent implements OnInit {

  requestForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  requestId: number | null = null;

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

  statusOptions = [
    { value: 'OPEN',      label: 'Open' },
    { value: 'FULFILLED', label: 'Fulfilled' },
    { value: 'CLOSED',    label: 'Closed' },
  ];

  constructor(
    private fb: FormBuilder,
    private bloodRequestService: BloodRequestService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.requestForm = this.fb.group({
      patientName:  ['', [Validators.required, Validators.minLength(2)]],
      bloodGroup:   ['', Validators.required],
      unitsNeeded:  [1,  [Validators.required, Validators.min(1), Validators.max(10)]],
      hospital:     ['', Validators.required],
      contact:      ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      reason:       [''],
      status:       ['OPEN']
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode by looking for an id in the route
    this.requestId = this.route.snapshot.paramMap.get('id')
      ? Number(this.route.snapshot.paramMap.get('id'))
      : null;

    if (this.requestId) {
      this.isEditMode = true;
      this.loadRequest(this.requestId);
    }
  }

  loadRequest(id: number): void {
    this.isLoading = true;
    // Get the request from the list and find by id
    this.bloodRequestService.getAllRequests().subscribe({
      next: (res) => {
        const request = res.data.find((r: BloodRequest) => r.id === id);
        if (request) {
          this.requestForm.patchValue({
            patientName: request.patientName,
            bloodGroup:  request.bloodGroup,
            unitsNeeded: request.unitsNeeded,
            hospital:    request.hospital,
            contact:     request.contact,
            reason:      request.reason || '',
            status:      request.status
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load request', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/requests']);
      }
    });
  }

  onSubmit(): void {
    if (this.requestForm.invalid) return;

    this.isLoading = true;
    const formValue: BloodRequest = this.requestForm.value;

    if (this.isEditMode && this.requestId) {
      // Update existing
      this.bloodRequestService.updateRequest(this.requestId, formValue).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Request updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/requests']);
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.error?.message || 'Update failed', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Create new
      this.bloodRequestService.createRequest(formValue).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Request created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/requests']);
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.error?.message || 'Create failed', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Getters
  get patientName() { return this.requestForm.get('patientName'); }
  get bloodGroup()  { return this.requestForm.get('bloodGroup'); }
  get unitsNeeded() { return this.requestForm.get('unitsNeeded'); }
  get hospital()    { return this.requestForm.get('hospital'); }
  get contact()     { return this.requestForm.get('contact'); }
}