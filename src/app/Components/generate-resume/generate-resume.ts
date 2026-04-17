import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { BASE_URL } from '../../../Environments/environment';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';
import { ResumeService } from '../../Services/ResumeService/resume-service';

@Component({
  selector: 'app-resume-generate',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, ThemeSwitcher],
  templateUrl: './generate-resume.html',
  styleUrl: './generate-resume.css'
})
export class GenerateResume {

  profile: any = {
    name: '',
    email: '',
    phone: '',
    college: '',
    branch: '',
    cgpa: '',
    skills: '',
    github: '',
    linkedin: '',
    highSchool:'',
    highSchoolMarks:'',
    higherSecondary:'',
    higherScondarymarks:'',
  };

  extra: any = {
    projects: '',
    internships: '',
    summary: '',
    achievements:'',
    bio:'',
  
  };

  email!: string;
  userId!: number;
  resumes:any[]=[];

 isProcessing = false;
toastMessage = '';
toastType = 'success';

  constructor(private http: HttpClient,
    private cdr:ChangeDetectorRef,
    private router:Router,
    private resume:ResumeService,
  ) {}

  ngOnInit() {

    const storedEmail = localStorage.getItem('Usermail');

    if (storedEmail) {
      this.email = storedEmail;
      this.profile.email = storedEmail;
    }

    //  user fetch from user table via email --------------------
    
      this.resume.fetchUser(this.email).subscribe((data: any) => {

        this.userId = data.userid;

        // agar name milta hai to fill kar do
        this.profile.username = data.username || '';


        console.log("Username: ");
        console.log(this.profile.username);

        //  student profile fetch
        this.loadProfile();

        this.cdr.detectChanges();

      });

  }

  //for filling available data in profile section---------------
  loadProfile() {

    this.resume.loadProfile(this.userId)
      .subscribe((data: any) => {

        if (data) {
          
          this.profile.phone = data.phone || '';
          this.profile.college = data.college || '';
          this.profile.branch = data.branch || '';
          this.profile.cgpa = data.cgpa || '';
          this.profile.skills = data.skills || '';
          this.profile.github = data.github || '';
          this.profile.linkedin = data.linkedin || '';
          this.profile.highSchool=data.highSchool || '';
          this.profile.highSchoolMarks=data.highSchoolMarks || '';
          this.profile.higherSecondary=data.higherSecondary || '';
          this.profile.higherSecondaryMarks=data.higherSecondaryMarks || '';
          
        
          
        }
        this.cdr.detectChanges();
        

      }, error => {

        console.log("Profile not found");

      });

  }



  //for adding resume information in Database--------------------------------
 addResume() {
  if (!this.profile.username || !this.profile.skills) {
    this.showToast("Please fill in your name and core skills to continue. ✍️", "warning");
    return;
  }

  
  this.isProcessing = true; 
  this.showToast("System is analyzing your profile... 🧠", "info");

  const resumeData = { ...this.profile, ...this.extra };

  this.resume.addResume(this.userId,resumeData)
    .subscribe({
      next: (res) => {
 
        setTimeout(() => {
          this.showToast("Resume drafted successfully! You can getResume... ✨", "success");
       
          this.resetExtraFields();
         
  
         
          this.isProcessing = false;
          this.cdr.detectChanges();
        }, 1500);

      
      },
      error: () => {
        this.showToast("Failed to save resume data. Please try again.", "error");
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
}
getResume() {
  this.http.get(`${BASE_URL}/api/student/getResume/` + this.userId)
    .subscribe({
      next: (res: any) => {
      

      
      
        setTimeout(() => {

          if(res.length<=0)
         {
           this.showToast("There is no any stored resume prersent","info");
         }
         else
         {
           this.showToast("Resumes loaded successfully.. ✨", "success");
         }
          this.isProcessing = false;
          this.cdr.detectChanges();
        }, 1500);
        this.resumes = res;
        this.cdr.detectChanges();
      
       
      },
      error: () => this.showToast("Could not fetch resumes list. 📂", "error")
    });
}

downloadResume(id: number) {
  this.showToast("Generating your PDF... please wait. ⏳", "info");
  this.resume.downLoadResume(id)
    .subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.profile.username}_Resume.pdf`;
        a.click();
        this.showToast("Resume downloaded! Good luck! 🎯", "success");
      },
      error: () => this.showToast("Error generating PDF.", "error")
    });
}

showToast(msg: string, type: string = 'success') {
  this.toastMessage = msg;
  this.toastType = type;
  this.cdr.detectChanges();
  setTimeout(() => {
    this.toastMessage = '';
    this.cdr.detectChanges();
  }, 4000);
}


resetExtraFields() {
  this.extra = {
    projects: '',
    internships: '',
    summary: '',
    achievements: '',
    bio: ''
  };
}

goBack()
{
   this.router.navigate(["/student"]);
}

isSidebarOpen: boolean = false;

toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }

closeSidebar() { this.isSidebarOpen = false; }

}