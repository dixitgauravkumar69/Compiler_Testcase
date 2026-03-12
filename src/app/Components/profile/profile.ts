import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  user: any;

  profile: any = {
    phone: '',
    college: '',
    branch: '',
    semester: '',
    cgpa: '',
    skills: '',
    github: '',
    linkedin: '',
    bio: ''
  };

  email!: string;
  userId!: number;
  profileExists = false;

  editMode = false;   // ⭐ NEW

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const storedEmail = localStorage.getItem('Usermail');

    if (storedEmail) {
      this.email = storedEmail;
    }

    // get user
    this.http
      .get(`${BASE_URL}/api/User/profile?email=` + this.email)
      .subscribe((data: any) => {

        this.user = data;
        this.userId = this.user.userid;
     
        console.log("User:", this.user);
        console.log("UserId:", this.userId);
        console.log("username:",this.user.username);

        this.loadProfile();

      });
  }

 loadProfile() {
  this.http
    .get(`${BASE_URL}/api/student/Profile/` + this.userId)
    .subscribe((data: any) => {
      if (data) {
        this.profile = data;
        this.profileExists = true;
      }
      this.cdr.detectChanges();
    }, error => {
      console.log("Profile not found - enabling create mode");
      
      this.profileExists = false;
      this.editMode = true; 

      // ⭐ RESET PROFILE: Taaki inputs khali dikhein na ki 'undefined'
      this.profile = {
        phone: '',
        college: '',
        branch: '',
        semester: '',
        cgpa: '',
        skills: '',
        github: '',
        linkedin: '',
        bio: ''
      };
    });
}
  enableEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
    this.loadProfile();
  }

  saveProfile() {

    this.http
      .post(`${BASE_URL}/api/student/addProfile/` + this.userId, this.profile)
      .subscribe((res) => {

        alert("Profile Saved Successfully");

        this.profileExists = true;
        this.editMode = false;

        this.loadProfile();

      });

  }

}