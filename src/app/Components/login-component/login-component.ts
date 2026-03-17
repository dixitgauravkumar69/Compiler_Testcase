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
  errorMessage = "";  // Error message handling ke liye 👈
  success = false;
  isLoading: boolean = false;

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
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = ""; // Naye attempt par purana error clear karein
      this.message = "";

      this.http.post<any>(`${BASE_URL}/api/User/login`, this.loginForm.value)
        .subscribe({
          next: (res) => {
            // Token aur User details store karna
            localStorage.setItem("Usermail", res.userEmail);
            localStorage.setItem("UserId", res.userId);
            localStorage.setItem("JWT_TOKEN", res.token);

            this.success = true;
            this.message = "Login Successful! Redirecting...";
            
            // UI refresh ke liye
            this.cdr.detectChanges();

            setTimeout(() => {
              this.isLoading = false;
              if (res.userRole === "TEACHER") {
                this.router.navigate(['/teacher']);
              } else {
                this.router.navigate(['/student']);
              }
            }, 1500);
          },
          error: (err) => {
            this.isLoading = false;
            this.success = false;
            
            // Backend error handle karna
            if (err.status === 401 || err.status === 403) {
              this.errorMessage = "Invalid Email or Password. Please try again.";
            } else {
              this.errorMessage = "Server error or Connection failed. Try later.";
            }
            this.cdr.detectChanges();
          }
        });
    } else {
      this.errorMessage = "Please fill all fields correctly.";
    }
  }

  // Signup page par jaane ke liye logic
  goToSignup() {
    this.router.navigate(['/']);
  }
}