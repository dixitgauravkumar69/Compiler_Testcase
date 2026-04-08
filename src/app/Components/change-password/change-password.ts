import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { BASE_URL } from '../../../Environments/environment';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value || '';
  if (!/[A-Z]/.test(val)) return { noUppercase: true };
  if (!/[0-9]/.test(val)) return { noNumber: true };
  return null;
}

function matchPasswords(group: AbstractControl): ValidationErrors | null {
  const np = group.get('newPassword')?.value;
  const cp = group.get('confirmPassword')?.value;
  return np && cp && np !== cp ? { mismatch: true } : null;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, ThemeSwitcher],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
export class ChangePassword {

  form: FormGroup;
  isLoading = false;
  showOld = false;
  showNew = false;
  showConfirm = false;
  isSidebarOpen = false;
  isTeacher = false;

  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
  private toastTimer: any;

  private email = localStorage.getItem('Usermail') || '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      oldPassword:     ['', [Validators.required]],
      newPassword:     ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: matchPasswords });

    this.isTeacher = this.route.snapshot.queryParamMap.get('from') === 'teacher';
  }

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showToast('Please fix the errors below.', 'warning');
      return;
    }

    this.isLoading = true;
    const payload = {
      oldPassword: this.f['oldPassword'].value,
      newPassword: this.f['newPassword'].value
    };

    this.http.patch(
      `${BASE_URL}/api/User/changePassword/${this.email}`,
      payload,
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.showToast('Password changed successfully!', 'success');
        this.form.reset();
        const from = this.route.snapshot.queryParamMap.get('from');
        setTimeout(() => this.router.navigate([from === 'teacher' ? '/teacher' : '/student']), 2000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400) {
          this.showToast('Current password is incorrect.', 'error');
        } else if (err.status === 404) {
          this.showToast('User not found.', 'error');
        } else {
          this.showToast('Something went wrong. Please try again.', 'error');
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

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  closeSidebar()  { this.isSidebarOpen = false; }
  logout()        { localStorage.clear(); this.router.navigate(['/logout']); }
  back() {
    const from = this.route.snapshot.queryParamMap.get('from');
    this.router.navigate([from === 'teacher' ? '/teacher' : '/student']);
  }
}
