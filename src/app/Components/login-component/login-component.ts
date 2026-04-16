import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,FormsModule],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  message = "";       // Success message ke liye
  errorMessage = "";  // Error message handling ke liye 
  success = false;
  isLoading: boolean = false;
  showPassword = false;

  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  forgotEmail:string='';
  isForgotModalOpen=false;
  frontendUrl:string='';

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



  ngOnInit(): void {
      this.frontendUrl=window.location.origin;
  }
loginUser() {

  // 1. Validation
  if (this.loginForm.invalid) {
    if (this.loginForm.get('userEmail')?.hasError('email')) {
      this.showToast("Enter a valid email address 📧", "info");
    } else {
      this.showToast("All fields are required 🔑", "info");
    }
    return;
  }

  // 2. Loader ON
  this.isLoading = true;

  this.http.post<any>(`${BASE_URL}/api/User/login`, this.loginForm.value)
    .subscribe({

      // ✅ SUCCESS
      next: (res) => {

        // Store data
        localStorage.setItem("Usermail", res.userEmail);
        localStorage.setItem("UserId", res.userId);
        localStorage.setItem("JWT_TOKEN", res.token);

        // Success toast
        this.showToast("Login successful! Redirecting... 🚀", "success");

        // Redirect after delay
        setTimeout(() => {
          this.isLoading = false;

          const route = res.userRole === "ROLE_TEACHER" 
            ? '/teacher' 
            : '/student';

          this.router.navigate([route]);
        }, 1200);
      },

      // ❌ ERROR HANDLING (Important)
      error: (err) => {
        this.isLoading = false;

        if (err.status === 401) {
          this.showToast("Invalid email or password ❌", "error");
        } 
        else if (err.status === 404) {
          this.showToast("User not found 🔍", "error");
        } 
        else if (err.status === 403) {
          this.showToast("Access denied 🚫", "error");
        } 
        else {
          this.showToast("Server error. Please try again later 🌐", "error");
        }
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
    this.router.navigate(['/signUp']);
  }


  forgotPassword()
  {
    this.isForgotModalOpen=true;
  }

  sendResetLink()
  {

  
  
  //  const url=this.frontendUrl;

    if(this.forgotEmail==null)
    {
      alert("Please provide your linked mail..");
    }
   
    this.http.post(`${BASE_URL}/api/User/forget/password/${this.forgotEmail}`,{},{ responseType: 'text'} ).subscribe({
      next:(res)=>
      {
        this.showToast("Check your inbox","success");
        this.closeForgotModal();
      },
      error:(err)=>
      {
        this.showToast(err.message);
        this.closeForgotModal();
      }
    });
  }
  closeForgotModal()
  {
    this.isForgotModalOpen=false;
  }
}