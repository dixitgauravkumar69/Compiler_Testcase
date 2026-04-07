import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { BASE_URL } from '../../../Environments/environment';
import { Router } from '@angular/router';

// Custom validator: only letters, spaces, hyphens, apostrophes
function nameValidator(control: AbstractControl): ValidationErrors | null {
  const val = (control.value || '').trim();
  if (!val) return null; // let required handle empty
  return /^[a-zA-Z\s'\-]+$/.test(val) ? null : { invalidName: true };
}

// Custom validator: password strength
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value || '';
  const errors: ValidationErrors = {};
  if (!/[A-Z]/.test(val))   errors['noUppercase'] = true;
  if (!/[a-z]/.test(val))   errors['noLowercase'] = true;
  if (!/[0-9]/.test(val))   errors['noNumber'] = true;
  if (!/[^A-Za-z0-9]/.test(val)) errors['noSpecial'] = true;
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-component.html',
  styleUrls: ['./user-component.css']
})
export class UserComponent {

  userForm: FormGroup;
  isSuccess = false;
  isLoading = false;
  showPassword = false;
  submitted = false;

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
  private toastTimer: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      userName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        nameValidator
      ]],
      userEmail: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      userRole: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        passwordStrengthValidator
      ]]
    });
  }

  // Convenience getters
  get f() { return this.userForm.controls; }

  // Field-level error helpers
  fieldError(field: string): string {
    const ctrl = this.f[field];
    if (!ctrl || !(ctrl.touched || this.submitted) || ctrl.valid) return '';

    if (field === 'userName') {
      if (ctrl.errors?.['required'])     return 'Full name is required.';
      if (ctrl.errors?.['minlength'])    return 'Name must be at least 2 characters.';
      if (ctrl.errors?.['maxlength'])    return 'Name cannot exceed 50 characters.';
      if (ctrl.errors?.['invalidName'])  return 'Name can only contain letters, spaces, hyphens and apostrophes.';
    }
    if (field === 'userEmail') {
      if (ctrl.errors?.['required'])     return 'Email address is required.';
      if (ctrl.errors?.['email'])        return 'Enter a valid email address.';
      if (ctrl.errors?.['maxlength'])    return 'Email is too long.';
    }
    if (field === 'userRole') {
      if (ctrl.errors?.['required'])     return 'Please select a role.';
    }
    if (field === 'password') {
      if (ctrl.errors?.['required'])     return 'Password is required.';
      if (ctrl.errors?.['minlength'])    return 'Password must be at least 8 characters.';
      if (ctrl.errors?.['maxlength'])    return 'Password cannot exceed 64 characters.';
      if (ctrl.errors?.['noUppercase'])  return 'Add at least one uppercase letter (A–Z).';
      if (ctrl.errors?.['noLowercase'])  return 'Add at least one lowercase letter (a–z).';
      if (ctrl.errors?.['noNumber'])     return 'Add at least one number (0–9).';
      if (ctrl.errors?.['noSpecial'])    return 'Add at least one special character (!@#$...).';
    }
    return '';
  }

  // Password strength score 0–4
  get passwordStrength(): number {
    const val = this.f['password'].value || '';
    let score = 0;
    if (val.length >= 8)            score++;
    if (/[A-Z]/.test(val))          score++;
    if (/[0-9]/.test(val))          score++;
    if (/[^A-Za-z0-9]/.test(val))   score++;
    return score;
  }

  get passwordStrengthLabel(): string {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[this.passwordStrength] || '';
  }

  get passwordStrengthClass(): string {
    const classes = ['', 'weak', 'fair', 'good', 'strong'];
    return classes[this.passwordStrength] || '';
  }

  registerUser() {
    this.submitted = true;
    if (this.userForm.invalid) {
      this.showToast('Please fix the errors before submitting.', 'warning');
      return;
    }

    this.isLoading = true;
    this.http.post(`${BASE_URL}/api/User/addUser`, this.userForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.submitted = false;
        this.userForm.reset();
        this.showToast('Account created successfully! You can now log in.', 'success');
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/auth']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.showToast('An account with this email already exists.', 'error');
        } else {
          this.showToast('Registration failed. Please try again.', 'error');
        }
        this.cdr.detectChanges();
      }
    });
  }

  showToast(msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.toastMessage = msg;
    this.toastType = type;
    this.cdr.detectChanges();
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3500);
  }

  goToLogin() {
    this.router.navigate(['/auth']);
  }
}
