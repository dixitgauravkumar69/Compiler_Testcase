import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { BASE_URL } from '../../../Environments/environment';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

function nameValidator(control: AbstractControl): ValidationErrors | null {
  const val = (control.value || '').trim();
  if (!val) return null;
  return /^[a-zA-Z\s'\-]+$/.test(val) ? null : { invalidName: true };
}

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value || '';
  const errors: ValidationErrors = {};
  if (!/[A-Z]/.test(val))        errors['noUppercase'] = true;
  if (!/[a-z]/.test(val))        errors['noLowercase'] = true;
  if (!/[0-9]/.test(val))        errors['noNumber']    = true;
  if (!/[^A-Za-z0-9]/.test(val)) errors['noSpecial']   = true;
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './user-component.html',
  styleUrls: ['./user-component.css']
})
export class UserComponent {

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  userForm: FormGroup;
  submitted    = false;
  isLoading    = false;
  showPassword = false;

  // OTP panel state
  showOtpPanel  = false;
  otpDigits     = ['', '', '', '', '', ''];
  otpLoading    = false;
  otpError      = '';
  resendCooldown = 0;
  private resendTimer: any;

  // Pending form data (saved after step-1 success)
  private pendingData: any = null;

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
      userName:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator]],
      userEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      userRole:  ['', Validators.required],
      password:  ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64), passwordStrengthValidator]]
    });
  }

  get f() { return this.userForm.controls; }

  // ── Step 1: send OTP ──────────────────────────────────────────────
  registerUser() {
    this.submitted = true;
    if (this.userForm.invalid) {
      this.showToast('Please fix the errors before submitting.', 'warning');
      return;
    }

    this.isLoading = true;
    this.pendingData = { ...this.userForm.value };

    this.http.post(`${BASE_URL}/api/User/addUser`, this.pendingData, { responseType: 'text' }).subscribe({
      next: () => {
        this.isLoading = false;
        this.showOtpPanel = true;
        this.cdr.detectChanges();
        
        this.otpDigits = ['', '', '', '', '', ''];
        this.otpError  = '';
        this.startResendCooldown();
        this.cdr.detectChanges();
        // Focus first OTP box after render
        setTimeout(() => this.otpInputs?.first?.nativeElement?.focus(), 100);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.showToast('An account with this email already exists.', 'error');
        } else {
          this.showToast('Could not send OTP. Please try again.', 'error');
        }
        this.cdr.detectChanges();
      }
    });
  }

  // ── OTP input navigation ──────────────────────────────────────────
  onOtpChange(index: number, value: string) {
    // Keep only last digit typed, strip non-numeric
    const digit = value.replace(/\D/g, '').slice(-1);
    this.otpDigits[index] = digit;
    this.otpError = '';

    if (digit && index < 5) {
      const inputs = this.otpInputs.toArray();
      inputs[index + 1]?.nativeElement.focus();
    }

    if (this.otpDigits.every(d => d !== '')) {
      this.verifyOtp();
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const inputs = this.otpInputs.toArray();
      inputs[index - 1]?.nativeElement.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text   = event.clipboardData?.getData('text') || '';
    const digits = text.replace(/\D/g, '').slice(0, 6).split('');
    // Fill boxes
    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = digits[i] || '';
    }
    // Focus last filled or last box
    const focusIdx = Math.min(digits.length, 5);
    setTimeout(() => {
      this.otpInputs.toArray()[focusIdx]?.nativeElement.focus();
      if (digits.length === 6) this.verifyOtp();
    }, 50);
  }

  get otpValue(): string {
    return this.otpDigits.join('');
  }

  // ── Step 2: verify OTP + register ────────────────────────────────
  verifyOtp() {
    if (this.otpValue.length < 6) {
      this.otpError = 'Please enter all 6 digits.';
      return;
    }

    this.otpLoading = true;
    this.otpError   = '';

    const payload = { ...this.pendingData };

    this.http.post(
      `${BASE_URL}/api/User/verifyOtpAndRegister?otp=${this.otpValue}`,
      payload
    ).subscribe({
      next: () => {
        this.otpLoading   = false;
        this.showOtpPanel = false;
        this.showToast('Account created successfully! Redirecting to login...', 'success');
        this.userForm.reset();
        this.submitted = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/auth']), 2200);
      },
      error: (err) => {
        this.otpLoading = false;
        if (err.status === 400 || err.status === 401) {
          this.otpError = 'Invalid or expired OTP. Please try again.';
        } else {
          this.otpError = 'Verification failed. Please try again.';
        }
        // Shake the boxes
        this.otpDigits = ['', '', '', '', '', ''];
        setTimeout(() => this.otpInputs?.first?.nativeElement?.focus(), 50);
        this.cdr.detectChanges();
      }
    });
  }

  // ── Resend OTP ────────────────────────────────────────────────────
  resendOtp() {
    if (this.resendCooldown > 0) return;
    this.otpError  = '';
    this.otpDigits = ['', '', '', '', '', ''];

    this.http.post(`${BASE_URL}/api/User/addUser`, this.pendingData, { responseType: 'text' }).subscribe({
      next: () => {
        this.showToast('A new OTP has been sent to your email.', 'info');
        this.startResendCooldown();
        setTimeout(() => this.otpInputs?.first?.nativeElement?.focus(), 100);
        this.cdr.detectChanges();
      },
      error: () => {
        this.showToast('Could not resend OTP. Please try again.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  private startResendCooldown(seconds = 300) {
    this.resendCooldown = seconds;
    clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      this.cdr.detectChanges();
      if (this.resendCooldown <= 0) clearInterval(this.resendTimer);
    }, 1000);
  }

  closeOtpPanel() {
    this.showOtpPanel = false;
    this.otpDigits    = ['', '', '', '', '', ''];
    this.otpError     = '';
    clearInterval(this.resendTimer);
  }

  // ── Helpers ───────────────────────────────────────────────────────
  fieldError(field: string): string {
    const ctrl = this.f[field];
    if (!ctrl || !(ctrl.touched || this.submitted) || ctrl.valid) return '';
    if (field === 'userName') {
      if (ctrl.errors?.['required'])    return 'Full name is required.';
      if (ctrl.errors?.['minlength'])   return 'Name must be at least 2 characters.';
      if (ctrl.errors?.['maxlength'])   return 'Name cannot exceed 50 characters.';
      if (ctrl.errors?.['invalidName']) return 'Only letters, spaces, hyphens and apostrophes allowed.';
    }
    if (field === 'userEmail') {
      if (ctrl.errors?.['required'])    return 'Email address is required.';
      if (ctrl.errors?.['email'])       return 'Enter a valid email address.';
      if (ctrl.errors?.['maxlength'])   return 'Email is too long.';
    }
    if (field === 'userRole') {
      if (ctrl.errors?.['required'])    return 'Please select a role.';
    }
    if (field === 'password') {
      if (ctrl.errors?.['required'])    return 'Password is required.';
      if (ctrl.errors?.['minlength'])   return 'Password must be at least 8 characters.';
      if (ctrl.errors?.['maxlength'])   return 'Password cannot exceed 64 characters.';
      if (ctrl.errors?.['noUppercase']) return 'Add at least one uppercase letter (A–Z).';
      if (ctrl.errors?.['noLowercase']) return 'Add at least one lowercase letter (a–z).';
      if (ctrl.errors?.['noNumber'])    return 'Add at least one number (0–9).';
      if (ctrl.errors?.['noSpecial'])   return 'Add at least one special character (!@#$...).';
    }
    return '';
  }

  get passwordStrength(): number {
    const val = this.f['password'].value || '';
    let s = 0;
    if (val.length >= 8)           s++;
    if (/[A-Z]/.test(val))         s++;
    if (/[0-9]/.test(val))         s++;
    if (/[^A-Za-z0-9]/.test(val))  s++;
    return s;
  }

  get passwordStrengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.passwordStrength] || '';
  }

  get passwordStrengthClass(): string {
    return ['', 'weak', 'fair', 'good', 'strong'][this.passwordStrength] || '';
  }

  showToast(msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.toastMessage = msg;
    this.toastType    = type;
    this.cdr.detectChanges();
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3500);
  }

  goToLogin() { this.router.navigate(['/auth']); }
}
