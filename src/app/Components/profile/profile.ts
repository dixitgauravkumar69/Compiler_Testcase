import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BASE_URL } from '../../../Environments/environment';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, RouterLinkActive, ThemeSwitcher],
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
    bio: '',
    highSchool:'',
    highSchoolMarks:'',
    higherSecondary:'',
    higherScondarymarks:'',
  };

  email!: string;
  userId!: number;
  profileExists = false;

  editMode = false;   

  toastMessage: string = '';
toastType: string = 'success';
isLoading = true;


isUploading = false;



  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router:Router,
  ) {}

  ngOnInit(): void {

    const storedEmail = localStorage.getItem('Usermail');

    if (storedEmail) {
      this.email = storedEmail;
    }

    this.isLoading = true;

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

      }
    );
  }

  percentageErrorHigher: boolean = false;
percentageErrorHigh: boolean = false;



 onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Preview ke liye hum 'img' field update karenge kyunki HTML usey hi read kar raha hai
      this.profile.img = e.target.result; 
    };
    reader.readAsDataURL(file);

    this.isUploading = true;
    this.showToast("Uploading profile picture... ⏳", "info");

    const formData = new FormData();
    formData.append('file', file);

    this.http.post(`${BASE_URL}/api/student/uploadImg/${this.userId}`, formData)
      .subscribe({
        next: (res: any) => {
          this.isUploading = false;
          //backend sends img url.......
          if (res && res.img) {
            this.profile.img = res.img; 
          }
          this.showToast("Profile picture updated! ✨", "success");
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isUploading = false;
          this.showToast("Upload failed.", "error");
          this.cdr.detectChanges();
        }
      });
  }
}
 loadProfile() {
  this.http
    .get(`${BASE_URL}/api/student/Profile/` + this.userId)
    .subscribe({
      next: (data: any) => {
        if (data) {
          this.profile = data;

          if (data.img) {
          this.profile.profilePic = data.img;
        }

        console.log("Profile Loaded with Image:", this.profile.profilePic);
          this.profileExists = true;
  
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
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
  // Trim all string fields
  const stringFields = ['phone', 'college', 'branch', 'github', 'linkedin', 'bio',
                        'highSchool', 'highSchoolMarks', 'higherSecondary', 'higherSecondaryMarks'];
  stringFields.forEach(f => {
    if (typeof this.profile[f] === 'string') {
      this.profile[f] = this.profile[f].trim();
    }
  });

  if (!this.profile.phone?.trim() || !this.profile.college?.trim() || !this.profile.branch?.trim()) {
    this.showToast("Phone, College and Branch are required to save your profile.", "warning");
    return;
  }

  this.http
    .post(`${BASE_URL}/api/student/addProfile/` + this.userId, this.profile)
    .subscribe({
      next: (res) => {
        this.showToast("Profile updated successfully! 🚀", "success");
        this.profileExists = true;
        this.editMode = false;
        this.loadProfile();
      },
      error: (err) => {
        // this.showToast("Could not save changes. Please try again. 🛠️", "error");
        alert(err.message);
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


back()
{
  this.router.navigate(["/student"]);
}


validatePercentage(field: 'higherSecondaryMarks' | 'highSchoolMarks') {
  if (field === 'higherSecondaryMarks') {
    if (this.profile.higherSecondaryMarks > 100) {
      this.profile.higherSecondaryMarks = null;   //automatically null kr denge and pop up dikha denge 
      this.showToast("Bro you are genious ! Sorry i can add percentage greater than 100..");
      this.percentageErrorHigher = true;
    } else {
      this.percentageErrorHigher = false;
    }
  }

  if (field === 'highSchoolMarks') {
    if (this.profile.highSchoolMarks > 100) {
      this.profile.highSchoolMarks = null; // automatically set to null
      this.showToast("Marks can't be greater than max(100)");
      this.percentageErrorHigh = true;
    } else {
      this.percentageErrorHigh = false;
    }
  }
}

toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
}

isSidebarOpen = false;

closeSidebar() {
  this.isSidebarOpen = false;
}
}