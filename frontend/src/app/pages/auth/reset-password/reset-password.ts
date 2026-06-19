// pages/auth/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {

  resetForm!: FormGroup;
  isLoading = false;
  token: string = '';
  isValidToken = true;
  tokenChecked = false;
  isExpired = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.isValidToken = false;
      this.tokenChecked = true;
      return;
    }
    this.tokenChecked = true;
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;

    this.authService.resetPassword(this.token, this.resetForm.value.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.snackBar.open('Password reset successful! Redirecting to login...', 'Close', { duration: 3000 });
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.error?.message || 'Failed to reset password. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 4000 });
        if (err.error?.message?.includes('expired') || err.error?.message?.includes('Invalid')) {
          this.isValidToken = false;
        }
      }
    });
  }

  get newPassword() { return this.resetForm.get('newPassword'); }
  get confirmPassword() { return this.resetForm.get('confirmPassword'); }
}