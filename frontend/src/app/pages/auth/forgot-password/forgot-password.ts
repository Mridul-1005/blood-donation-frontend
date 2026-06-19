// pages/auth/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {

  forgotForm!: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/requests']);
      return;
    }

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.emailSent = true;
        this.snackBar.open(
          'If an account exists with that email, a reset link has been sent.',
          'Close',
          { duration: 5000 }
        );
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.error?.message || 'Something went wrong. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 4000 });
      }
    });
  }

  get email() { return this.forgotForm.get('email'); }
}