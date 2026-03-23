import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  message = "";       // Success message ke liye
  errorMessage = "";  // Error message handling ke liye 
  success = false;
  isLoading: boolean = false;

  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userEmail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

 loginUser() {
    //  Validation Check for Toast
    if (this.loginForm.invalid) {
      if (this.loginForm.get('userEmail')?.hasError('email')) {
        this.showToast("Please enter a valid email address! 📧", "info");
      } else {
        this.showToast("All fields are required! 🔑", "info");
      }
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.http.post<any>(`${BASE_URL}/api/User/login`, this.loginForm.value)
      .subscribe({
        next: (res) => {
          // Store Credentials
          localStorage.setItem("Usermail", res.userEmail);
          localStorage.setItem("UserId", res.userId);
          localStorage.setItem("JWT_TOKEN", res.token);

          this.showToast("Login Successful! Redirecting... 🚀", "success");
          
          this.cdr.detectChanges();

          setTimeout(() => {
            this.isLoading = false;
            const route = res.userRole === "TEACHER" ? '/teacher' : '/student';
            this.router.navigate([route]);
          }, 1500);
        },
        error: (err) => {
          this.isLoading = false;
          
          //  Professional Error Handling with Toasts
          if (err.status === 401 || err.status === 403) {
            this.showToast("Invalid Credentials. Try again! ❌", "error");
          } else {
            this.showToast("Server unreachable. Try later! 🌐", "error");
          }
          this.cdr.detectChanges();
        }
      });
  }

  //  Shared Toast Logic
  showToast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage = msg;
    this.toastType = type;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  goToSignup() {
    this.router.navigate(['/']);
  }
}