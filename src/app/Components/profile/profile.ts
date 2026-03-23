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

  editMode = false;   

  toastMessage: string = '';
toastType: string = 'success';

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
    .subscribe({
      next: (data: any) => {
        if (data) {
          this.profile = data;
          this.profileExists = true;
  
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn("Profile not found");
        this.profileExists = false;
        this.editMode = true; 
        this.showToast("Welcome! Let's set up your professional profile. ✨", "info");
        
        this.profile = { phone: '', college: '', branch: '', semester: '', cgpa: '', skills: '', github: '', linkedin: '', bio: '' };
      }
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
    .subscribe({
      next: (res) => {
        this.showToast("Profile updated successfully! 🚀", "success");
        this.profileExists = true;
        this.editMode = false;
        this.loadProfile();
      },
      error: () => {
        this.showToast("Could not save changes. Please try again. 🛠️", "error");
      }
    });
}


showToast(msg: string, type: string = 'success') {
  this.toastMessage = msg;
  this.toastType = type;
  setTimeout(() => {
    this.toastMessage = '';
    this.cdr.detectChanges();
  }, 3000);
  this.cdr.detectChanges();
}

}