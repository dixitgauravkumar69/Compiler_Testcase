import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-user-register',
  standalone:true,
  imports:[ReactiveFormsModule,CommonModule],
  templateUrl: './user-component.html',
  styleUrls: ['./user-component.css']
})
export class UserComponent {

  userForm: FormGroup;
  message = "";

  constructor(private fb: FormBuilder, private http: HttpClient,
    private cdr:ChangeDetectorRef
  ) {

    this.userForm = this.fb.group({

      userName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      userRole: ['', Validators.required],
      password: ['', Validators.required]

    });

  }

  registerUser() {

    if (this.userForm.valid) {

      this.http.post("http://localhost:8080/api/User/addUser", this.userForm.value)
      .subscribe({

        next: (res) => {

          this.cdr.detectChanges();
        alert("User Registered Successfully");
          this.userForm.reset();


        },

        error: (err) => {
          this.message = "Error while registering user";
        }

      });

    }

  }

}