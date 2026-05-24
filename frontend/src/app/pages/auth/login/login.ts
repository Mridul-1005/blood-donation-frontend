// pages/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.html'
  ,
  styleUrls: ['./login.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectByRole();
    }

    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.snackBar.open(`Welcome back, ${res.data.name}!`, 'Close', { duration: 3000 });
        this.redirectByRole();
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.error?.message || 'Login failed. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 4000 });
      }
    });
  }

  private redirectByRole(): void {
    const role = this.authService.getRole();
    if (role === 'ADMIN')  this.router.navigate(['/admin/dashboard']);
    else if (role === 'DONOR') this.router.navigate(['/donor/dashboard']);
    else this.router.navigate(['/requests']);
  }

  // Getters for easy template access
  get email()    { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}