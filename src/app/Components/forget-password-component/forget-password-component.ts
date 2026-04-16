import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BASE_URL } from '../../../Environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password-component',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './forget-password-component.html',
  styleUrl: './forget-password-component.css',
})
export class ForgetPasswordComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router:Router,
  ) {}

  token: string = '';
  password: string = '';
  confirmPassword: string = '';

  success: string = '';
  error: string = '';

  showPassword: boolean = false;
showConfirmPassword: boolean = false;

toastMessage: string = '';
toastType: 'success' | 'error' | 'info' = 'info';


   ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  
  togglePassword() {
  this.showPassword = !this.showPassword;
}

toggleConfirmPassword() {
  this.showConfirmPassword = !this.showConfirmPassword;
}

//  Strong Password Validation
isStrongPassword(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  return regex.test(password);
}



 onSubmit() {

  this.error = '';
  this.success = '';

  if (!this.password || !this.confirmPassword) {
    this.showToast("All fields are required ", "info");
    return;
  }

  if (this.password !== this.confirmPassword) {
    this.showToast("Passwords do not match ", "error");
    return;
  }

  if (!this.isStrongPassword(this.password)) {
    this.showToast("Weak password! Use A-Z, a-z, 0-9 & special char ", "info");
    return;
  }

  if (!this.token) {
    this.showToast("Invalid or expired link ", "error");
    return;
  }

  const payload = {
    token: this.token,
    newPassword: this.password,
  };

  this.http.patch(`${BASE_URL}/api/User/reset-password`, payload, {
    responseType: 'text'
  }).subscribe({

    next: (res: any) => {

      this.showToast("Password reset successfully ", "success");

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
    },

    error: (err) => {

      if (err.status === 400) {
        this.showToast("Invalid or expired token ", "error");
      } 
      else if (err.status === 404) {
        this.showToast("User not found ", "error");
      } 
      else if (err.status === 500) {
        this.showToast("Server error ", "error");
      } 
      else {
        this.showToast(err.error || "Something went wrong", "error");
      }
    }
  });
}


showToast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
  this.toastMessage = msg;
  this.toastType = type;

  setTimeout(() => {
    this.toastMessage = '';
  }, 3000);
}


}
