import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

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

      this.http.post<any>('http://localhost:8080/api/User/login', this.loginForm.value)
      .subscribe({

        next:(res)=>{

          this.success = true;
          this.cdr.detectChanges();
          alert( "Welcome " + res.userName + " 🎉 Login Successful");
          
        if(res.userRole === "TEACHER"){
          this.router.navigate(['/teacher']);
        }

        else if(res.userRole === "STUDENT"){
          this.router.navigate(['/student']);
        }


        },

        error:(err)=>{

          this.success = false;
            this.cdr.detectChanges();
          alert("Invalid Email or Password");

        }

      });

    }

  }

}