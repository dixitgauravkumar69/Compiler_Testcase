import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-login',
  standalone:true,
  imports :[ReactiveFormsModule,CommonModule],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  message = "";
  success = false;
  isLoading!: boolean;

  constructor(private fb: FormBuilder, private http: HttpClient,
    private cdr:ChangeDetectorRef,
    private router:Router
  ) {

    this.loginForm = this.fb.group({
      userEmail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

  }

  loginUser(){

  if(this.loginForm.valid){

    this.isLoading = true;

    this.http.post<any>(`${BASE_URL}/api/User/login`, this.loginForm.value)
    .subscribe({

      next:(res)=>{

        localStorage.setItem("Usermail",res.userEmail);
        localStorage.setItem("UserId",res.userId);
        localStorage.setItem("JWT_TOKEN",res.token);

        // success screen
        this.success = true;
        this.message = "Login Successful";

        setTimeout(()=>{

          if(res.userRole === "TEACHER"){
            this.router.navigate(['/teacher']);
          }
          else{
            this.router.navigate(['/student']);
          }

        },1000);

      },

      error:(err)=>{
        this.isLoading = false;
        this.message = "Invalid Email or Password";
        
      }

    });

  }

}

}