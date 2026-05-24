// pages/profile/profile.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from '../../core/services/user';
import { AuthService } from '../../core/services/auth';
import { BloodRequestService } from '../../core/services/blood-request';
import { User } from '../../core/models/user.model';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
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
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTableModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  profileForm: FormGroup;
  user: User | null = null;
  myRequests: any[] = [];
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  hasError = false;

  private destroy$ = new Subject<void>();

  bloodGroups = [
    { value: 'A_POSITIVE', label: 'A+' },
    { value: 'A_NEGATIVE', label: 'A-' },
    { value: 'B_POSITIVE', label: 'B+' },
    { value: 'B_NEGATIVE', label: 'B-' },
    { value: 'AB_POSITIVE', label: 'AB+' },
    { value: 'AB_NEGATIVE', label: 'AB-' },
    { value: 'O_POSITIVE', label: 'O+' },
    { value: 'O_NEGATIVE', label: 'O-' },
  ];

  requestColumns = ['patientName', 'bloodGroup', 'hospital', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private bloodRequestService: BloodRequestService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      address: [''],
      bloodGroup: ['', Validators.required],
      isAvailable: [true]
    });
  }

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
      requests: this.bloodRequestService.getMyRequests().pipe(
        timeout(15000),
        catchError(err => of({ data: [], success: false }))
      )
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.user = results.profile.data;
          this.myRequests = results.requests.data || [];
          if (this.user) {
            this.profileForm.patchValue({
              name: this.user.name,
              phone: this.user.phone,
              address: this.user.address || '',
              bloodGroup: this.user.bloodGroup,
              isAvailable: this.user.isAvailable
            });
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }

  toggleEdit(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode && this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        phone: this.user.phone,
        address: this.user.address || '',
        bloodGroup: this.user.bloodGroup,
        isAvailable: this.user.isAvailable
      });
    }
  }

  onSave(): void {
    if (this.profileForm.invalid || !this.user) return;

    this.isSaving = true;
    this.userService.updateUser(this.user.id, this.profileForm.value).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.isEditMode = false;
        this.user = res.data;
        this.snackBar.open('Profile updated!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.isSaving = false;
      }
    });
  }

  getBloodGroupLabel(value: string): string {
    return this.bloodGroups.find(bg => bg.value === value)?.label || value;
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return '#7b1fa2';
      case 'DONOR': return '#c62828';
      default: return '#1565c0';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'warning';
      case 'FULFILLED': return 'success';
      case 'CLOSED': return 'info';
      case 'PENDING': return 'info';
      default: return 'warning';
    }
  }
}