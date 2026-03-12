import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-resume-generate',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    linkedin: ''
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

  constructor(private http: HttpClient,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit() {

    const storedEmail = localStorage.getItem('Usermail');

    if (storedEmail) {
      this.email = storedEmail;
      this.profile.email = storedEmail;
    }

    //  user fetch from user table via email --------------------
    this.http
      .get(`${BASE_URL}/api/User/profile?email=` + this.email)
      .subscribe((data: any) => {

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

    this.http
      .get(`${BASE_URL}/api/student/Profile/` + this.userId)
      .subscribe((data: any) => {

        if (data) {
          
          this.profile.phone = data.phone || '';
          this.profile.college = data.college || '';
          this.profile.branch = data.branch || '';
          this.profile.cgpa = data.cgpa || '';
          this.profile.skills = data.skills || '';
          this.profile.github = data.github || '';
          this.profile.linkedin = data.linkedin || '';
          
        }
        this.cdr.detectChanges();
        

      }, error => {

        console.log("Profile not found");

      });

  }



  //for adding resume information in Database--------------------------------
  addResume() {

    const resumeData = {
      ...this.profile,
      ...this.extra
    };

    console.log(resumeData);

    this.http
      .post(`${BASE_URL}/api/student/addResumeInfo/` + this.userId, resumeData)
      .subscribe((res: any) => {

        alert("Resume added Successfully");
       console.log(res);
        

        this.cdr.detectChanges();
      });

  }


  getResume()
  {
    
    this.http
      .get(`${BASE_URL}/api/student/getResume/` + this.userId)
      .subscribe((res: any) => {

        alert("Resume generated Successfully");
         this.resumes=res;

       console.log(res);
        

        this.cdr.detectChanges();
      });
  }


  downloadResume(id:number){

this.http.get(`${BASE_URL}/api/student/downloadResume/${id}`,{
responseType:'blob'
})
.subscribe((res:any)=>{

const blob=new Blob([res],{type:'application/pdf'});

const url=window.URL.createObjectURL(blob);

const a=document.createElement('a');

a.href=url;

a.download="resume.pdf";

a.click();

});

}
}