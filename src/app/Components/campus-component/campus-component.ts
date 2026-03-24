import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BASE_URL } from '../../../Environments/environment';

@Component({
  selector: 'app-campus-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './campus-component.html',
  styleUrl: './campus-component.css',
})
export class CampusComponent {

  selectedFile: File | null = null;
  selectedFileName: string = '';

  toastMessage: string = '';
  showToast: boolean = false;

  job: any = {
    company: '',
    title: '',
    jobType: '',
    industry: '',
    location: '',
    semester: '',
    salaryPackage: '',
    eligibleBranch: '',
    cgpa: '',
    bond: '',
    skillsRequired: '',
    jobDescription: '',
    selectionProcess: '',
    registrationLastDate: '',
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  // Toast
  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }

  //  File
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    } else {
      this.showToastMessage('❌ Only PDF allowed');
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }

  // Submit
  addJob() {

    // 🔥 VALIDATION
    if (!this.job.company) return this.showToastMessage('Company required');
    if (!this.job.title) return this.showToastMessage('Title required');
    if (!this.job.semester) return this.showToastMessage('Select semester');
    if (!this.job.registrationLastDate) return this.showToastMessage('Select date');
    if (!this.job.eligibleBranch) return this.showToastMessage('Enter branch');
    if (!this.job.cgpa) return this.showToastMessage('Enter CGPA');

    if (this.job.cgpa < 0 || this.job.cgpa > 10) {
      return this.showToastMessage('CGPA must be 0–10');
    }

    const formData = new FormData();

    formData.append(
      'job',
      new Blob([JSON.stringify(this.job)], { type: 'application/json' })
    );

    if (this.selectedFile) {
      formData.append('attachment', this.selectedFile);
    }

    this.http.post(`${BASE_URL}/placement/addJob`, formData, {
      observe: 'response'
    })
    .subscribe({
      next: (res: HttpResponse<any>) => {

        if (res.status === 200 || res.status === 201) {
          this.showToastMessage('✅ Job Added Successfully');
          this.resetForm();
        } else {
          this.showToastMessage('⚠️ Unexpected response');
        }

        console.log('Response:', res);
      },

      error: (err: HttpErrorResponse) => {

        if (err.status === 0) {
          this.showToastMessage('❌ Server not reachable');
        } 
        else if (err.status === 400) {
          this.showToastMessage('❌ Bad Request');
        } 
        else if (err.status === 401) {
          this.showToastMessage('❌ Unauthorized');
        } 
        else if (err.status === 403) {
          this.showToastMessage('❌ Forbidden');
        } 
        else if (err.status === 404) {
          this.showToastMessage('❌ API Not Found');
        } 
        else if (err.status === 500) {
          this.showToastMessage('❌ Server Error');
        } 
        else {
          this.showToastMessage('❌ Error: ' + err.message);
        }

        console.error(err);
      }
    });
  }

  //  Reset
  resetForm() {
    this.job = {
      company: '',
      title: '',
      jobType: '',
      industry: '',
      location: '',
      semester: '',
      salaryPackage: '',
      eligibleBranch: '',
      cgpa: '',
      bond: '',
      skillsRequired: '',
      jobDescription: '',
      selectionProcess: '',
      registrationLastDate: '',
    };

    this.selectedFile = null;
    this.selectedFileName = '';
    this.cdr.detectChanges();
  }
}