// pages/auth/register/register.component.ts
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
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
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
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './register.html'
  ,
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;

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
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/requests']);
    }

    this.registerForm = this.fb.group({
      name:       ['', [Validators.required, Validators.minLength(2)]],
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')
      ]],
      phone:      ['', [Validators.required, Validators.pattern('^01[3-9]\\d{8}$')]],
      bloodGroup: ['', Validators.required],
      address:    ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.snackBar.open(`Welcome, ${res.data.name}! Account created.`, 'Close', { duration: 3000 });
        this.router.navigate(['/requests']);
      },
      error: (err) => {
        this.isLoading = false;
        const fieldErrors = err.error?.data ? Object.values(err.error.data).join(' ') : '';
        const message = fieldErrors || err.error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 4000 });
      }
    });
  }

  // Getters
  get name()       { return this.registerForm.get('name'); }
  get email()      { return this.registerForm.get('email'); }
  get password()   { return this.registerForm.get('password'); }
  get phone()      { return this.registerForm.get('phone'); }
  get bloodGroup() { return this.registerForm.get('bloodGroup'); }
}